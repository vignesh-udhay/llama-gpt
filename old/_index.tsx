// app/routes/_index.tsx
import {
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useRevalidator
} from "@remix-run/react";
import { Groq } from "groq-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import ChatInterface from "~/components/ChatInterface";
import ChatSidebar from "~/components/ChatSidebar";
import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { createChatSession, deleteChatSession, getAllChatSessions, getChatSession, updateChatSession } from "~/lib/chatStorage";

// Type definitions for loader and action responses
type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
};

type ActionSuccessData = {
  chatHistory: Message[];
  chatId?: string | null;
};

type ActionErrorData = {
  error: string;
  chatHistory?: Message[];
};

export type ActionData = (ActionSuccessData & { streaming?: boolean }) | ActionErrorData | undefined;


export async function loader() {
  // Server doesn't access localStorage, but we'll keep this function
  // for future server-side storage implementations
  return new Response(JSON.stringify({ timestamp: Date.now() }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}

// Server-side action function for handling form submissions
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userMessage = formData.get("message") as string;
  const chatHistoryStr = formData.get("chatHistory") as string || "[]";
  const chatHistory = JSON.parse(chatHistoryStr);
  const isNewChat = formData.get("isNewChat") === "true";
  const chatId = formData.get("chatId") as string || null;

  // If this is a new chat request, ignore any chat history from form data
  const effectiveHistory = isNewChat ? [] : chatHistory;
  
  if (!userMessage) {
    return new Response(JSON.stringify({ 
      error: "Message is required", 
      chatHistory: chatHistory 
    } as ActionErrorData), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  // Add user message to history
  const newChatHistory = [
    ...effectiveHistory, // Use effectiveHistory which may be empty for new chats
    { role: "user", content: userMessage },
  ];

  try {
    // Initialize Groq client with API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set in environment variables");
    }

    const groq = new Groq();

    // Call Groq API without streaming
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
          name: "system"
        } as const,
        ...newChatHistory.map((msg: Message) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
          name: msg.role
        } as const)),
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
    });

    const assistantResponse = completion.choices[0]?.message?.content || "";
    const updatedChatHistory = [...newChatHistory, { role: "assistant", content: assistantResponse }];

    return new Response(JSON.stringify({
      chatHistory: updatedChatHistory,
      chatId,
    } as ActionSuccessData), {
      headers: {
        "Content-Type": "application/json"
      }
    });
    
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return new Response(JSON.stringify({
      error: "Failed to initialize AI response",
      chatHistory: newChatHistory,
    } as ActionErrorData), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
}

export default function Index() {
  // Get the action data from the server
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  
  // State for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);
  
  // State for current chat session
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<Array<any>>([]);
  const [isNewChat, setIsNewChat] = useState<boolean>(false);
  
  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    variant: 'success' as const
  });
  
  // Load chat sessions from localStorage on initial render
  useEffect(() => {
    const sessions = getAllChatSessions();
    setChatSessions(sessions);
    
    // If we have sessions but no current ID, set to the most recent
    if (sessions.length > 0 && !currentChatId) {
      setCurrentChatId(sessions[0].id);
    }
  }, [loaderData.timestamp]);
  
  // Get current chat history
  const currentChatHistory = useMemo(() => {
    if (!currentChatId) return [];
    const session = getChatSession(currentChatId);
    return session?.messages || [];
  }, [currentChatId, chatSessions]);
  
  // Update local state when action returns data
  useEffect(() => {
    if (actionData && 'chatHistory' in actionData) {
      // Safely type cast the actionData to access chatId
      const successData = actionData as ActionSuccessData;
      const chatId = successData.chatId || currentChatId;
      
      // If we have a chat ID, update that session
      if (chatId) {
        // Ensure we pass a well-typed array
        const messages: Message[] = Array.isArray(actionData.chatHistory) 
          ? [...actionData.chatHistory].map(m => ({ 
              role: m.role as "user" | "assistant" | "system", 
              content: m.content, 
              name: m.name
            }))
          : [];

        const updatedSession = updateChatSession(chatId, messages);
        if (updatedSession) {
          // Refresh chat sessions list
          setChatSessions(getAllChatSessions());
        }
      } 
      // If no chat ID but we have chat history, create a new session
      else if (actionData.chatHistory && actionData.chatHistory.length > 0) {
        // Ensure we pass a well-typed array
        const messages: Message[] = Array.isArray(actionData.chatHistory) 
          ? [...actionData.chatHistory].map(m => ({ 
              role: m.role as "user" | "assistant" | "system", 
              content: m.content, 
              name: m.name
            }))
          : [];
          
        const newSession = createChatSession(messages);
        setCurrentChatId(newSession.id);
        setChatSessions(getAllChatSessions());
      }
    }
  }, [actionData, currentChatId]);
  
  // Create a new chat
// In Index.tsx, update the handleNewChat function:
const handleNewChat = useCallback(() => {
  console.log("Starting a new chat");
  
  // Create a new empty chat session
  const newSession = createChatSession([]);
  
  // First clear states and set the new chat flag
  setIsNewChat(true);
  setCurrentChatId(newSession.id);
  setChatSessions(getAllChatSessions());
  
  // Force a revalidation to update the UI immediately
  revalidator.revalidate();
  
  // Keep the isNewChat flag true until the next render cycle completes
  setTimeout(() => {
    setIsNewChat(false);
  }, 100); // Reduce this to 100ms from 1000ms
}, [revalidator]);
  
  // Select an existing chat
  const handleSelectChat = useCallback((id: string) => {
    setCurrentChatId(id);
    // Force a revalidation to update the UI
    revalidator.revalidate();
  }, [revalidator]);
  
  // Delete a chat
  const handleDeleteChat = useCallback((id: string) => {
    // Find the chat title before deletion for the notification
    const chatToDelete = getChatSession(id);
    const chatTitle = chatToDelete?.title || 'Chat';
    
    deleteChatSession(id);
    setChatSessions(getAllChatSessions());
    
    // Show toast notification
    setToast({
      isVisible: true,
      message: `Chat has been deleted ("${chatTitle}")`,
      variant: 'success'
    });
    
    // If we deleted the current chat, select a new one or clear
    if (id === currentChatId) {
      const sessions = getAllChatSessions();
      if (sessions.length > 0) {
        setCurrentChatId(sessions[0].id);
      } else {
        setCurrentChatId(null);
        setIsNewChat(true);
        // Auto reset the flag after a short delay
        setTimeout(() => {
          setIsNewChat(false);
        }, 500);
      }
    }
    
    // Force a revalidation to update the UI
    revalidator.revalidate();
  }, [currentChatId, revalidator]);
  
  // Toggle sidebar collapse
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);

  return (
    <ThemeProvider>

    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Chat Sidebar */}
      <ChatSidebar 
        sessions={chatSessions}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden items-center">
        <div className="w-full max-w-4xl flex-1 flex flex-col overflow-hidden">
          <ChatInterface
            initialChatHistory={currentChatHistory}
            actionData={actionData}
            isSubmitting={navigation.state === "submitting"}
            revalidate={revalidator.revalidate}
            isNewChat={isNewChat}
            sessionId={currentChatId || undefined}
          />
        </div>
      </div>
      
      {/* Toast Notification */}
      {/* <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        variant={toast.variant}
        duration={3000}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      /> */}
       <Toaster />
    </div>
    </ThemeProvider>
  );
}
