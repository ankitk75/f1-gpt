import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaGithub } from "react-icons/fa"; // Import GitHub icon

interface HeaderProps {
  onBackToHome?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBackToHome }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.header
      className="enhanced-header"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="header-content">
        {/* Clickable Brand Section */}
        <motion.div
          className="clickable-brand"
          onClick={onBackToHome}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="brand-text">
            <h1 className="brand-title">F1GPT</h1>
            <span className="brand-subtitle">AI Racing Assistant</span>
          </div>
        </motion.div>

        {/* Simple Right Side Elements */}
        <div className="header-right">
          <div className="simple-status">
            <div className="status-dot-simple"></div>
            <span>READY</span>
          </div>
          <div className="time-display-simple">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {/* GitHub Link */}
          <motion.a
            href="https://github.com/ankitk75/f1-gpt"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <FaGithub className="github-icon" />
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
