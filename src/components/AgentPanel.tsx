import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  MessageCircle,
  Mic as MicIcon,
  MicOff,
  Volume2,
  VolumeX,
  Headphones as HeadphonesIcon,
  Settings,
  X,
  Send,
  Phone,
  Mail,
  Check,
  ChevronRight,
  Brain,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GdprModal from "./GdprModal";
import ContactConfirm from "./ContactConfirm";
import SolutionModal from "./SolutionModal";
import { EviWebAudioPlayer } from "@/utils/eviPlayer";
import { useConversation } from "@elevenlabs/react";
import { toast } from "@/components/ui/sonner";
import assistantImg from "@/../assets/agent_1.png";

type Turn = { role: "user" | "assistant"; text: string; time: string };

interface ContactInfo {
  email: string;
  phone: string;
}

function TypeWriter({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setShown(text.slice(0, ++i));
      if (i >= text.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [text]);
  return <span>{shown}</span>;
}

const COLLECT_TIMEOUT_MS =
  Number(import.meta.env.VITE_COLLECT_TIMEOUT_MS ?? "120000") || 120000;

const DEBUG = import.meta.env.DEV;

function addDevLog(tag: string, data: unknown) {
  if (!DEBUG) return;
  if (data instanceof Error) {
    console.error(`[${tag}]`, data.message, data);
  } else {
    console.debug(`[${tag}]`, data);
  }
}

interface AgentPanelProps {
  language: "hr" | "en";
}

const AgentPanel = ({ language }: AgentPanelProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Turn[]>([]);
  const [interim, setInterim] = useState<Turn | null>(null);
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [sessionActive, setSessionActive] = useState(false);
  const [conversationId] = useState<string>(() => {
    const stored = localStorage.getItem("convId");
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem("convId", id);
    return id;
  });
  const [gdprOpen, setGdprOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem("consent") === "yes",
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(
    () => localStorage.getItem("contactDone") === "yes",
  );

  const [avatarVisible, setAvatarVisible] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionTextState, setSolutionTextState] = useState("");

  const [phase, setPhase] = useState<
    "idle" | "intro" | "collect" | "closing" | "ended"
  >("idle");
  const [activeSpeaker, setActiveSpeaker] = useState<
    "user" | "assistant" | null
  >(null);

  // Za novi dizajn
  const [isChatActive, setIsChatActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const timer = useRef<NodeJS.Timeout>();
  const startAt = useRef(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const eviSocketRef = useRef<WebSocket | null>(null);
  const eviPlayerRef = useRef<EviWebAudioPlayer | null>(null);
  const closingHandled = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const contactRef = useRef<ContactInfo | null>(null);
  const openContactResolver = useRef<((data?: ContactInfo) => void) | null>(
    null,
  );

  const messagesRef = useRef<Turn[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  function playAudio(data: ArrayBuffer) {
    try {
      const ctx =
        audioCtxRef.current ??
        new (window.AudioContext ||
          (
            window as unknown as {
              webkitAudioContext: typeof AudioContext;
            }
          ).webkitAudioContext)({
          sampleRate: 48_000,
        });
      audioCtxRef.current = ctx;

      if (!(data instanceof ArrayBuffer)) return;

      ctx
        .decodeAudioData(data.slice(0))
        .then((buf) => {
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start();
        })
        .catch((err) => {
          console.warn("[decodeAudioError]", err);
        });
    } catch (err) {
      console.error("[playAudio failed]", err);
    }
  }

  const onAudio = (packet: unknown) => {
    if (mode === "chat") return;
    let buf: ArrayBuffer | null = null;

    if (
      packet &&
      packet instanceof Object &&
      (packet as { constructor: unknown }).constructor === ArrayBuffer
    ) {
      buf = packet as ArrayBuffer;
    } else if (
      typeof packet === "object" &&
      packet !== null &&
      "audio" in packet &&
      typeof (packet as { audio: unknown }).audio === "string"
    ) {
      const str = atob((packet as { audio: string }).audio);
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
      buf = arr.buffer;
    }

    if (buf) {
      addDevLog("onAudio", `${buf.byteLength}B`);
      playAudio(buf);
    } else {
      addDevLog("onAudio", "⏭️ prazan paket");
    }
  };

  const { startSession, sendUserMessage, sendUserActivity } = useConversation({
    onMessage: (m) => {
      setInterim(null);
      setPhase((p) => (p === "intro" && m.source === "user" ? "collect" : p));
      setActiveSpeaker(m.source === "user" ? "user" : "assistant");
      setIsSpeaking(m.source === "ai");
      setIsListening(m.source === "user");

      const msg: Turn = {
        role: m.source === "user" ? "user" : "assistant",
        text: m.message,
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, msg]);
      addDevLog("messages", `ukupno ${messagesRef.current.length + 1}`);

      fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          role: m.source === "user" ? "user" : "assistant",
          text: m.message,
          phase,
          mode,
        }),
      }).catch((err) => {
        console.error("Agent API request failed", err);
      });
    },
    onDebug: (d) => {
      addDevLog("debug", d);
      if (d.type === "tentative_agent_response" && d.response) {
        setInterim({
          role: "assistant",
          text: d.response,
          time: new Date().toLocaleTimeString(),
        });
      }
      if (d.type === "tentative_user_transcript" && d.response) {
        setInterim({
          role: "user",
          text: d.response,
          time: new Date().toLocaleTimeString(),
        });
      }
    },
    onAudio,
    onConnect: () => {
      setPhase("collect");
      setIsChatActive(true);
    },
    onDisconnect: () => {
      setActiveSpeaker(null);
      setAvatarVisible(false);
      setIsSpeaking(false);
      setIsListening(false);
    },
    onError: (e) => console.error("[conversation-error]", e),
    clientTools: {
      openContactConfirm: () => {
        return new Promise<void>((resolve) => {
          openContactResolver.current = (data?: ContactInfo) => {
            if (data) {
              contactRef.current = data;
            }
            resolve();
          };
          setContactOpen(true);
        });
      },
    },
  });

  async function finalize() {
    if (closingHandled.current) return;
    closingHandled.current = true;

    const transcript = messagesRef.current
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    try {
      const sumRes = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conversation-id": conversationId,
        },
        body: JSON.stringify({ transcript, language }),
      });
      if (!sumRes.ok) {
        console.error("Summary API error", sumRes.status, sumRes.statusText);
        toast.error("Greška pri sažimanju");
        return;
      }
      const { summary } = await sumRes.json();

      const solRes = await fetch("/api/solution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conversation-id": conversationId,
        },
        body: JSON.stringify({ summary, language }),
      });
      if (!solRes.ok) {
        console.error("Solution API error", solRes.status, solRes.statusText);
        toast.error("Greška pri rješenju");
        return;
      }
      const sol = await solRes.json();
      if (!sol.solutionText || !sol.cta) {
        console.error("Solution API invalid response", sol);
        toast.error("Greška pri rješenju");
        return;
      }
      const solutionText = `${sol.solutionText}\n${sol.cta}`;

      if (contactRef.current) {
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: contactRef.current.email,
            phone: contactRef.current.phone,
            painPoints: [],
            proposal: solutionText,
          }),
        });
      }

      setSolutionTextState(solutionText);
      setSolutionOpen(true);

      await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          role: "assistant",
          text: solutionText,
          phase: "closing",
          mode: "voice",
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: solutionText,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      addDevLog("messages", `ukupno ${messagesRef.current.length + 1}`);

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: solutionText }),
      });
      const blob = await ttsRes.blob();
      const url = URL.createObjectURL(blob);
      new Audio(url).play();

      await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          role: "system",
          text: "CONVO_END",
          phase: "ended",
        }),
      });
      localStorage.removeItem("convId");
      setPhase("ended");
      setActiveSpeaker(null);
      setIsSpeaking(false);
      setIsListening(false);
    } catch (err) {
      console.error("finalize failed", err);
    }
  }

  const texts = {
    hr: {
      title: "JEDNO AI rješenje",
      subtitle: "za 90 sekundi",
      description:
        "Specijalizirani smo za AI savjetovanje i izgradnju konkretnih rješenja. Ovaj assistant demonstrira kako umjetna inteligencija može transformirati vaše poslovanje.",
      startCall: "Pokreni AI razgovor",
      switchToChat: "Preferiram chat",
      mute: "Mute",
      privacy: (
        <>
          Razgovor se snima i transkribira radi poboljšanja usluge; podaci se
          čuvaju šifrirano i usklađeni su s GDPR-om{" "}
          <a className="underline" href="/privacy">
            Detalji o obradi podataka
          </a>
          .
        </>
      ),
      learnMore: "Saznaj više",
      steps: ["Uvod", "Pitanja", "Rješenje"],
    },
    en: {
      title: "ONE AI solution",
      subtitle: "in 90 seconds",
      description:
        "We are a team specialized in AI consulting and building concrete solutions. This assistant demonstrates how artificial intelligence can transform your business.",
      startCall: "Start AI conversation",
      switchToChat: "Prefer chat",
      mute: "Mute",
      privacy: (
        <>
          Conversation is recorded and transcribed to improve the service; data
          is stored encrypted and compliant with GDPR{" "}
          <a className="underline" href="/privacy">
            Details about data processing
          </a>
          .
        </>
      ),
      learnMore: "Learn more",
      steps: ["Intro", "Questions", "Solution"],
    },
  } as const;

  const currentTexts = texts[language];

  // Track progress based on conversation phase
  useEffect(() => {
    switch (phase) {
      case "intro":
        setCurrentStep(0);
        break;
      case "collect":
        setCurrentStep(1);
        break;
      case "closing":
      case "ended":
        setCurrentStep(2);
        break;
      default:
        break;
    }
  }, [phase]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, interim]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close?.();
    };
  }, []);

  useEffect(() => {
    if (phase === "closing" && !contactSubmitted) {
      setContactOpen(true);
    }
  }, [phase, contactSubmitted]);

  useEffect(() => {
    if (phase !== "collect") return;

    const player = new EviWebAudioPlayer();
    eviPlayerRef.current = player;

    const wsUrl =
      (window.location.protocol === "https:" ? "wss://" : "ws://") +
      window.location.host +
      "/api/evi";
    const ws = new WebSocket(wsUrl);
    eviSocketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.audio_output?.data) {
          setActiveSpeaker("assistant");
          setIsSpeaking(true);
          player.enqueueBase64(data.audio_output.data);
        }
        if (data.event === "user_interruption") {
          player.stop();
          setIsSpeaking(false);
        }
      } catch (err) {
        console.error("Failed to parse EVI message", err);
      }
    };

    ws.onclose = () => {
      player.stop();
      setIsSpeaking(false);
    };

    return () => {
      ws.close();
      player.stop();
    };
  }, [phase]);

  async function startVoice() {
    if (!consentGiven) {
      setGdprOpen(true);
      return;
    }

    await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        role: "user",
        text: "[CALL_STARTED]",
        phase: "intro",
        mode: "voice",
      }),
    });

    setActiveSpeaker("user");
    setPhase("intro");
    setIsChatActive(true);
    startAt.current = Date.now();

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      await startSession({
        agentId: import.meta.env.VITE_ELEVEN_AGENT_ID,
        connectionType: "websocket",
      });
      setSessionActive(true);
      setAvatarVisible(true);

      timer.current = setTimeout(() => {
        setPhase("closing");
        finalize();
      }, COLLECT_TIMEOUT_MS);
    } catch (err) {
      addDevLog("startVoice-error", err as Error);
      alert("Nemoguće pokrenuti glasovni razgovor – vidi konzolu.");
      setPhase("idle");
      setIsChatActive(false);
    }
  }

  function stopVoice() {
    eviSocketRef.current?.close();
    eviPlayerRef.current?.stop?.();
    setSessionActive(false);
    setActiveSpeaker(null);
    setAvatarVisible(false);
    setPhase("idle");
    setIsChatActive(false);
    setIsSpeaking(false);
    setIsListening(false);
  }

  async function handleConsent() {
    setConsentGiven(true);
    localStorage.setItem("consent", "yes");
    setGdprOpen(false);

    await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        role: "system",
        text: "CONSENT_GIVEN",
      }),
    });

    startVoice();
  }

  async function handleSaveContact(email: string, phone: string) {
    openContactResolver.current?.({ email, phone });
    openContactResolver.current = null;

    await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        role: "user",
        text: `CONTACT::${email}|${phone}`,
      }),
    });
    localStorage.setItem("contactDone", "yes");
    setContactSubmitted(true);
    setContactOpen(false);
  }

  async function handleChatSubmit(value: string) {
    if (!value.trim()) return;
    setSending(true);
    const ts = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { role: "user", text: value, time: ts }]);

    if (mode === "voice") {
      await ensureSession();
      sendUserMessage(value);
    } else {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      }).then((r) => r.json());
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
    setSending(false);
  }

  async function ensureSession() {
    if (!sessionActive && mode === "voice") {
      await startSession({
        agentId: import.meta.env.VITE_ELEVEN_AGENT_ID,
        connectionType: "websocket",
      });
      setSessionActive(true);
      setAvatarVisible(true);
    }
  }

  const handleMicToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      sendUserActivity();
    }
  };

  const handleEndChat = () => {
    stopVoice();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animirani pozadinski elementi */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Glavni sadržaj */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isChatActive ? (
            // Landing stranica
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center"
            >
              {/* Hero sekcija */}
              <motion.div
                className="text-center mb-16"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-sm font-medium text-purple-300">
                    🚀 AI rješenja za vašu tvrtku
                  </span>
                </motion.div>

                <motion.h1
                  className="text-6xl md:text-7xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {currentTexts.title}
                  </span>
                  <br />
                  <span className="text-white">{currentTexts.subtitle}</span>
                </motion.h1>

                <motion.p
                  className="text-xl text-gray-300 max-w-2xl mx-auto mb-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentTexts.description}
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={startVoice}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold text-lg shadow-2xl overflow-hidden"
                    data-evt="agent_start_call"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Play className="w-5 h-5" />
                      {currentTexts.startCall}
                    </span>
                  </Button>

                  <button
                    onClick={() => {
                      setMode("chat");
                      setIsChatActive(true);
                    }}
                    className="px-8 py-4 bg-white/10 backdrop-blur-lg rounded-xl text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
                    data-evt="agent_switch_chat"
                  >
                    <span className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5" />
                      {currentTexts.switchToChat}
                    </span>
                  </button>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  className="flex flex-wrap gap-6 justify-center text-sm text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    GDPR usklađeno
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Besplatan prvi odgovor
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Bez obveza
                  </span>
                </motion.div>
              </motion.div>

              {/* Feature cards */}
              <motion.div
                className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {[
                  {
                    icon: Brain,
                    title: "AI analiza",
                    desc: "Napredni algoritmi analiziraju vaše potrebe",
                  },
                  {
                    icon: Sparkles,
                    title: "Brza rješenja",
                    desc: "Konkretni prijedlozi u samo 90 sekundi",
                  },
                  {
                    icon: Phone,
                    title: "Personalizirano",
                    desc: "Rješenja prilagođena vašoj industriji",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                  >
                    <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Sekcija članaka */}
              <motion.section
                className="w-full py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <div className="max-w-7xl mx-auto px-4">
                  <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                  >
                    <h2 className="text-4xl font-bold text-white mb-4">
                      Istražite AI mogućnosti
                    </h2>
                    <p className="text-gray-400 text-lg">
                      Praktični vodići i studije slučaja iz stvarnog svijeta
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        title: "Automatizacija prodajnih procesa s AI",
                        category: "Prodaja",
                        readTime: "5 min",
                        image: "🤖",
                        gradient: "from-blue-600 to-cyan-600",
                        description:
                          "Kako AI može povećati konverziju za 40% kroz personalizaciju",
                        stats: "40% ↑",
                        color: "blue",
                      },
                      {
                        title: "ChatGPT integracija u korisničku podršku",
                        category: "Podrška",
                        readTime: "7 min",
                        image: "💬",
                        gradient: "from-purple-600 to-pink-600",
                        description:
                          "Smanjite vrijeme odgovora na 30 sekundi s AI asistentom",
                        stats: "85% brže",
                        color: "purple",
                      },
                      {
                        title: "Prediktivna analitika za e-commerce",
                        category: "Analitika",
                        readTime: "6 min",
                        image: "📊",
                        gradient: "from-orange-600 to-red-600",
                        description:
                          "Predvidite trendove i optimizirajte zalihe pomoću AI modela",
                        stats: "25% ROI",
                        color: "orange",
                      },
                      {
                        title: "AI u marketingu: Personalizirane kampanje",
                        category: "Marketing",
                        readTime: "8 min",
                        image: "🎯",
                        gradient: "from-green-600 to-teal-600",
                        description:
                          "Kreirajte kampanje koje konvertiraju 3x bolje",
                        stats: "3x ROI",
                        color: "green",
                      },
                      {
                        title: "Glasovni AI asistenti za tvrtke",
                        category: "Voice AI",
                        readTime: "5 min",
                        image: "🎙️",
                        gradient: "from-indigo-600 to-blue-600",
                        description:
                          "Implementacija voice AI rješenja za bolju korisničku uslugu",
                        stats: "24/7",
                        color: "indigo",
                      },
                      {
                        title: "AI-driven SEO optimizacija",
                        category: "SEO",
                        readTime: "6 min",
                        image: "🔍",
                        gradient: "from-pink-600 to-rose-600",
                        description: "Kako AI mijenja SEO strategije u 2024",
                        stats: "60% više prometa",
                        color: "pink",
                      },
                    ].map((article, i) => (
                      <motion.article
                        key={i}
                        className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8 + i * 0.1 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        {/* Grafika članka */}
                        <div
                          className={`relative h-48 bg-gradient-to-br ${article.gradient} p-8 flex items-center justify-center overflow-hidden`}
                        >
                          {/* Pozadinski pattern */}
                          <div className="absolute inset-0 opacity-20">
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                                backgroundSize: "20px 20px",
                              }}
                            />
                          </div>

                          {/* Emoji ikona */}
                          <motion.div
                            className="text-6xl relative z-10"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {article.image}
                          </motion.div>

                          {/* Statistika badge */}
                          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                            <span className="text-white font-bold text-sm">
                              {article.stats}
                            </span>
                          </div>
                        </div>

                        {/* Sadržaj članka */}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium bg-${article.color}-500/20 text-${article.color}-400 border border-${article.color}-500/30`}
                            >
                              {article.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {article.readTime} čitanja
                            </span>
                          </div>

                          <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all">
                            {article.title}
                          </h3>

                          <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            {article.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <button className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 group/btn">
                              Pročitaj više
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>

                        {/* Hover overlay efekt */}
                        <motion.div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </motion.article>
                    ))}
                  </div>

                  {/* Load more button */}
                  <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                  >
                    <button className="px-8 py-3 bg-white/10 backdrop-blur-lg rounded-xl text-white font-medium border border-white/20 hover:bg-white/20 transition-all inline-flex items-center gap-2 group">
                      Prikaži više članaka
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </div>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AgentPanel;
