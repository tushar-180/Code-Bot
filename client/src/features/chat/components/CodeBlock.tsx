import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  // const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group my-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/95 shadow-[0_18px_45px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between border-b border-slate-800/90 bg-slate-900/90 px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {language || "text"}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                Copied
              </span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="text-xs font-medium">Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        showLineNumbers
        customStyle={{
          borderRadius: "0",
          padding: "20px",
          margin: 0,
          background: "transparent",
        }}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
