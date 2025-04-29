import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";
import { KeyboardEvent, useRef, useEffect } from "react";
import { motion } from "motion/react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when isLoading changes (after submission)
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="relative w-full max-w-4xl mx-auto"
    >
      <form ref={formRef} onSubmit={onSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask anything"
          className={cn(
            "w-full py-3 px-4 pr-14",
            "bg-white border border-gray-200 dark:border-gray-700",
            "text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400",
            "rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 dark:bg-gray-800 shadow-sm",
            isLoading && "opacity-70"
          )}
          required
          disabled={isLoading}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={cn(
            "absolute right-2 top-1/2 transform -translate-y-1/2",
            "p-2 rounded-full",
            "bg-transparent hover:bg-gray-100",
            "text-gray-500 hover:text-gray-700",
            isLoading && "opacity-70"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </motion.div>
  );
}
