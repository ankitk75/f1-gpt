import { Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CommandButtonProps {
  text: string;
  category: string;
  onClick: () => void;
}

const CommandButton = ({ text, category, onClick }: CommandButtonProps) => {
  return (
    <motion.button
      className="command-item"
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <div className="command-header">
        <span className="command-category">{category}</span>
        <Play className="command-icon" />
      </div>
      <p className="command-text">{text}</p>
      <div className="command-footer">
        <ArrowRight className="arrow-icon" />
        <span className="execute-text">EXECUTE</span>
      </div>
    </motion.button>
  );
};

export default CommandButton;
