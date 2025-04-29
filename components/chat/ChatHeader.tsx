import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "motion/react";
import { Moon, Sun } from "lucide-react";

interface ChatHeaderProps {
  currentChatId: string | null;
}

export default function ChatHeader({ currentChatId }: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="flex items-center justify-between mb-4"
    >
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        🦙 Llama ji-pea-tea
      </h1>
      <div className="flex items-center gap-3">
        {currentChatId && (
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            Session: {currentChatId.substring(0, 8)}
          </span>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-white hover:bg-gray-100 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}
