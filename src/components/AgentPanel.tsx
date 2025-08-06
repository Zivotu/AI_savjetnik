import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GdprModal from "./GdprModal";
import ContactConfirm from "./ContactConfirm";
import SolutionModal from "./SolutionModal";
import VoiceAgentDisplay from "./VoiceAgentDisplay";
import { EviWebAudioPlayer } from "@/utils/eviPlayer";
import { useConversation } from "@elevenlabs/react";
import { toast } from "@/components/ui/sonner";
import brainAI from '@/assets/BrainAI.png';
function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // fallback za starije browsere ili ograničena okruženja
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
  const [currentStep, setCurrentStep] = useState(-1);
  const [messages, setMessages] = useState<Turn[]>([]);
  const [interim, setInterim] = useState<Turn | null>(null);
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [sessionActive, setSessionActive] = useState(false);
  const [conversationId] = useState<string>(() => {
  const stored = localStorage.getItem("convId");
  if (stored) return stored;
  const id = safeRandomUUID(); // ✅ koristimo sigurnu alternativu
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
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionTextState, setSolutionTextState] = useState("");
  const [phase, setPhase] = useState<
    "idle" | "intro" | "collect" | "closing" | "ended"
  >("idle");
  const [activeSpeaker, setActiveSpeaker] = useState<"user" | "agent" | null>(
    null,
  );
  const [micEnabled, setMicEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const timer = useRef<NodeJS.Timeout>();
  const startAt = useRef(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const eviSocketRef = useRef<WebSocket | null>(null);
  const eviPlayerRef = useRef<EviWebAudioPlayer | null>(null);
  const closingHandled = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const contactRef = useRef<ContactInfo | null>(null);
  const openContactResolver = useRef<
    ((data?: ContactInfo) => void) | null
  >(null);
  const messagesRef = useRef<Turn[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const handler = () => setContactOpen(true);
    window.addEventListener("openContactModal", handler);
    return () => window.removeEventListener("openContactModal", handler);
  }, []);

  function playAudio(data: ArrayBuffer) {
    if (mutedRef.current) return;
    try {
      const ctx =
        audioCtxRef.current ??
        new (
          window.AudioContext ||
          (
            window as unknown as {
              webkitAudioContext: typeof AudioContext;
            }
          ).webkitAudioContext
        )({
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
    if (packet instanceof ArrayBuffer) {
      buf = packet;
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
    onMessage: async (m) => {
      setInterim(null);
      setPhase((p) => (p === "intro" && m.source === "user" ? "collect" : p));
      setActiveSpeaker(m.source === "user" ? "user" : "agent");
      const msg: Turn = {
        role: m.source === "user" ? "user" : "assistant",
        text: m.message,
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, msg]);
      addDevLog("messages", `ukupno ${messagesRef.current.length + 1}`);
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            role: m.source === "user" ? "user" : "assistant",
            text: m.message,
            phase,
            mode,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }
        const data = await res.json();
      } catch (err) {
        console.error("Agent API request failed", err);
      }
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
    onConnect: () => setPhase("collect"),
    onDisconnect: () => {
      setActiveSpeaker(null);
    },
    onError: (e) => console.error("[conversation-error]", e),
    clientTools: {
      openContactConfirm: () => {
        return new Promise<ContactInfo | undefined>((resolve) => {
          openContactResolver.current = resolve;
          setContactOpen(true);
        }) as unknown as Promise<string | number | void>;
      },
    },
  });

  async function finalize() {
    if (closingHandled.current) return;
    closingHandled.current = true;
    const transcript = messagesRef.current
      .map((m) => `${m.role === "user" ? "User" : "Agent"}: ${m.text}`)
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
        {
          const res = await fetch("/api/agent", {
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
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`API error ${res.status}: ${text}`);
          }
          const data = await res.json();
        }
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
        {
          const res = await fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId,
              role: "system",
              text: "CONVO_END",
              phase: "ended",
            }),
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`API error ${res.status}: ${text}`);
          }
          const data = await res.json();
        }
        localStorage.removeItem("convId");
      setPhase("ended");
      setActiveSpeaker(null);
    } catch (err) {
      console.error("finalize failed", err);
    }
  }

  const texts = {
    hr: {
      title: "U 90 sekundi do JEDNOG AI rješenja za vašu tvrtku.",
      subtitle:
        "Mi smo tim specijaliziran za AI savjetovanje i izgradnju konkretnih rješenja. Ovaj agent je samo uvod – pokazuje, na svom primjeru, kako umjetna inteligencija može olakšati poslovanje. Prikazana rješenja su brza, okvirna i služe za orijentaciju; za detaljne prijedloge preporučujemo izravan kontakt. Prvi odgovor na svaki upit, e-poštom, potpuno je besplatan.",
      startCall: "Pokreni razgovor",
      switchToChat: "Prebaci na chat",
      mute: "Mute",
      privacy: (
        <>
          Razgovor se snima i transkribira radi poboljšanja usluge; podaci se
          čuvaju šifrirano i usklađeni su s GDPR-om.{' '}
          <a
            className="relative z-20 underline text-white cursor-pointer"
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Detalji o obradi podataka
          </a>
          .
        </>
      ),
      steps: ["Uvod", "Pitanja", "Rješenje"],
    },
    en: {
      title: "ONE AI solution for your company in 90 seconds.",
      subtitle:
        "We are a team specialized in AI consulting and building concrete solutions. This agent is only an introduction – it demonstrates, through its own example, how artificial intelligence can simplify business operations. The presented solutions are quick, approximate, and serve for orientation; for detailed proposals we recommend direct contact. The first reply to every inquiry, by email, is completely free.",
      startCall: "Start conversation",
      switchToChat: "Switch to chat",
      mute: "Mute",
      privacy: (
        <>
          Conversation is recorded and transcribed to improve the service; data
          is stored encrypted and compliant with GDPR.{' '}
          <a
            className="relative z-20 underline text-white cursor-pointer"
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Details about data processing
          </a>
          .
        </>
      ),
      steps: ["Intro", "Questions", "Solution"],
    },
  } as const;

  const currentTexts = texts[language];

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
          setActiveSpeaker("agent");
          player.enqueueBase64(data.audio_output.data);
        }
        if (data.event === "user_interruption") {
          player.stop();
        }
      } catch (err) {
        console.error("Failed to parse EVI message", err);
      }
    };
    ws.onclose = () => {
      player.stop();
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
    const res = await fetch("/api/agent", {
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
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    const data = await res.json();
    setActiveSpeaker("user");
    setPhase("intro");
    startAt.current = Date.now();
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await startSession({
        agentId: import.meta.env.VITE_ELEVEN_AGENT_ID,
        connectionType: "websocket",
      });
      setSessionActive(true);
      timer.current = setTimeout(() => {
        setPhase("closing");
        finalize();
      }, COLLECT_TIMEOUT_MS);
    } catch (err) {
      addDevLog("startVoice-error", err as Error);
      alert("Nemoguće pokrenuti glasovni razgovor – vidi konzolu.");
      setPhase("idle");
    }
  }

  function stopVoice() {
    eviSocketRef.current?.close();
    eviPlayerRef.current?.stop?.();
    setSessionActive(false);
    setActiveSpeaker(null);
    setPhase("idle");
  }

  async function handleConsent() {
    setConsentGiven(true);
    localStorage.setItem("consent", "yes");
    setGdprOpen(false);
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        role: "system",
        text: "CONSENT_GIVEN",
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    const data = await res.json();
    startVoice();
  }

  async function handleSaveContact(email: string, phone: string) {
    openContactResolver.current?.({ email, phone });
    openContactResolver.current = null;
    contactRef.current = { email, phone };
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        role: "user",
        text: `CONTACT::${email}|${phone}`,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    const data = await res.json();
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
    }
  }

  const isChatActive = phase !== "idle";
  const isSpeaking = activeSpeaker === "agent";
  const isListening = activeSpeaker === "user" || micEnabled;
  const handleStartChat = () => (consentGiven ? startVoice() : setGdprOpen(true));
  const handleMicToggle = () =>
    setMicEnabled((p) => {
      if (p) setActiveSpeaker(null);
      return !p;
    });
  const handleMuteToggle = () =>
    setMuted((p) => {
      const next = !p;
      if (next) eviPlayerRef.current?.stop?.();
      return next;
    });
  const handleEndChat = () => {
    stopVoice();
    setMicEnabled(false);
    window.location.reload();
  };

  return (
    <div className="relative rounded-3xl overflow-hidden p-8 h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-pink-500/10 to-blue-500/10 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <VoiceAgentDisplay
          title={currentTexts.title}
          subtitle={currentTexts.subtitle}
          startLabel={currentTexts.startCall}
          isChatActive={isChatActive}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isMuted={muted}
          onStartChat={handleStartChat}
          onMicToggle={handleMicToggle}
          onMuteToggle={handleMuteToggle}
          onEndChat={handleEndChat}
        />
        <div className="flex flex-col h-full">
          <div className="relative h-80 lg:h-96">
            <AnimatePresence mode="wait">
              {phase === "idle" ? (
                <motion.div
                  key="placeholder-image"
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                >
                  <img
                    src={brainAI}
                    alt="BrainAI"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="transcript"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 overflow-y-auto rounded-2xl bg-white/10 backdrop-blur-lg p-4 border border-white/20"
                  ref={transcriptRef}
                >
                  {messages.map((m, i) => (
                    <p
                      key={i}
                      className={`text-sm mb-1 ${
                        m.role === "user" ? "text-blue-300" : "text-white"
                      }`}
                    >
                      <TypeWriter text={m.text} />
                    </p>
                  ))}
                  {interim && (
                    <p className="text-xs italic text-slate-300">{interim.text}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {mode === "chat" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;
                handleChatSubmit(input.trim());
                setInput("");
              }}
              className="mt-4 flex items-center space-x-2"
            >
              <input
                className="w-full bg-white/60 rounded-lg px-4 py-3 text-sm text-black placeholder:text-slate-500"
                placeholder={
                  language === "hr" ? "Napišite poruku..." : "Type a message..."
                }
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  sendUserActivity();
                }}
                disabled={mode !== "chat" || sending}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-50"
                disabled={!input.trim() || sending}
              >
                Send
              </button>
            </form>
          )}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {currentTexts.steps.map((step, index) => (
                <span
                  key={index}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-smooth ${
                    index === currentStep
                      ? "bg-blue-600 text-white"
                      : index < currentStep
                      ? "bg-purple-600 text-white"
                      : "bg-white/30 text-slate-300"
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 text-xs text-slate-300 mt-6 text-center">
        <p className="mb-1">{currentTexts.privacy}</p>
      </div>
      <GdprModal
        open={gdprOpen}
        onAccept={handleConsent}
        onClose={() => setGdprOpen(false)}
      />
      <ContactConfirm
        open={contactOpen}
        onSave={handleSaveContact}
        onClose={() => setContactOpen(false)}
        onDecline={() => {
          openContactResolver.current?.();
          openContactResolver.current = null;
          localStorage.setItem("contactDone", "yes");
          setContactSubmitted(true);
          setContactOpen(false);
        }}
      />
      <SolutionModal
        open={solutionOpen}
        solution={solutionTextState}
        language={language}
        onClose={() => setSolutionOpen(false)}
      />
    </div>
  );
};

export default AgentPanel;