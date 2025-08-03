import { Play, MicIcon, MessageCircle, Send } from "lucide-react";

interface Props {
  phase: string;
  mode: "voice" | "chat";
  startVoice: () => void;
  stopVoice: () => void;
  setMode: (m: "voice" | "chat") => void;
  input: string;
  setInput: (s: string) => void;
  sending: boolean;
  handleChatSubmit: (e: React.FormEvent) => void;
}

const ControlPanel: React.FC<Props> = ({
  phase,
  mode,
  startVoice,
  stopVoice,
  setMode,
  input,
  setInput,
  sending,
  handleChatSubmit,
}) => (
  <div className="flex flex-col items-center space-y-6">
    <button
      onClick={() => (phase === "idle" ? startVoice() : stopVoice())}
      className={`relative group w-20 h-20 rounded-full transition-all duration-300 shadow-2xl transform
        ${
          phase === "idle"
            ? "bg-gradient-to-r from-green-400 to-blue-500 hover:scale-110"
            : "bg-gradient-to-r from-red-400 to-pink-500 hover:scale-95"
        }`}
    >
      <div className="absolute inset-0 rounded-full bg-black/20 backdrop-blur-sm" />
      {phase === "idle" ? (
        <Play className="w-8 h-8 text-white absolute inset-0 m-auto" />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
      )}
    </button>

    <div className="text-center">
      {phase === "idle" && <p className="text-sm font-medium text-gray-700">Spremno za razgovor</p>}
      {phase === "intro" && <p className="text-sm font-medium text-gray-700">Povezivanje...</p>}
      {phase === "collect" && <p className="text-sm font-medium text-gray-700">Slušam vas...</p>}
      {phase === "closing" && <p className="text-sm font-medium text-gray-700">Pripremam rješenje...</p>}
    </div>

    <div className="flex bg-white/50 backdrop-blur-sm rounded-full p-1">
      <button
        onClick={() => setMode("voice")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all
          ${mode === "voice" ? "bg-white text-gray-800 shadow-md" : "text-gray-600 hover:text-gray-800"}`}
      >
        <MicIcon className="w-4 h-4 inline mr-1" />
        Govor
      </button>
      <button
        onClick={() => setMode("chat")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all
          ${mode === "chat" ? "bg-white text-gray-800 shadow-md" : "text-gray-600 hover:text-gray-800"}`}
      >
        <MessageCircle className="w-4 h-4 inline mr-1" />
        Chat
      </button>
    </div>

    {mode === "chat" && (
      <form onSubmit={handleChatSubmit} className="w-full max-w-sm">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Napišite poruku..."
            className="w-full px-4 py-3 pr-12 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-purple-400 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center disabled:opacity-50 hover:scale-110 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    )}
  </div>
);

export default ControlPanel;
