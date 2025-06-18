import { motion } from "framer-motion";
import SuggestionPrompts from "../features/SuggestionPrompts";

interface WelcomeSectionProps {
  onPromptClick: (prompt: string) => void;
}

const WelcomeSection = ({ onPromptClick }: WelcomeSectionProps) => {
  return (
    <div className="welcome-section-simple">
      <div className="hero-content-simple">
        <motion.h2
          className="hero-title-simple"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Ask me anything about
          <span className="title-accent">Formula One</span>
        </motion.h2>

        <motion.p
          className="hero-description-simple"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Get instant answers about drivers, teams, race results, technical
          regulations, and F1 history.
        </motion.p>
      </div>

      <SuggestionPrompts onPromptClick={onPromptClick} />
    </div>
  );
};

export default WelcomeSection;
