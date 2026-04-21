import { FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface InputAreaProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  currentChatId: string | null;
}

const InputArea = ({
  input,
  onInputChange,
  onSubmit,
  loading,
  currentChatId,
}: InputAreaProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading) {
        const event = {
          preventDefault: () => {},
        } as FormEvent<HTMLFormElement>;
        onSubmit(event);
      }
    }
  };

  return (
    <div className="border-t border-slate-800/60 bg-slate-950/50 p-4 md:p-6 backdrop-blur-xl">
      <form onSubmit={onSubmit} className="mx-auto max-w-4xl">
        <div className="relative flex items-end gap-3 rounded-[1.75rem] border border-slate-700 bg-slate-900/80 p-2 shadow-2xl transition-all focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              currentChatId ? "Message Assistant..." : "New Chat..."
            }
            className="max-h-[200px] min-h-[48px] flex-1 resize-none bg-transparent px-4 py-3 text-[0.9375rem] text-slate-100 placeholder-slate-500 outline-none"
            style={{ height: "auto" }}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-500">
          AI model may produce inaccurate info. Personalize your workflow
          with Chat Studio.
        </p>
      </form>
    </div>
  );
};

export default InputArea;
