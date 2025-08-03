import { useState } from "react";
import AnimatedAvatar from "./AnimatedAvatar";
import MessageBubble from "./MessageBubble";
import ControlPanel from "./ControlPanel";
import { useConversation } from "@/hooks/useConversation";

interface Turn {
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface AgentPanelProps {
  language: "hr" | "en";
}

interface ConversationMessage {
  message: string;
  source: "user" | "ai";
  type?: string;
  function?: { name?: string };
}

const AgentPanel: React.FC<AgentPanelProps> = () => {
  const [phase, setPhase] = useState<"idle" | "intro" | "collect" | "closing" | "ended">("idle");
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [messages, setMessages] = useState<Turn[]>([]);
  const [interim, setInterim] = useState<Turn | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<"user" | "agent" | null>(null);

  const { startSession, endSession, sendUserMessage } = useConversation({
    onMessage: async (m: ConversationMessage) => {
      if (m.type === "function" && m.function?.name === "end_call") {
        await endSession();
        setPhase("ended");
        return;
      }
      setInterim(null);
      setPhase((p) => (p === "intro" && m.source === "user" ? "collect" : p));
      setActiveSpeaker(m.source === "user" ? "user" : "agent");
      setMessages((prev) => [
        ...prev,
        {
          role: m.source === "user" ? "user" : "assistant",
          text: m.message,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    },
    onDebug: (d) => {
      if (d.type === "tentative_agent_response" && d.response) {
        setInterim({ role: "assistant", text: d.response, time: new Date().toLocaleTimeString() });
      }
      if (d.type === "tentative_user_transcript" && d.response) {
        setInterim({ role: "user", text: d.response, time: new Date().toLocaleTimeString() });
      }
    },
    onConnect: () => setPhase("collect"),
    onDisconnect: () => setActiveSpeaker(null),
    onError: (e) => console.error("[conversation-error]", e),
  });

    const finalize = async (url: string) => {
      const audio = new Audio(url);
      audio.play();
      audio.onended = async () => {
        await endSession();
        setPhase("ended");
        localStorage.removeItem("convId");
      };
    };

  const startVoice = async () => {
    await startSession({
      agentId: import.meta.env.VITE_ELEVEN_AGENT_ID,
      connectionType: "webrtc",
    });
    setPhase("intro");
  };

  const stopVoice = async () => {
    await endSession();
    setPhase("idle");
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    const msg: Turn = { role: "user", text: input.trim(), time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, msg]);
    sendUserMessage(input.trim());
    setInput("");
    setSending(false);
  };

  return (
    <div className="glass-strong rounded-3xl p-8 shadow-2xl h-full bg-gradient-to-br from-gray-50/90 to-white/90 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row gap-8 h-full">
        <div className="md:w-1/3 flex flex-col items-center space-y-6">
          <AnimatedAvatar
            isListening={phase === "collect" && activeSpeaker === "user"}
            isSpeaking={phase !== "ended" && activeSpeaker === "agent"}
            isThinking={phase === "closing"}
          />
          <ControlPanel
            phase={phase}
            mode={mode}
            startVoice={startVoice}
            stopVoice={stopVoice}
            setMode={setMode}
            input={input}
            setInput={setInput}
            sending={sending}
            handleChatSubmit={handleChatSubmit}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} isInterim={false} />
          ))}
          {interim && <MessageBubble message={interim} isInterim />}
        </div>
      </div>
    </div>
  );
};

export default AgentPanel;
