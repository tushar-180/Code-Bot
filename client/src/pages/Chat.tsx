import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useUser } from "@clerk/react";
import axios from "axios";
import { useChatStore } from "@/store/useChatStore";
import { api } from "@/lib/api";
import Sidebar from "@/components/custom/Sidebar";
import ChatHeader from "@/components/custom/ChatHeader";
import MessageList from "@/components/custom/MessageList";
import InputArea from "@/components/custom/InputArea";
import { toast } from "sonner";

const getChatErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      typeof error.response?.data?.error === "string"
        ? error.response.data.error
        : undefined;
    const retryAfter = error.response?.data?.retryAfter;

    if (apiMessage && retryAfter) {
      return `${apiMessage} Try again in about ${retryAfter} seconds.`;
    }

    return apiMessage || error.message;
  }

  return "Something went wrong while sending your message.";
};

const Chat = () => {
  const { user } = useUser();
  const {
    chats,
    currentChatId,
    messages,
    loading,
    isNewChat,
    setChats,
    setCurrentChat,
    setMessages,
    setIsNewChat,
    addMessage,
    setSidebarOpen,
    setLoading,
  } = useChatStore();

  const [input, setInput] = useState("");

  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${currentChatId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages", err);
        toast.error("Could not load messages for this chat.");
      }
    };

    fetchMessages();
  }, [currentChatId, setMessages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedInput = input.trim();

    if (!trimmedInput || loading || !user?.id) {
      return;
    }

    const userMessage = { role: "user" as const, content: trimmedInput };

    addMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      if (!currentChatId) {
        const res = await api.post("/chat", {
          userId: user.id,
          // userId: "user_3CTI11k1ZizdmtPIzO1zJR6eYYw",
          message: trimmedInput,
        });

        setChats([res.data, ...chats]);
        setCurrentChat(res.data._id);
        setMessages(res.data.messages || []);
        setIsNewChat(false);
        return;
      }

      const res = await api.post(`/chat/${currentChatId}`, {
        message: trimmedInput,
      });

      setMessages(res.data.messages || []);
      setChats(
        chats.map((chat) =>
          chat._id === res.data._id ? { ...chat, title: res.data.title } : chat,
        ),
      );
    } catch (err) {
      console.error("Error sending message", err);
      setMessages(messages);
      toast.error(getChatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex flex-1 flex-col bg-linear-to-br overflow-hidden from-slate-950 via-slate-900/50 to-slate-950">
        <ChatHeader
          currentChatId={currentChatId}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <MessageList
          messages={messages}
          loading={loading}
          currentChatId={currentChatId}
          isNewChat={isNewChat}
        />

        <InputArea
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          loading={loading}
          currentChatId={currentChatId}
        />
      </main>
    </div>
  );
};

export default Chat;
