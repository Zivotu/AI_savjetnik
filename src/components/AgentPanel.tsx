import { useState, useEffect, useRef } from "react";
import { Play, MessageCircle, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startSttStream } from "@/utils/voice";
import GdprModal from "./GdprModal";
import ContactConfirm from "./ContactConfirm";

interface AgentPanelProps {
  language: "hr" | "en";
}

const AgentPanel = ({ language }: AgentPanelProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Array<{ type: "agent" | "user"; text: string; time: string }>>([]);
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [conversationId] = useState<string>(() => {
    const stored = localStorage.getItem("convId");
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem("convId", id);
    return id;
  });
  const [gdprOpen, setGdprOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(() => localStorage.getItem("consent") === "yes");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(() => localStorage.getItem("contactDone") === "yes");

  const [phase, setPhase] = useState<"idle" | "intro" | "collect" | "closing" | "ended">("idle");
  const timer = useRef<NodeJS.Timeout>();
  const startAt = useRef(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const texts = {
    hr: {
      title: "U 90 sekundi do JEDNOG AI rješenja za vašu tvrtku.",
      subtitle: "Primarno glasom, uz opciju chata. U ovom demou agent je samo vizualni prikaz.",
      startCall: "Pokreni razgovor",
      switchToChat: "Prebaci na chat",
      mute: "Mute",
      privacy: "Razgovor se snima i transkribira u produkciji. Ovo je demo bez snimanja.",
      learnMore: "Saznaj više",
      steps: ["Uvod", "Pitanja", "Rješenje"],
      demoMessages: [
        "Bok! Primjer 1: AI može automatski izraditi ponudu iz e‑mail upita.",
        "Primjer 2: Sažimanje računa u tablicu bez ručnog pretipkavanja.",
        "Koje su najveće repetitivne zadatke u vašoj tvrtki?",
        "Koristite li već neke automatizacije u poslovanju?"
      ]
    },
    en: {
      title: "ONE AI solution for your company in 90 seconds.",
      subtitle: "Primarily voice-based, with chat option. This demo shows only visual representation.",
      startCall: "Start conversation",
      switchToChat: "Switch to chat",
      mute: "Mute",
      privacy: "Conversation is recorded and transcribed in production. This is a demo without recording.",
      learnMore: "Learn more",
      steps: ["Intro", "Questions", "Solution"],
      demoMessages: [
        "Hello! Example 1: AI can automatically create quotes from email inquiries.",
        "Example 2: Summarizing invoices into tables without manual retyping.",
        "What are the biggest repetitive tasks in your company?",
        "Do you already use any automation in your business?"
      ]
    }
  } as const;

  const currentTexts = texts[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 3);
    }, 5000);

    const messageInterval = setInterval(() => {
      setMessages(prev => {
        if (prev.length >= currentTexts.demoMessages.length) return prev;
        const newMessage = {
          type: "agent" as const,
          text: currentTexts.demoMessages[prev.length],
          time: new Date().toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })
        };
        return [...prev, newMessage];
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [currentTexts.demoMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "closing" && !contactSubmitted) {
      setContactOpen(true);
    }
  }, [phase, contactSubmitted]);

  async function startVoice() {
    if (!consentGiven) {
      setGdprOpen(true);
      return;
    }

    setPhase("collect");
    startAt.current = Date.now();

    const stopStt = startSttStream(
      import.meta.env.VITE_ELEVENLABS_API_KEY,
      async (userText) => {
        await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, role: "user", text: userText, mode: "voice" })
        });

        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, text: userText, language })
        });
        const { reply } = await chatRes.json();

        await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            role: "assistant",
            text: reply,
            mode: "voice"
          })
        });

        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: reply,
            voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID
          })
        });
        const audioBlob = await ttsRes.blob();
        const url = URL.createObjectURL(audioBlob);
        new Audio(url).play();

        setMessages(prev => [
          ...prev,
          { type: "user" as const, text: userText, time: new Date().toLocaleTimeString() },
          { type: "agent" as const, text: reply, time: new Date().toLocaleTimeString() }
        ]);
      }
    );

    timer.current = setTimeout(() => {
      stopStt();
      setPhase("closing");
    }, 175000);
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
        text: "CONSENT_GIVEN"
      })
    });

    // sada pokreni voice
    startVoice();
  }

  async function handleSaveContact(email: string, phone: string) {
    await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        conversationId,
        role: "user",
        text: `CONTACT::${email}|${phone}`
      })
    });
    localStorage.setItem("contactDone","yes");
    setContactSubmitted(true);
    setContactOpen(false);
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);

    const userTurn = { type: "user" as const, text: input.trim(), time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userTurn]);

    await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        role: "user",
        text: input.trim(),
        mode: "chat"
      })
    });

    const chatRes = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        text: input.trim(),
        language
      })
    });
    const { reply } = await chatRes.json();

    const assistantTurn = { type: "agent" as const, text: reply, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, assistantTurn]);

    setInput("");
    setSending(false);
  };

  return (
    <div className="glass-strong rounded-3xl p-8 shadow-medium h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="ai-orb w-24 h-24 shadow-glow relative">
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
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
              onClick={() => setMode("chat")}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{currentTexts.switchToChat}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Transkript</h3>
            <button
              className="flex items-center justify-center bg-white/50 text-foreground p-2 rounded-lg border border-white/30 hover:bg-white/70 transition-smooth"
              data-evt="agent_mute"
              disabled
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
          {phase === "collect" && (
            <p className="text-xs text-muted">🎙️ Snimamo…</p>
          )}

          <div className="flex-1 bg-white/30 rounded-2xl p-4 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium">
                      {message.type === "user" ? (language === "hr" ? "Vi" : "You") : "Agent"}
                    </span>
                    <span className="text-xs text-muted-foreground">{message.time}</span>
                  </div>
                  <p className="text-sm text-foreground bg-white/40 rounded-lg p-3 animate-fade-in">
                    {message.text}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          {mode === "chat" && (
            <form onSubmit={onSubmit} className="mt-4 flex items-center space-x-2">
              <input
                className="w-full bg-white/60 rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground"
                placeholder={language === "hr" ? "Napišite poruku..." : "Type a message..."}
                value={input}
                onChange={e => setInput(e.target.value)}
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
        <button className="text-xs underline text-muted" onClick={() => setContactOpen(true)}>
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
      />
    </div>
  );
};

export default AgentPanel;
