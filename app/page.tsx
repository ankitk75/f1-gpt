"use client";
import "./styles/globals.css";
// import { useChat } from "./hooks/useChat";
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
  } = useChat();

  const [showWelcome, setShowWelcome] = useState(true);
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <AppLayout>
      <Header />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {showWelcome && !hasMessages ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -50,
                transition: { duration: 0.6, ease: "easeInOut" },
              }}
              className="welcome-container"
            >
              <WelcomeSection onPromptClick={handlePromptClick} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="chat-container"
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
