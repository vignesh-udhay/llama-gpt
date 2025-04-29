"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Groq } from "groq-sdk";
import { useChatStore } from "@/lib/store";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import { Message } from "@/lib/store";

export default function ChatInterface() {
  const {
    sessions,
    currentChatId,
    input,
    isLoading,
    setInput,
    setIsLoading,
    addMessage,
    addSession,
    updateSessionTitle,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find((s) => s.id === currentChatId);
  const messages = currentSession?.messages || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    let sessionId = currentChatId;

    // If no current session, create a new one
    if (!sessionId) {
      const newSession = addSession([userMessage]);
      sessionId = newSession.id;
      // Set initial title based on first message
      updateSessionTitle(
        sessionId,
        input.slice(0, 30) + (input.length > 30 ? "..." : "")
      );
    } else {
      addMessage(sessionId, userMessage);
    }

    setInput("");
    setIsLoading(true);

    try {
      const groq = new Groq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          userMessage,
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content:
          completion.choices[0]?.message?.content ||
          "Sorry, I could not process your request.",
      };

      addMessage(sessionId, assistantMessage);
    } catch (error) {
      console.error("Error:", error);
      addMessage(sessionId, {
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[calc(100vh-2rem)] w-full max-w-5xl mx-auto p-4 md:p-6"
    >
      <ChatHeader currentChatId={currentChatId} />

      <ChatMessages messages={messages} isLoading={isLoading} />
      <div ref={messagesEndRef} />

      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}
