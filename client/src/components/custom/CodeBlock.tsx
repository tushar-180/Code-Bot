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
    <div className="relative group rounded-lg overflow-hidden my-2">
      <SyntaxHighlighter
        showLineNumbers
        customStyle={{
          borderRadius: "8px",
          padding: "16px",
          margin: 0,
        }}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5"
        title="Copy code"
      >
        {copied ? (
          <>
            <Check size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">
              Copied!
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
  );
};

export default CodeBlock;
