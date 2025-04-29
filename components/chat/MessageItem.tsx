import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { User } from "lucide-react";
import { Message } from "@/lib/store";

interface MessageItemProps {
  message: Message;
  index: number;
}

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

export default function MessageItem({ message, index }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      key={index}
      custom={index}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "flex gap-3 max-w-[80%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <Avatar
          className={cn(
            "h-8 w-8 shrink-0",
            isUser ? "bg-indigo-500" : "bg-indigo-200 dark:ring-indigo-800"
          )}
        >
          {isUser && (
            <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-2xl flex items-center justify-center">
              <User className="h-4 w-4" />
            </AvatarFallback>
          )}
          {!isUser && (
            <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-xl flex items-center justify-center">
              🦙
            </AvatarFallback>
          )}
        </Avatar>

        <div
          className={cn(
            "rounded-xl px-4 py-3 shadow-sm max-w-full",
            isUser
              ? "bg-indigo-600 text-white dark:bg-indigo-900 dark:text-gray-100 rounded-tr-none"
              : "bg-white text-gray-800 dark:bg-indigo-900 dark:text-gray-100 border border-gray-200 rounded-tl-none"
          )}
        >
          <div
            className={cn(
              "font-medium text-sm mb-1",
              isUser ? "text-gray-100" : "text-gray-800 dark:text-gray-100"
            )}
          >
            {isUser ? "You" : "Llama AI"}
          </div>
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        </div>
      </div>
    </motion.div>
  );
}
