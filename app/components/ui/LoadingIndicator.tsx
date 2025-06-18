import { Bot } from "lucide-react";
import { motion } from "framer-motion";

const LoadingIndicator = () => {
  return (
    <motion.div
      className="message-container assistant"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="message-wrapper">
        <div className="avatar-container">
          <Bot className="avatar-icon" />
        </div>

        <div className="message-bubble assistant">
          <div className="message-header">
            <span className="sender-label">F1GPT</span>
            <span className="message-time">Thinking...</span>
          </div>

          <div className="loading-content">
            <div className="typing-animation">
              <motion.div
                className="typing-dot"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="typing-dot"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div
                className="typing-dot"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
            </div>
            <span className="loading-text">Analyzing F1 data...</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingIndicator;
