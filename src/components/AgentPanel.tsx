import { useEffect, useRef, useState } from "react";
import {
  Play,
  MessageCircle,
  Mic as MicIcon,
  Headphones as HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GdprModal from "./GdprModal";
import ContactConfirm from "./ContactConfirm";
import SolutionModal from "./SolutionModal";
import { EviWebAudioPlayer } from "@/utils/eviPlayer";
import { useConversation } from "@elevenlabs/react";
import { toast } from "@/components/ui/sonner";
import agentImg from "@/../assets/agent_1.png";

type Turn = { role: "user" | "assistant"; text: string; time: string };

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
  const [activeSpeaker, setActiveSpeaker] = useState<"user" | "agent" | null>(
    null,
  );
  const timer = useRef<NodeJS.Timeout>();
  const startAt = useRef(0);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const eviSocketRef = useRef<WebSocket | null>(null);
  const eviPlayerRef = useRef<EviWebAudioPlayer | null>(null);
  const closingHandled = useRef(false);
  // Web-Audio za ElevenLabs TTS
  const audioCtxRef = useRef<AudioContext | null>(null);
  const contactRef = useRef<{ email: string; phone: string } | null>(null);
  const openContactResolver = useRef<(() => void) | null>(null);

  const messagesRef = useRef<Turn[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  function playAudio(data: ArrayBuffer) {
    try {
      // init ili uzmi postojeći kontekst
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

      if (!(data instanceof ArrayBuffer)) return; // safety-guard

      // pokušaj dekodirati, fallback ako ne uspije
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
    // ⚠️ ElevenLabs preko WebSocketa katkad šalje “ping” frame ili JSON –
    //    provjeri i pretvori u ArrayBuffer samo ako ima audio.
    let buf: ArrayBuffer | null = null;

    if (packet instanceof ArrayBuffer) {
      buf = packet; // WebRTC varianta – sirovi PCM/Opus
    } else if (
      typeof packet === "object" &&
      packet !== null &&
      "audio" in packet &&
      typeof (packet as { audio: unknown }).audio === "string"
    ) {
      // { audio: "base64..." }  – WS varianta
      const str = atob((packet as { audio: string }).audio);
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
      buf = arr.buffer;
    }

    if (buf) {
      addDevLog("onAudio", `${buf.byteLength}B`);
      playAudio(buf);
    } else {
      // tih paket ignoriramo da ne rušimo UI
      addDevLog("onAudio", "⏭️ prazan paket");
    }
  };

  const { startSession, sendUserMessage, sendUserActivity } = useConversation({
    onMessage: (m) => {
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
    onConnect: () => setPhase("collect"),
    onDisconnect: () => {
      setActiveSpeaker(null);
      setAvatarVisible(false);
    },
    onError: (e) => console.error("[conversation-error]", e),
    clientTools: {
      openContactConfirm: () => {
        setContactOpen(true);
        return new Promise<void>((resolve) => {
          openContactResolver.current = () => {
            resolve();
          };
        }) as unknown as any; // <= satisfy lib typing
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
            painPoints: [], // can be filled later
            proposal: solutionText, // NEW – agent’s suggestion
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

  // Track progress based on the conversation phase
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

    // 1️⃣ pošalji intro-turn backendu
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
    startAt.current = Date.now();

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      await startSession({
        agentId: import.meta.env.VITE_ELEVEN_AGENT_ID,
        connectionType: "websocket",
      });
      setSessionActive(true);
      setAvatarVisible(true);

      // 4️⃣ nakon timeouta finaliziraj
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
    setAvatarVisible(false);
    setPhase("idle");
  }

  async function handleConsent() {
    setConsentGiven(true);
    localStorage.setItem("consent", "yes");
    setGdprOpen(false);

    // logiraj backend
    await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        role: "system",
        text: "CONSENT_GIVEN",
      }),
    });

    // sada pokreni voice
    startVoice();
  }

  async function handleSaveContact(email: string, phone: string) {
    // reply to openContactConfirm, if waiting
    openContactResolver.current?.();
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
    contactRef.current = { email, phone };
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

  return (
    <div className="glass-strong rounded-3xl p-8 shadow-medium h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="ai-orb w-24 h-24 shadow-glow relative">
              <div className="absolute inset-0 flex items-center justify-center z-10 space-x-4">
                <MicIcon
                  className={`w-6 h-6 ${
                    activeSpeaker === "user" && mode === "voice"
                      ? "animate-pulse text-white"
                      : "text-white"
                  }`}
                />
                <HeadphonesIcon
                  className={`w-6 h-6 ${
                    activeSpeaker === "agent" && mode === "voice"
                      ? "animate-pulse text-white"
                      : "text-white"
                  }`}
                />
                <img
                  src={agentImg}
                  alt="AI agent"
                  className={`w-12 h-12 rounded-full ml-4 transition-opacity duration-500 ${
                    avatarVisible ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
              {currentTexts.title}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">
              {currentTexts.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button
              className="flex items-center justify-center space-x-2 bg-gradient-primary text-white px-6 py-3 rounded-xl font-medium shadow-medium hover:shadow-strong transition-smooth hover:scale-105"
              data-evt="agent_start_call"
              disabled={phase !== "idle"}
              onClick={() => (consentGiven ? startVoice() : setGdprOpen(true))}
            >
              <Play className="w-4 h-4" />
              <span>{currentTexts.startCall}</span>
            </Button>
            <button
              className="flex items-center justify-center space-x-2 bg-white/50 text-foreground px-4 py-3 rounded-xl font-medium border border-white/30 hover:bg-white/70 transition-smooth"
              data-evt="agent_switch_chat"
              onClick={() => {
                if (mode === "voice") {
                  stopVoice();
                  setMode("chat");
                } else {
                  setMode("voice");
                  startVoice();
                }
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{currentTexts.switchToChat}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Transkript
            </h3>
          </div>
          {phase === "collect" && messages.length === 0 && (
            <p className="text-xs opacity-60">🎙️ Snimamo…</p>
          )}

          <div
            className="h-72 lg:h-80 overflow-y-auto rounded-lg"
            ref={transcriptRef}
          >
            {messages.map((m, i) => (
              <p
                key={i}
                className={`text-sm mb-1 ${
                  m.role === "user"
                    ? "text-neutral-500"
                    : "text-neutral-900"
                }`}
              >
                <TypeWriter text={m.text} />
              </p>
            ))}
            {interim && (
              <p className="text-xs italic opacity-60">{interim.text}</p>
            )}
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
                className="w-full bg-white/60 rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground"
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
                className="bg-gradient-primary text-white rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-50"
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
                      ? "bg-primary text-primary-foreground"
                      : index < currentStep
                        ? "bg-accent text-accent-foreground"
                        : "bg-white/30 text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="h-2 bg-gradient-primary rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {contactSubmitted && (
        <button
          className="text-xs underline text-black"
          onClick={() => setContactOpen(true)}
        >
          Uredi kontakt
        </button>
      )}

      <div className="text-xs text-muted-foreground mt-6 text-center">
        <p className="mb-1">{currentTexts.privacy}</p>
        <button className="text-primary hover:underline font-medium">
          {currentTexts.learnMore}
        </button>
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
      {DEBUG && (
        <details className="mt-4 text-xs max-h-56 overflow-auto bg-neutral-900 text-white rounded p-2">
          <summary>Debug transkript</summary>
          <pre>{messages.map((m) => `${m.role}: ${m.text}`).join("\n")}</pre>
        </details>
      )}
    </div>
  );
};

export default AgentPanel;
