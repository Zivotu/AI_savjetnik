import { useState, useEffect, useRef } from "react";
import { Play, MessageCircle, Mic, Headphones, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import GdprModal from "./GdprModal";
import ContactConfirm from "./ContactConfirm";
import SolutionModal from "./SolutionModal";
import { EviWebAudioPlayer } from "@/utils/eviPlayer";
import { useConversation } from "@elevenlabs/react";
import { toast } from "@/components/ui/sonner";

const COLLECT_TIMEOUT_MS =
  Number(import.meta.env.VITE_COLLECT_TIMEOUT_MS ?? "120000") || 120000;

const DEBUG = import.meta.env.DEV;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addDevLog(tag: string, data: any) {
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
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
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
  const [consentGiven, setConsentGiven] = useState(() =>
    localStorage.getItem("consent") === "yes"
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(() =>
    localStorage.getItem("contactDone") === "yes"
  );

  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionTextState, setSolutionTextState] = useState("");

  const [phase, setPhase] = useState<
    "idle" | "intro" | "collect" | "closing" | "ended"
  >("idle");
  const [activeSpeaker, setActiveSpeaker] = useState<"user" | "agent" | null>(
    null
  );
  const timer = useRef<NodeJS.Timeout>();
  const startAt = useRef(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const eviSocketRef = useRef<WebSocket | null>(null);
  const eviPlayerRef = useRef<EviWebAudioPlayer | null>(null);
  const closingHandled = useRef(false);

  const messagesRef = useRef<Array<{ role: "user" | "assistant"; text: string }>>(
    []
  );
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const conversation = useConversation({
    onConnect: () => addDevLog("onConnect", "spojeno ✅"),
    onDisconnect: () => addDevLog("onDisconnect", "veza prekinuta ❌"),
    onMessage: handleMessage,
    onError: e => addDevLog("onError", e),
  });
  const convRef = useRef(conversation);
  convRef.current = conversation;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMessage(evt: any) {
    addDevLog("onMessage", evt);
    switch (evt.type) {
      case "user_transcript": {
        const txt = evt.user_transcription_event?.user_transcript;
        if (txt) {
          setMessages(m => [...m, { role: "user", text: txt }]);
          setActiveSpeaker("user");
          fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId,
              role: "user",
              text: txt,
              phase,
              mode,
            }),
          }).catch(err => {
            console.error("Agent API request failed", err);
          });
        }
        break;
      }
      case "agent_response": {
        const txt = evt.agent_response_event?.agent_response;
        if (txt) {
          setMessages(m => [...m, { role: "assistant", text: txt }]);
          setActiveSpeaker("agent");
          fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId,
              role: "assistant",
              text: txt,
              phase,
              mode,
            }),
          }).catch(err => {
            console.error("Agent API request failed", err);
          });
        }
        break;
      }
      case "agent_response_correction": {
        const txt = evt.agent_response_correction_event?.agent_response;
        if (txt) {
          setMessages(m =>
            m.length
              ? [...m.slice(0, -1), { ...m[m.length - 1], text: txt }]
              : m
          );
          setActiveSpeaker("agent");
        }
        break;
      }
      default:
      // ignore
    }
  }

  async function finalize() {
    if (closingHandled.current) return;
    closingHandled.current = true;

    const transcript = messagesRef.current
      .map(m => `${m.role === "user" ? "User" : "Agent"}: ${m.text}`)
      .join("\n");

    try {
      const sumRes = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conversation-id": conversationId
        },
        body: JSON.stringify({ transcript, language })
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
          "x-conversation-id": conversationId
        },
        body: JSON.stringify({ summary, language })
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
          mode: "voice"
        })
      });

      setMessages(prev => [...prev, { role: "assistant", text: solutionText }]);

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: solutionText })
      });
      const blob = await ttsRes.blob();
      const url = URL.createObjectURL(blob);
      new Audio(url).play();

      await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, role: "system", text: "CONVO_END", phase: "ended" })
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
      subtitle: "Primarno glasom, uz opciju chata. U ovom demou agent je samo vizualni prikaz.",
      startCall: "Pokreni razgovor",
      switchToChat: "Prebaci na chat",
      mute: "Mute",
      privacy: "Razgovor se snima i transkribira u produkciji. Ovo je demo bez snimanja.",
      learnMore: "Saznaj više",
      steps: ["Uvod", "Pitanja", "Rješenje"]
    },
    en: {
      title: "ONE AI solution for your company in 90 seconds.",
      subtitle: "Primarily voice-based, with chat option. This demo shows only visual representation.",
      startCall: "Start conversation",
      switchToChat: "Switch to chat",
      mute: "Mute",
      privacy: "Conversation is recorded and transcribed in production. This is a demo without recording.",
      learnMore: "Learn more",
      steps: ["Intro", "Questions", "Solution"]
    }
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

    const c = convRef.current;
    if (!c) {
      const err = new Error("Conversation hook nije inicijaliziran");
      addDevLog("startVoice-error", err);
      alert("Nemoguće pokrenuti glasovni razgovor – vidi konzolu.");
      setPhase("idle");
      return;
    }

    const agentId = import.meta.env.VITE_ELEVEN_AGENT_ID!;

    // 2️⃣ zatraži mikrofon i pokreni ElevenLabs STT-TTS (WebRTC uz WebSocket fallback)
    try {
      // tražimo mic dozvolu – ovo baci grešku ako je blokirano
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // ① Pokušaj WebRTC (bolja kvaliteta)
      await c.startSession({ agentId, connectionType: "webrtc" });
      addDevLog("startVoice", "WebRTC spojeno ✅");
    } catch (webrtcErr) {
      addDevLog("webrtc-failed", webrtcErr as Error);

      try {
        // ② Fallback na WebSocket
        await c.startSession({ agentId, connectionType: "websocket" });
        addDevLog("startVoice", "WebSocket spojeno ✅");
      } catch (wsErr) {
        addDevLog("websocket-failed", wsErr as Error);
        alert(
          "Ne mogu se spojiti na ElevenLabs (WebRTC ni WebSocket). Provjeri mrežu ili kontaktiraj podršku."
        );
        setPhase("idle");
        return;
      }
    }

    setPhase("collect");

    // 4️⃣ nakon timeouta finaliziraj
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

    const userTurn = { role: "user" as const, text: input.trim() };
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

    conversation.sendUserMessage(input.trim());
    setActiveSpeaker("user");

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
                {activeSpeaker === "user" && (
                  <Mic className={`w-8 h-8 text-green-500`} />
                )}
                {activeSpeaker === "agent" && (
                  <Headphones className={`w-8 h-8 text-green-500`} />
                )}
                {activeSpeaker === null && (
                  <Lightbulb className="w-8 h-8 text-red-500" />
                )}
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
                      {message.role === "user" ? (language === "hr" ? "Vi" : "You") : "Agent"}
                    </span>
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
                onChange={e => {
                  setInput(e.target.value);
                  conversation.sendUserActivity();
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
      <SolutionModal
        open={solutionOpen}
        solution={solutionTextState}
        language={language}
        onClose={() => setSolutionOpen(false)}
      />
      {DEBUG && (
        <details className="mt-4 text-xs max-h-56 overflow-auto bg-neutral-900 text-white rounded p-2">
          <summary>Debug transkript</summary>
          <pre>{messages.map(m => `${m.role}: ${m.text}`).join("\n")}</pre>
        </details>
      )}
    </div>
  );
};

export default AgentPanel;

