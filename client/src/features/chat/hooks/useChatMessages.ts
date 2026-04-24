import { useState, useEffect } from "react";
import { useChatStore } from "@/features/chat/store/useChatStore";
import { chatService } from "@/features/chat/services/chat.service";
import { toast } from "sonner";

export const useChatMessages = () => {
  const { currentChatId, isStreaming, setMessages } = useChatStore();
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadedChatId, setLoadedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (currentChatId) {
      return;
    }

    setMessagesLoading(false);
    setLoadedChatId(null);

    // If it's a new chat, we don't need to fetch anything, but we might want to clear local messages
    // The store might handle this, but keeping consistency with original logic
  }, [currentChatId]);

  useEffect(() => {
    if (!currentChatId || isStreaming) {
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      setMessagesLoading(true);
      setLoadedChatId(null);

      try {
        const messages = await chatService.fetchMessages(currentChatId);
        if (!cancelled) {
          setMessages(messages);
          setLoadedChatId(currentChatId);
        }
      } catch (err) {
        console.error("Error fetching messages", err);
        if (!cancelled) {
          toast.error("Could not load messages for this chat.");
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [currentChatId, isStreaming, setMessages]);

  return {
    messagesLoading,
    loadedChatId,
  };
};
