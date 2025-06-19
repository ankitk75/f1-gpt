"use client";

import "./styles/globals.css";
import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "./components/layout/AppLayout";
import Header from "./components/ui/Header";
import WelcomeSection from "./components/ui/WelcomeSection";
import ChatContainer from "./components/ui/ChatContainer";
import InputSection from "./components/ui/InputSection";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    setInput,
  } = useChat();

  const [showWelcome, setShowWelcome] = useState(true);
  const [resetKey, setResetKey] = useState(0); // Key for forcing component remount
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (hasMessages && showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasMessages, showWelcome]);

  const handlePromptClick = (prompt: string) => {
    append({ role: "user", content: prompt });
  };

  // Complete reset function for F1GPT brand click
  const handleCompleteReset = () => {
    // Clear all messages using AI SDK's setMessages
    setMessages([]);

    // Clear input field
    setInput("");

    // Reset to welcome screen
    setShowWelcome(true);

    // Force component remount to ensure complete reset
    setResetKey((prev) => prev + 1);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <AppLayout key={resetKey}>
      {" "}
      {/* Key forces complete remount on reset */}
      <Header onBackToHome={handleCompleteReset} />
      <main className="main-content-simple">
        <AnimatePresence mode="wait">
          {showWelcome && !hasMessages ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -30,
                transition: { duration: 0.5, ease: "easeInOut" },
              }}
              className="welcome-container-simple"
            >
              <WelcomeSection onPromptClick={handlePromptClick} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="chat-container-simple"
            >
              <ChatContainer
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <InputSection
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </AppLayout>
  );
};

export default Home;
