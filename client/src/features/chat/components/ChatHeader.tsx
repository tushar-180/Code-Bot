import { memo } from "react";
import { UserButton, useUser } from "@clerk/react";
import { Sparkles, Menu } from "lucide-react";

interface ChatHeaderProps {
  currentChatId: string | null;
  onMenuClick: () => void;
}

const ChatHeader = ({ currentChatId, onMenuClick }: ChatHeaderProps) => {
  const { user } = useUser();

  return (
    <header className="z-10 border-b border-slate-800/50 bg-linear-to-r from-slate-950 via-slate-900/80 to-slate-950 px-6 py-4 backdrop-blur-2xl shadow-lg shadow-slate-950/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 w-full">
          {/* Hamburger Menu - Only on Mobile */}
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 md:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500/20 to-blue-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <Sparkles size={20} />
          </div>
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Code-Bot
                <span className="text-indigo-400 text-sm font-medium border-l border-slate-700 pl-2 ml-1">
                  {user?.firstName || user?.username || "Guest"}
                </span>
              </h1>
              <p className="text-xs font-medium text-slate-400">
                {user?.firstName ? `Hello, ${user.firstName}` : "Welcome"} •{" "}
                {currentChatId
                  ? "Continuing Conversation"
                  : "Start a New Session"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <UserButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(ChatHeader);
