import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { Loader2 } from "lucide-react";
import MessageItem from "./MessageItem";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentChatId: string | null;
  isNewChat: boolean;
}

const MessageList = ({
  messages,
  loading,
  currentChatId,
  isNewChat,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-5">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {!currentChatId && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-indigo-400 shadow-2xl">
              <Bot size={32} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              How can I help you today?
            </h2>
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
          messages.map((msg, i) => <MessageItem key={i} message={msg} index={i} />)
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
  );
};

export default MessageList;
