import TypeWriter from "@/components/TypeWriter";

interface Props {
  message: { role: string; text: string; time: string };
  isInterim: boolean;
}

const MessageBubble: React.FC<Props> = ({ message, isInterim }) => {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-lg
          ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto"
              : "bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200"
          }
          ${isInterim ? "opacity-60 animate-pulse" : "animate-slideIn"}`}
      >
        <p className="text-sm leading-relaxed">
          {isInterim ? <span className="italic">{message.text}</span> : <TypeWriter text={message.text} />}
        </p>
        <span className="text-xs opacity-70 mt-1 block">{message.time}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
