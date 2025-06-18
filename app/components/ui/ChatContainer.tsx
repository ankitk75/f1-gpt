import { RefObject } from "react";
import { motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import LoadingIndicator from "./LoadingIndicator";

interface Message {
  content: string;
  role: "user" | "assistant" | "system" | "data";
}

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const ChatContainer = ({
  messages,
  isLoading,
  messagesEndRef,
}: ChatContainerProps) => {
  return (
    <div className="chat-messages">
      <div className="messages-list">
        {messages.map((message, index) => (
          <motion.div
            key={`message-${index}`}
            initial={{ opacity: 0, x: message.role === "user" ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <MessageBubble message={message} />
          </motion.div>
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatContainer;
