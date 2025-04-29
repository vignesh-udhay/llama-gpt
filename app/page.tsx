"use client";

import { useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import ChatSidebar from "@/components/ChatSidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useChatStore } from "@/lib/store";

export default function Home() {
  const { sessions, currentChatId, setCurrentChatId } = useChatStore();

  // Set initial chat if none selected
  useEffect(() => {
    if (!currentChatId && sessions.length > 0) {
      setCurrentChatId(sessions[0].id);
    }
  }, [currentChatId, sessions, setCurrentChatId]);

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <ChatSidebar />

        <div className="flex-1 flex flex-col overflow-hidden items-center">
          <div className="w-full max-w-4xl flex-1 flex flex-col overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
