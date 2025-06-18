import { useState, useCallback, useRef, useEffect } from 'react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  timestamp: Date;
}

export interface UseChatOptions {
  api?: string;
  initialMessages?: Message[];
  onResponse?: (response: string) => void;
  onError?: (error: Error) => void;
}

export interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: Error | null;
  append: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  reload: () => Promise<void>;
  stop: () => void;
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    api = '/api/chat',
    initialMessages = [],
    onResponse,
    onError,
  } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const createMessage = (content: string, role: Message['role']): Message => ({
    id: generateId(),
    content,
    role,
    timestamp: new Date(),
  });

  const append = useCallback(async (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage = createMessage(message.content, message.role);
    setMessages(prev => [...prev, newMessage]);

    if (message.role === 'user') {
      setIsLoading(true);
      setError(null);

      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, newMessage].map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let assistantMessage = '';

        // Create assistant message placeholder
        const assistantMessageId = generateId();
        setMessages(prev => [...prev, {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          timestamp: new Date(),
        }]);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            assistantMessage += chunk;

            // Update the assistant message with streaming content
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: assistantMessage }
                : msg
            ));
          }

          onResponse?.(assistantMessage);
        } catch (streamError) {
          if (streamError instanceof Error && streamError.name === 'AbortError') {
            // Request was aborted
            return;
          }
          throw streamError;
        }

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        onError?.(error);

        // Add error message to chat
        const errorMessage = createMessage(
          'Sorry, I encountered an error processing your request. Please try again.',
          'assistant'
        );
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [api, messages, onResponse, onError]);

  const reload = useCallback(async () => {
    if (messages.length === 0) return;

    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (!lastUserMessage) return;

    // Remove the last assistant message if it exists
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage.role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });

    await append({
      content: lastUserMessage.content,
      role: 'user',
    });
  }, [messages, append]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    append({
      content: userMessage,
      role: 'user',
    });
  }, [input, isLoading, append]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    input,
    isLoading,
    error,
    append,
    reload,
    stop,
    setInput,
    handleInputChange,
    handleSubmit,
  };
}

export default useChat;
