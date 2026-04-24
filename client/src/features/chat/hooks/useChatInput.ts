import { useState } from "react";
import type { FormEvent } from "react";

interface UseChatInputProps {
  onSubmit: (input: string, provider: string) => Promise<void>;
  initialProvider?: string;
}

export const useChatInput = ({ onSubmit, initialProvider }: UseChatInputProps) => {
  const [input, setInput] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(
    initialProvider || "gemini:gemini-3.1-flash-lite-preview"
  );

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput(""); // Clear input early for better UX
    await onSubmit(currentInput, selectedProvider);
  };

  return {
    input,
    setInput,
    selectedProvider,
    setSelectedProvider,
    handleFormSubmit,
  };
};
