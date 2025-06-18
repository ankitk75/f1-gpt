import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface InputSectionProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const InputSection = ({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: InputSectionProps) => {
  return (
    <motion.div
      className="input-section"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <form onSubmit={onSubmit} className="input-form">
        <div className="input-container">
          <input
            className="message-input"
            onChange={onInputChange}
            value={input}
            placeholder="Ask me anything about Formula One..."
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            className="submit-button"
            disabled={isLoading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Send className="submit-icon" />
            <span className="button-text">TRANSMIT</span>
          </motion.button>
        </div>
      </form>
      <div className="input-footer">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>Secure F1 data channel established</span>
        </div>
      </div>
    </motion.div>
  );
};

export default InputSection;
