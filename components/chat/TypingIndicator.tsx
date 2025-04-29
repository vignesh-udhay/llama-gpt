import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "motion/react";

const typingIndicatorVariants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10,
    },
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export default function TypingIndicator() {
  return (
    <motion.div
      key="loading"
      variants={typingIndicatorVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex justify-start"
    >
      <div className="flex gap-3 max-w-[85%]">
        <Avatar className="h-8 w-8 ring-2 ring-indigo-200 dark:ring-indigo-800">
          <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-2xl flex items-center justify-center">
            🦙
          </AvatarFallback>
        </Avatar>

        <div className="rounded-xl px-4 py-3 shadow-sm bg-white dark:bg-gray-800 rounded-tl-none">
          <div className="font-medium text-sm mb-1 text-gray-800 dark:text-gray-100">
            Llama AI
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <motion.div
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: 0,
                }}
                className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: 0.2,
                }}
                className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: 0.4,
                }}
                className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-300">
              Thinking...
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
