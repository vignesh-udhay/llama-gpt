import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
};

interface ChatStore {
  sessions: ChatSession[];
  currentChatId: string | null;
  isNewChat: boolean;
  isSidebarCollapsed: boolean;
  input: string;
  isLoading: boolean;
  addSession: (messages: Message[]) => ChatSession;
  updateSession: (id: string, messages: Message[]) => void;
  deleteSession: (id: string) => void;
  setCurrentChatId: (id: string | null) => void;
  setIsNewChat: (value: boolean) => void;
  toggleSidebar: () => void;
  setInput: (input: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: [],
      currentChatId: null,
      isNewChat: false,
      isSidebarCollapsed: false,
      input: "",
      isLoading: false,

      addSession: (messages) => {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: messages[0]?.content?.slice(0, 30) || "New Chat",
          messages,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentChatId: newSession.id,
        }));
        return newSession;
      },

      updateSession: (id, messages) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, messages, updatedAt: new Date().toISOString() }
              : session
          ),
        })),

      deleteSession: (id) =>
        set((state) => {
          const newSessions = state.sessions.filter(
            (session) => session.id !== id
          );
          return {
            sessions: newSessions,
            currentChatId:
              state.currentChatId === id
                ? newSessions[0]?.id || null
                : state.currentChatId,
          };
        }),

      addMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, message],
                  updatedAt: new Date().toISOString(),
                  title:
                    session.messages.length === 0 && message.role === "user"
                      ? message.content.slice(0, 30) +
                        (message.content.length > 30 ? "..." : "")
                      : session.title,
                }
              : session
          ),
        })),

      updateSessionTitle: (sessionId, title) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, title, updatedAt: new Date().toISOString() }
              : session
          ),
        })),

      setCurrentChatId: (id) => set({ currentChatId: id }),
      setIsNewChat: (value) => set({ isNewChat: value }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setInput: (input) => set({ input }),
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        sessions: state.sessions,
        currentChatId: state.currentChatId,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
