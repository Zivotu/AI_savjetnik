import { useState, useEffect, useRef } from "react";
import { Play, MessageCircle, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import GdprModal from "./GdprModal";
import ContactConfirm from "./ContactConfirm";
import { EviWebAudioPlayer } from "@/utils/eviPlayer";
import { useConversation } from "@elevenlabs/react";
import { toast } from "@/components/ui/sonner";

const COLLECT_TIMEOUT_MS =
  Number(import.meta.env.VITE_COLLECT_TIMEOUT_MS ?? "120000") || 120000;

interface AgentPanelProps {
  language: "hr" | "en";
}

const AgentPanel = ({ language }: AgentPanelProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<
    Array<{ type: "agent" | "user"; text: string; time: string }>
  >([]);
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [conversationId] = useState<string>(() => {
    const stored = localStorage.getItem("convId");
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem("convId", id);
    return id;
  });
  const [gdprOpen, setGdprOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem("consent") === "yes"
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(
    () => localStorage.getItem("contactDone") === "yes"
  );

  const [phase, setPhase] = useState<
    "idle" | "intro" | "collect" | "closing" | "ended"
  >("idle");
  const timer = useRef<NodeJS.Timeout>();
  const startAt = useRef(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const eviSocketRef = useRef<WebSocket | null>(null);
  const eviPlayerRef = useRef<EviWebAudioPlayer | null>(null);
  const closingHandled = useRef(false);

  const messagesRef = useRef<
    Array<{ type: "agent" | "user"; text: string; time: string }>
  >([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ─── ElevenLabs React-SDK hook ─────────────────────────────
  const { startSession } = useConversation({
    onMessage: (m) => {
      setMessages((prev) => [
        ...prev,
        {
          type: m.source === "user" ? "user" : "agent",
          text: m.message,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    },
  });

  async function finalize() {
    if (closingHandled.current) return;
    closingHandled.current = true;

    const transcript = messagesRef.current
      .map((m) => `${m.type === "user" ? "User" : "Agent"}: ${m.text}`)
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
      const solutionText = `${sol.solutionText}\n${sol.cta}`;

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
        { type: "agent", text: solutionText, time: new Date().toLocaleTimeString() },
      ]);

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
      setPhase("ended");
    } catch (err) {
      console.error("finalize failed", err);
    }
  }

  const texts = {
    hr: {
      title: "U 90 sekundi do JEDNOG AI rješenja za vašu tvrtku.",
      subtitle:
        "Primarno glasom, uz opciju chata. U ovom demou agent je samo vizualni prikaz.",
      startCall: "Pokreni razgovor",
      switchToChat: "Prebaci na chat",
      mute: "Mute",
      privacy:
        "Razgovor se snima i transkribira u produkciji. Ovo je demo bez snimanja.",
      learnMore: "Saznaj više",
      steps: ["Uvod", "Pitanja", "Rješenje"],
    },
    en: {
      title: "ONE AI solution for your company in 90 seconds.",
      subtitle:
        "Primarily voice-based, with chat option. This demo shows only visual representation.",
      startCall: "Start conversation",
      switchToChat: "Switch to chat",
      mute: "Mute",
      privacy:
        "Conversation is recorded and transcribed in production. This is a demo without recording.",
      learnMore: "Learn more",
      steps: ["Intro", "Questions", "Solution"],
    },
  } as const;
  const currentTexts = texts[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

    // 1️⃣ Pošalji intro-turn
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

    setPhase("collect");
    startAt.current = Date.now();

    // 2️⃣ Zatraži mikrofon
    await navigator.mediaDevices.getUserMedia({ audio: true });

    // 3️⃣ Pokreni ElevenLabs sesiju
    await startSession({
      agentId: import.meta.env.VITE_ELEVEN_AGENT_ID,
      connectionType: "webrtc",
    });

    // 4️⃣ Nakon timeouta zatvori i finaliziraj
    timer.current = setTimeout(() => {
      setPhase("closing");
      finalize();
    }, COLLECT_TIMEOUT_MS);
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

    startVoice();
  }

  async function handleSaveContact(email: string, phone: string) {
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);

    const userTurn = {
      type: "user" as const,
      text: input.trim(),
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userTurn]);

    await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        role: "user",
        text: input.trim(),
        mode: "chat",
      }),
    });

    const chatRes = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, text: input.trim(), language }),
    });
    const { reply } = await chatRes.json();

    const assistantTurn = {
      type: "agent" as const,
      text: reply,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, assistantTurn]);

    setInput("");
    setSending(false);
  };

  return (
    <div className="glass-strong rounded-3xl p-8 shadow-medium h-full">
      {/* … OVAKO … */}
      {/* originalni JSX bez promjena */}
      <div ref={bottomRef} />
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
