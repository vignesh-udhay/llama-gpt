import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { User } from "lucide-react";
import { Message } from "@/lib/store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";

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

const components: Components = {
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <div className="relative my-4">
        <div className="absolute right-2 top-2 text-xs text-gray-500">
          {match[1]}
        </div>
        <code
          className={cn(
            "block p-4 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto whitespace-pre font-mono text-sm",
            className
          )}
          {...props}
        >
          {children}
        </code>
      </div>
    ) : (
      <code
        className={cn(
          "px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm mx-0.5",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre({ children }) {
    return <div className="whitespace-pre my-4">{children}</div>;
  },
  p({ children, ...props }) {
    return (
      <p className="my-3" {...props}>
        {children}
      </p>
    );
  },
  ul({ children, ...props }) {
    return (
      <ul className="my-3 list-disc pl-6" {...props}>
        {children}
      </ul>
    );
  },
  ol({ children, ...props }) {
    return (
      <ol className="my-3 list-decimal pl-6" {...props}>
        {children}
      </ol>
    );
  },
  li({ children, ...props }) {
    return (
      <li className="my-1" {...props}>
        {children}
      </li>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="overflow-x-auto my-4">
        <table
          className="w-full border-collapse border border-gray-200 dark:border-gray-700"
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
  th({ children, ...props }) {
    return (
      <th
        className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left"
        {...props}
      >
        {children}
      </th>
    );
  },
  td({ children, ...props }) {
    return (
      <td
        className="border border-gray-200 dark:border-gray-700 px-4 py-2"
        {...props}
      >
        {children}
      </td>
    );
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
              "font-medium text-sm mb-2",
              isUser ? "text-gray-100" : "text-gray-800 dark:text-gray-100"
            )}
          >
            {isUser ? "You" : "Llama AI"}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
