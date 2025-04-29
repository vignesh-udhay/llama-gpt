import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/lib/store";
import { motion, AnimatePresence } from "motion/react";
import { Bot } from "lucide-react";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    repeat: Infinity,
    duration: 2,
  },
};

export default function ChatMessages({
  messages,
  isLoading,
}: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1 mb-4 p-4 border rounded-xl shadow-sm bg-gray-50/50 dark:bg-gray-900/10 w-full overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-2"
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full py-16 gap-4"
          >
            <motion.div
              animate={pulseAnimation}
              className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/20"
            >
              <Bot className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <div className="text-center">
              <h3 className="font-medium text-lg mb-1">Welcome to AI Chat</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Start a conversation by typing a message below. I'm here to help
                with any questions you might have.
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageItem key={index} message={message} index={index} />
            ))}
            {isLoading && <TypingIndicator />}
          </AnimatePresence>
        )}
      </motion.div>
    </ScrollArea>
  );
}
