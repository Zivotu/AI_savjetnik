import agentImg from '../../assets/agent_1.png';


interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
}

const AnimatedAvatar: React.FC<Props> = ({ isListening, isSpeaking, isThinking }) => (
  <div className="relative w-32 h-32">
    {isListening && <div className="absolute inset-0 animate-ping bg-blue-400 rounded-full opacity-20" />}
    {isSpeaking && <div className="absolute inset-2 animate-pulse bg-purple-400 rounded-full opacity-30" />}
    <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 p-1">
      <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center">
        {isThinking ? (
          <div className="flex space-x-1">
            {[0, 150, 300].map((d) => (
              <div
                key={d}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </div>
        ) : (
          <img src={agentImg} alt="AI" className="w-20 h-20 rounded-full" />
        )}
      </div>
    </div>
    {(isListening || isSpeaking) && (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex space-x-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full animate-pulse"
            style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    )}
  </div>
);

export default AnimatedAvatar;
