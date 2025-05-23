"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function ChatSidebar() {
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(
    null
  );
  const {
    sessions,
    currentChatId,
    isSidebarCollapsed,
    addSession,
    setCurrentChatId,
    deleteSession,
    toggleSidebar,
  } = useChatStore();

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(id);
  };

  const handleConfirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id);
    setShowConfirmDelete(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(null);
  };

  const handleNewChat = () => {
    const newSession = addSession([]);
    setCurrentChatId(newSession.id);
  };

  const handleSessionClick = (sessionId: string) => {
    setCurrentChatId(sessionId);
  };

  const sidebarVariants = {
    expanded: {
      width: "280px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: {
      width: "60px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      initial={false}
      animate={isSidebarCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        {!isSidebarCollapsed && (
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Chats
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-2 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-gray-100"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          variant="outline"
          className={`${
            isSidebarCollapsed ? "justify-center p-2" : "w-full justify-start"
          } gap-2 font-medium text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900`}
        >
          <PlusCircle className="h-4 w-4" />
          {!isSidebarCollapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <AnimatePresence>
          {sessions.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2 space-y-1"
            >
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={cn(
                    "rounded-lg px-3 py-2 cursor-pointer group transition-colors duration-200",
                    currentChatId === session.id
                      ? "bg-indigo-200 dark:bg-indigo-900"
                      : "hover:bg-indigo-100 dark:hover:bg-gray-800",
                    isSidebarCollapsed
                      ? "flex justify-center"
                      : "flex items-center justify-between"
                  )}
                  onClick={() => handleSessionClick(session.id)}
                >
                  {isSidebarCollapsed ? (
                    <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-gray-400" />
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-300 truncate">
                          {session.title || "New Chat"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-500">
                          {formatDistanceToNow(new Date(session.updatedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>

                      {/* Delete button and confirmation */}
                      {showConfirmDelete === session.id ? (
                        <div className="flex space-x-1">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => handleConfirmDelete(session.id, e)}
                            className="h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelDelete}
                            className="h-6 w-6"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            !isSidebarCollapsed && (
              <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                No chat history yet
              </div>
            )
          )}
        </AnimatePresence>
      </ScrollArea>
    </motion.div>
  );
}
