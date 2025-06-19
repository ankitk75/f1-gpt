import { useCallback } from 'react';
import { useChat as useAIChat, UseChatOptions } from '@ai-sdk/react';

export function useChat(options: UseChatOptions = {}) {
  const aiChatHook = useAIChat(options);

  const clearMessages = useCallback(() => {
    aiChatHook.setMessages([]);
    aiChatHook.setInput('');
  }, [aiChatHook]);

  const resetToHome = useCallback(() => {
    clearMessages();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [clearMessages]);

  return {
    ...aiChatHook,
    clearMessages,
    resetToHome,
  };
}

export default useChat;
