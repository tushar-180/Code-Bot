import { useEffect, useState, useRef } from "react";
import type { FormEvent } from "react";
import { UserButton, useUser } from "@clerk/react";
import axios from "axios";
import { useChatStore } from "@/store/useChatStore";
import { api } from "@/lib/api";
import Sidebar from "@/components/custom/Sidebar";
import { toast } from "sonner";
import { Send, Bot, Sparkles, User, Loader2, Menu } from "lucide-react";

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
    setLoading,
  } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          chat._id === res.data._id
            ? { ...chat, title: res.data.title }
            : chat
        )
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
        {/* Header */}
        <header className="z-10 border-b border-slate-800/60 bg-slate-950/50 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              {/* Hamburger Menu - Only on Mobile */}
              <button
                onClick={() => useChatStore.getState().setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-400 hover:text-white md:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                <Sparkles size={20} />
              </div>
              <div className="flex items-center justify-between w-full">

              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  {user?.firstName ? `Hello, ${user.firstName}` : "Welcome"}
                </h1>
                <p className="text-xs font-medium text-slate-400">
                  {currentChatId ? "Continuing Conversation" : "Start a New Session"}
                </p>
              </div>

                <div className="">
                  <UserButton/>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <div className="mx-auto flex max-w-4xl flex-col gap-6">
            {!currentChatId && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-indigo-400 shadow-2xl">
                  <Bot size={32} />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">How can I help you today?</h2>
                <p className="max-w-md text-slate-400 leading-relaxed">
                  {isNewChat
                    ? "Your new conversation is ready. Send a message to get started."
                    : "Select an existing chat from the sidebar or start a new one to begin brainstorming or asking questions."}
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <p>No messages yet. The stage is yours.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className={`flex max-w-[85%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-slate-700 shadow-sm">
                      {msg.role === "user" ? (
                        user?.imageUrl ? (
                          <img src={user.imageUrl} alt="User" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
                            <User size={18} />
                          </div>
                        )
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-indigo-600/20 text-indigo-400">
                          <Bot size={18} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1">
                      <div
                        className={`rounded-2xl px-5 py-3.5 text-[0.9375rem] leading-relaxed shadow-sm ring-1 ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white ring-indigo-500/50 shadow-indigo-500/10"
                            : "bg-slate-900/80 text-slate-100 ring-slate-800/60"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest text-slate-500 ${msg.role === "user" ? "text-right mr-1" : "text-left ml-1"}`}>
                        {msg.role === "user" ? "You" : "Assistant"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* AI Typing Indicator */}
            {loading && (
              <div className="flex w-full justify-start animate-in fade-in duration-300">
                <div className="flex max-w-[85%] gap-3 flex-row">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-slate-700">
                    <Bot size={18} className="animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900/80 px-5 py-4 ring-1 ring-slate-800/60">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800/60 bg-slate-950/50 p-4 md:p-6 backdrop-blur-xl">
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-4xl"
          >
            <div className="relative flex items-end gap-3 rounded-[1.75rem] border border-slate-700 bg-slate-900/80 p-2 shadow-2xl transition-all focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !loading) {
                      const event = { preventDefault: () => {} } as FormEvent<HTMLFormElement>;
                      handleSubmit(event);
                    }
                  }
                }}
                rows={1}
                placeholder="Message assistant..."
                className="max-h-[200px] min-h-[48px] flex-1 resize-none bg-transparent px-4 py-3 text-[0.9375rem] text-slate-100 placeholder-slate-500 outline-none"
                style={{ height: "auto" }}
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              AI model may produce inaccurate info. Personalize your workflow with Chat Studio.
            </p>
          </form>
        </div>
      </main>
    </div>
  );

};

export default Chat;
