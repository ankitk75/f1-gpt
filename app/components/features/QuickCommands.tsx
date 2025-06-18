import CommandButton from "./CommandButton";
import { motion } from "framer-motion";

interface QuickCommandsProps {
  onPromptClick: (prompt: string) => void;
}

const QuickCommands = ({ onPromptClick }: QuickCommandsProps) => {
  const commands = [
    {
      text: "Current championship standings",
      category: "STANDINGS",
    },
    {
      text: "Latest race results and analysis",
      category: "RESULTS",
    },
    {
      text: "Technical regulations 2025",
      category: "TECHNICAL",
    },
    {
      text: "Driver performance metrics",
      category: "ANALYTICS",
    },
  ];

  return (
    <motion.div
      className="quick-commands"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <div className="commands-header">
        <h3 className="commands-title">QUICK ACCESS COMMANDS</h3>
        <div className="ready-indicator">
          <div className="ready-dot"></div>
          <span>READY</span>
        </div>
      </div>

      <div className="commands-grid">
        {commands.map((command, index) => (
          <motion.div
            key={`command-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
          >
            <CommandButton
              text={command.text}
              category={command.category}
              onClick={() => onPromptClick(command.text)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickCommands;
