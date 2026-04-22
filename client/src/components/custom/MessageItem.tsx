import { useUser } from "@clerk/react";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageItemProps {
  message: Message;
  index: number;
}

const MessageItem = ({ message: msg, index }: MessageItemProps) => {
  const { user } = useUser();

  return (
    <div
      key={index}
      className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[85%] gap-3 ${
          msg.role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-slate-700 shadow-sm">
          {msg.role === "user" ? (
            user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="User"
                className="h-full w-full object-cover"
              />
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
        <div className="flex flex-col gap-1.5">
          <div
            className={`rounded-2xl px-5 py-3.5 text-[0.9375rem] leading-relaxed shadow-sm ring-1 transition-all duration-200 ${
              msg.role === "user"
                ? "bg-indigo-600 text-white ring-indigo-500/50 shadow-indigo-500/10 rounded-br-sm"
                : "bg-slate-800/60 text-slate-100 ring-slate-700/60 shadow-slate-900/20 rounded-bl-sm"
            }`}
          >
            <ReactMarkdown
              components={{
                code(props) {
                  const { children, className } = props;

                  const match = /language-(\w+)/.exec(className || "");

                  // If language exists → it's a code block
                  if (match) {
                    const codeString = String(children).replace(/\n$/, "");
                    return <CodeBlock code={codeString} language={match[1]} />;
                  }

                  // Otherwise → inline code
                  return (
                    <code className="bg-slate-800 px-2 py-1 rounded text-slate-100 text-[0.85em] font-mono">
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
          <span
            className={`text-[10px] uppercase tracking-widest text-slate-500 ${
              msg.role === "user" ? "text-right mr-1" : "text-left ml-1"
            }`}
          >
            {msg.role === "user" ? "You" : "Assistant"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
