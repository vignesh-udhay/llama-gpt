import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Loader2, Moon, Send, Sun, User } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useTheme } from "~/contexts/ThemeContext";
import { cn } from "~/lib/utils";
import { ActionData } from "~/routes/_index";

// Define the message type
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
};

interface ChatInterfaceProps {
  initialChatHistory?: Message[];
  actionData?: ActionData;
  isSubmitting?: boolean;
  streaming?: boolean;
  sessionId?: string;
  isNewChat?: boolean;
  revalidate?: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    repeat: Infinity,
    duration: 2,
  },
};

export default function ChatInterface({
  initialChatHistory = [],
  actionData,
  isSubmitting = false,
  streaming = false,
  sessionId,
  isNewChat = false,
  revalidate,
}: ChatInterfaceProps) {
  const navigation = useNavigation();
  const [chatHistory, setChatHistory] = useState<Message[]>(initialChatHistory);
  const [userMessage, setUserMessage] = useState<string>("");
  const { theme, toggleTheme } = useTheme();
  const isFormSubmitting = navigation.state === "submitting" || isSubmitting;
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();
  
  // Reset chat history when isNewChat flag is set
  useEffect(() => {
    if (isNewChat) {
      console.log("New chat flag detected, clearing chat history");
      setChatHistory([]);
      setUserMessage("");
    }
  }, [isNewChat]);

  // Debug logging
  useEffect(() => {
    console.log("Current chat history:", chatHistory);
    console.log("Action data:", actionData);
  }, [chatHistory, actionData]);

  // Update chat history when we get new data from action
  useEffect(() => {
    if (actionData?.chatHistory) {
      // Always update from actionData when it changes
      setChatHistory(actionData.chatHistory);
      // Focus the textarea after the chat history is updated
      textareaRef.current?.focus();
    }
  }, [actionData]);
  
  // Set initial chat history when component mounts or initialChatHistory changes
  useEffect(() => {
    // Only update if we have initialChatHistory and it's different from current state
    if (initialChatHistory && initialChatHistory.length > 0 && 
        JSON.stringify(initialChatHistory) !== JSON.stringify(chatHistory)) {
      console.log("Setting initial chat history", initialChatHistory);
      setChatHistory(initialChatHistory);
    }
  }, [initialChatHistory]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle key press in the input field
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Send message on Enter, but allow Shift+Enter for line breaks
    if (e.key === "Enter" && !e.shiftKey && !isFormSubmitting) {
      e.preventDefault();

      if (userMessage.trim()) {
        console.log("Submitting form with message:", userMessage);
        const formData = new FormData(formRef.current!);
        formData.append("chatHistory", JSON.stringify(chatHistory));
        submit(formData, { method: "post" });
        setUserMessage(""); // Clear the input after submission
      }
    }
  };

  // Handle button click
 // In ChatInterface.tsx, modify the handleButtonClick function:
const handleButtonClick = () => {
  if (navigation.state === "submitting" || isSubmitting || !userMessage.trim()) {
    return;
  }
  
  if (formRef.current) {
    const formData = new FormData(formRef.current);
    
    // Always explicitly set the chatHistory when submitting
    formData.delete("chatHistory");
    
    // If we're in a new chat, use empty chat history
    if (isNewChat) {
      formData.append("chatHistory", "[]");
    } else {
      formData.append("chatHistory", JSON.stringify(chatHistory));
    }
    
    // Submit the form data
    submit(formData, {
      method: "post",
      replace: true,
    });
    
    // Clear the textarea
    setUserMessage("");
    
    // Focus the textarea after submission
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }
};

  // Determine if we should show the loading indicator
  const showLoading = isFormSubmitting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen w-full max-w-5xl mx-auto p-4 md:p-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        🦙 Llama ji-pea-tea
        </h1>
        <div className="flex items-center gap-3">
          {sessionId && (
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
              Session: {sessionId.substring(0, 8)}
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full bg-white hover:bg-gray-100 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </motion.div>

      {/* Debug info - can be removed in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-100 p-2 mb-4 text-xs rounded-md">
          <p>Is submitting: {isFormSubmitting ? "true" : "false"}</p>
          <p>Messages: {chatHistory.length}</p>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 mb-6 p-4 border rounded-xl shadow-sm bg-gray-50/50 dark:bg-gray-900/10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 p-2"
        >
          {chatHistory.length === 0 ? (
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
                  Start a conversation by typing a message below. I'm here to help with any questions you might have.
                </p>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {chatHistory.map((message, index) => {
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
                    className={cn(
                      "flex",
                      isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "flex gap-3 max-w-[80%]",
                      isUser ? "flex-row-reverse" : "flex-row"
                    )}>
                      <Avatar className={cn(
                        "h-8 w-8 shrink-0",
                        isUser ? "bg-indigo-500" : "bg-indigo-200 dark:ring-indigo-800"
                      )}>
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
                      
                      <div className={cn(
                        "rounded-xl px-4 py-3 shadow-sm max-w-full",
                        isUser ? 
                          "bg-indigo-600 text-white dark:bg-indigo-900 dark:text-gray-100 rounded-tr-none" : 
                          "bg-white text-gray-800 dark:bg-indigo-900 dark:text-gray-100 border border-gray-200 rounded-tl-none"
                      )}>
                        <div className={cn(
                          "font-medium text-sm mb-1",
                          isUser ? "text-gray-100" : "text-gray-800 dark:text-gray-100"
                        )}>
                          {isUser ? "You" : "Llama AI"}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          {showLoading && (
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
                  <div className="font-medium text-sm mb-1 text-gray-800 dark:text-gray-100">Llama AI</div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                        className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                        className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                        className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-300">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>
      </ScrollArea>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative w-full max-w-4xl mx-auto"
      >
        <Form ref={formRef} method="post" className="relative">
          {/* Hidden inputs for chat state */}
          <input type="hidden" name="isNewChat" value={isNewChat ? "true" : "false"} />
          <input type="hidden" name="chatId" value={sessionId || ""} />
          <input 
            type="hidden" 
            name="chatHistory" 
            value={isNewChat ? "[]" : JSON.stringify(chatHistory)} 
          />
          <input
            ref={textareaRef}
            type="text"
            name="message"
            placeholder="Ask anything"
            className={cn(
              "w-full py-3 px-4 pr-14",
              "bg-white border border-gray-200 dark:border-gray-700",
              "text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400",
              "rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 dark:bg-gray-800 shadow-sm",
              isFormSubmitting && "opacity-70"
            )}
            required
            disabled={isFormSubmitting}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="button"
            disabled={isFormSubmitting || !userMessage.trim()}
            onClick={handleButtonClick}
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2",
              "p-2 rounded-full",
              "bg-transparent hover:bg-gray-100",
              "text-gray-500 hover:text-gray-700",
              isFormSubmitting && "opacity-70"
            )}
          >
            {isFormSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </Form>
      </motion.div>
    </motion.div>
  );
}
