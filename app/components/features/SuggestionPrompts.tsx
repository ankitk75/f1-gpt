import { motion } from "framer-motion";
import {
  MessageCircle,
  TrendingUp,
  Trophy,
  Settings,
  Clock,
  Users,
} from "lucide-react";

interface SuggestionPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const SuggestionPrompts = ({ onPromptClick }: SuggestionPromptsProps) => {
  const suggestions = [
    {
      icon: <Trophy className="suggestion-icon" />,
      text: "Who is the current F1 World Champion?",
      category: "Championship",
    },
    {
      icon: <Clock className="suggestion-icon" />,
      text: "What are the latest 2025 race results?",
      category: "Recent Results",
    },
    {
      icon: <Settings className="suggestion-icon" />,
      text: "Explain F1 technical regulations for 2025",
      category: "Technical",
    },
    {
      icon: <TrendingUp className="suggestion-icon" />,
      text: "Show me current driver standings",
      category: "Standings",
    },
    {
      icon: <Users className="suggestion-icon" />,
      text: "Compare Lewis Hamilton vs Max Verstappen",
      category: "Driver Comparison",
    },
    {
      icon: <MessageCircle className="suggestion-icon" />,
      text: "What makes F1 cars so fast?",
      category: "General Knowledge",
    },
  ];

  return (
    <motion.div
      className="suggestion-prompts"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <h3 className="suggestions-title">Popular Questions</h3>

      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={`suggestion-${index}`}
            className="suggestion-card"
            onClick={() => onPromptClick(suggestion.text)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
          >
            <div className="suggestion-header">
              {suggestion.icon}
              <span className="suggestion-category">{suggestion.category}</span>
            </div>
            <p className="suggestion-text">{suggestion.text}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default SuggestionPrompts;
