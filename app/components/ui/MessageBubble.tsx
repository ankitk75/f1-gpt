import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: {
    content: string;
    role: "user" | "assistant" | "system" | "data";
  };
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { content, role } = message;

  if (role === "system" || role === "data") {
    return null;
  }

  return (
    <motion.div
      className={`message-container ${role}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="message-wrapper">
        {/* Removed avatar-container section completely */}

        <div className={`message-bubble ${role}`}>
          <div className="message-header">
            <span className="sender-label">
              {role === "user" ? "You" : "F1GPT"}
            </span>
            <span className="message-time">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="message-content">
            {role === "assistant" ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p>{content}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
