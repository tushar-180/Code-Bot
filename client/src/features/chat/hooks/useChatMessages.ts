import { useState, useEffect } from "react";
import { useChatStore } from "@/features/chat/store/useChatStore";
import { chatService } from "@/features/chat/services/chat.service";
import { toast } from "sonner";

export const useChatMessages = () => {
  const { currentChatId, isStreaming, setMessages } = useChatStore();
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadedChatId, setLoadedChatId] = useState<string | null>(null);

  useEffect(() => {
    // 1. If no chat is selected, reset states and return
    if (!currentChatId) {
      setMessagesLoading(false);
      setLoadedChatId(null);
      return;
    }

    // 2. If we are currently streaming, reset loadedChatId to force refetch when stream ends
    if (isStreaming) {
      setLoadedChatId(null);
      return;
    }

    // 3. If the chat is already loaded, don't fetch
    if (loadedChatId === currentChatId) {
      setMessagesLoading(false);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      console.log(`[useChatMessages] Triggering fetch for chat: ${currentChatId}`);
      setMessagesLoading(true);
      
      try {
        const messages = await chatService.fetchMessages(currentChatId);
        
        if (!cancelled) {
          setMessages(messages);
          setLoadedChatId(currentChatId);
          console.log(`[useChatMessages] Successfully loaded ${messages.length} messages`);
        }
      } catch (err) {
        console.error("[useChatMessages] Error fetching messages", err);
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
  }, [currentChatId, isStreaming, loadedChatId, setMessages]);

  return {
    messagesLoading,
    loadedChatId,
  };
};
