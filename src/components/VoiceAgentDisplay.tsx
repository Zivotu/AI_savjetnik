import { motion, AnimatePresence } from "framer-motion";
import { Play, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";

interface VoiceAgentDisplayProps {
  title: string;
  subtitle: string;
  startLabel: string;
  isChatActive: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isMuted: boolean;
  onStartChat: () => void;
  onMicToggle: () => void;
  onMuteToggle: () => void;
  onEndChat: () => void;
}

export default function VoiceAgentDisplay({
  title,
  subtitle,
  startLabel,
  isChatActive,
  isSpeaking,
  isListening,
  isMuted,
  onStartChat,
  onMicToggle,
  onMuteToggle,
  onEndChat,
}: VoiceAgentDisplayProps) {
  // local state for status text
  const statusText = isListening
    ? "🎤 Slušam..."
    : isSpeaking
      ? "🔊 Govorim..."
      : "💭 Razmišljam...";

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!isChatActive ? (
          <motion.div
            key="start-screen"
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="text-slate-300 text-lg mb-12 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {subtitle}
            </motion.p>
            <motion.button
              onClick={onStartChat}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl px-12 py-6 rounded-2xl flex items-center gap-4 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Play className="w-7 h-7" />
              </motion.div>
              {startLabel}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="chat-screen"
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="absolute -top-4 left-0 text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bubi
            </span>
            <div className="relative mb-8">
              <motion.div
                className="relative w-48 h-48 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl flex items-center justify-center"
                animate={{ rotateY: isSpeaking ? [0, 5, -5, 0] : 0 }}
                transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
              >
                <AnimatePresence>
                  {isSpeaking && (
                    <>
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border-2 border-blue-400/60"
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{
                            scale: [1, 1.2 + i * 0.1, 1.4 + i * 0.1],
                            opacity: [0.8, 0.4, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/30 to-pink-500/30"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.1, opacity: [0.3, 0.7, 0.3] }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl shadow-xl"
                  animate={{
                    scale: isSpeaking ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
                >
                  🤖
                </motion.div>

                <motion.div
                  className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {isListening && (
                  <motion.div
                    className="absolute top-4 left-4 w-6 h-6 bg-red-500 rounded-full border-3 border-white shadow-lg"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </div>

            <div className="flex gap-6 mb-8">
              <motion.button
                onClick={onMicToggle}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-white/20 backdrop-blur-lg border border-white/20 text-white hover:bg-white/30"
                }`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  boxShadow: isListening
                    ? [
                        "0 0 0 0 rgba(239, 68, 68, 0.7)",
                        "0 0 0 10px rgba(239, 68, 68, 0)",
                        "0 0 0 0 rgba(239, 68, 68, 0)",
                      ]
                    : "none",
                }}
                transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>

              <motion.button
                onClick={onMuteToggle}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/30 transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </motion.button>

              <motion.button
                onClick={onEndChat}
                className="w-16 h-16 rounded-full bg-red-500/80 backdrop-blur-lg border border-red-400/20 text-white flex items-center justify-center shadow-lg hover:bg-red-500 transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <motion.p
              className="text-slate-300 text-center mt-4 text-sm"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {statusText}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
