import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowUp, ArrowLeft, MessageSquare, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { checkSession } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext";
import axios from 'axios';
import { toast } from "@/components/ui/sonner";

interface Message {
  id: string;
  content: string;
  role: "user" | "agent";
}

interface ChatHistory {
  id: string;
  date: string;
  preview: string;
  messages: Message[];
}

interface SuggestedPrompt {
  id: string;
  text: string;
}

interface ChatEntry {
  user?: string;
  assistant?: string;
}

interface ContextData {
  trainingInfo: string[];
}

interface ChatResponse {
  reply: string;
}

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agent = location.state?.agent;
  const [activeTab, setActiveTab] = useState("chat");
  const { user, setUser } = useAuth();
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userData = await checkSession();
      if (userData) {
        setUser(userData);
        const histories = await fetchAllChatHistories(userData);
        setChatHistories(histories);
      }
    };
    fetchUserDetails();
  }, []);
  

  useEffect(() => {
    const updateChatHistory = async () => {
      if (user && agent && messages.length > 0) {
        const histories = await fetchAllChatHistories(user);
        setChatHistories(histories);
      }
    };
    
    updateChatHistory();
  }, [messages, user, agent]);

  async function fetchAllChatHistories(user) {
    if (!user || !agent) return [];
    
    const uGuid = user.uGuid;
    const agentID = agent.id;
   
    try {
      const chatResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chat-history-agent/${uGuid}/${agentID}`
      );

      if (chatResponse.status !== 200) {
        console.error("Error fetching chat history:", chatResponse.status);
        throw new Error("Could not retrieve chat history.");
      }

      const chat = chatResponse.data.chatLogs;
      const ids = chat.map(entry => entry.id);
  
      const chatHistories: ChatHistory[] = Object.entries(chat).map(
        ([agentID, data], index) => ({
          id: `${index + 1}`,
          date: (data as { role: string }).role.substring(0, 50),
          preview: (data as { content: string }).content.substring(0, 200),
          messages: chat,
        })
      );
  
      return chatHistories;
    } catch (error) {
      console.error("Error in fetchAllChatHistories:", error);
      return [];
    }
  }

  const suggestedPrompts: SuggestedPrompt[] = [
    { id: "1", text: "What is the weather today?" },
    { id: "2", text: "Tell me a joke." },
    { id: "3", text: "How can I improve my productivity?" },
  ];

  useEffect(() => {
    if (!agent) {
      navigate("/dashboard");
    }
  }, [agent, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    getAgentResponse(content)
      .then(agentResponseContent => {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: agentResponseContent,
          role: "agent",
        };
        setMessages((prev) => [...prev, agentResponse]);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error getting agent response:", error);
        toast.error("Failed to get response from the agent");
        setIsLoading(false);
      });
  };

  const getAgentResponse = async (userMessage: string): Promise<string> => {
    if (!user || !agent) {
      console.error("User or Agent data is missing.");
      return "User or Agent data not available.";
    }
    
    const uGuid = user.uGuid;
    const userName = user.name;
    const agentID = agent.id;

    try {
      const chatResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chat-history-agent/${uGuid}/${agentID}`
      );

      if (chatResponse.status !== 200) {
        console.error("Error fetching chat history:", chatResponse.status);
        return "Could not retrieve chat history.";
      }

      const chat = chatResponse.data.chatLogs;

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/${uGuid}/${agentID}`, 
        { userMessage, chat, userName }
      );
      return response.data.reply;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const loadChatHistory = (chatHistory: ChatHistory) => {
    setMessages(chatHistory.messages);
    setActiveTab("chat");
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (!agent) return null;

return (
    <div className="flex flex-col h-screen bg-[#1A1F2C] text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="mr-2 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft />
          </Button>
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              <img src={agent.avatar} alt={agent.name} className="rounded-full" />
            </Avatar>
            <div>
              <h1 className="font-semibold">{agent.name}</h1>
              <div className="flex items-center text-xs text-gray-400">
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-400 mr-1.5"></span>
                  Published
                </span>
                <span className="mx-2">•</span>
                <span>Everyone</span>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-auto"
        >
          <TabsList className="grid grid-cols-2 h-9 bg-[#2A2F3C]">
            <TabsTrigger 
              value="chat" 
              className="flex items-center gap-1 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <MessageSquare size={16} />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-1 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <History size={16} />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full pb-24"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="mb-8 text-center max-w-md">
                    <Avatar className="h-16 w-16 mb-4 mx-auto">
                      <img src={agent.avatar} alt={agent.name} className="rounded-full" />
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
                    <p className="text-gray-300 mb-6 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                      {agent.description}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3 mt-8 w-full max-w-md mx-auto max-h-[40vh] overflow-y-auto pr-2">
                      {suggestedPrompts.map((prompt) => (
                        <Button
                          key={prompt.id}
                          variant="outline"
                          className="w-full text-left h-auto p-3 bg-[#2A2F3C] hover:bg-[#3A3F4C] text-sm border-gray-700 hover:border-gray-600 whitespace-normal"
                          onClick={() => handlePromptClick(prompt.text)}
                        >
                          {prompt.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-20">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        message.role === "user" ? "ml-auto bg-blue-600" : "mr-auto bg-[#2A2F3C]"
                      } max-w-[80%] rounded-xl p-3`}
                    >
                      {message.content}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pb-16" // Added bottom margin
            >
              <h2 className="text-xl font-semibold mb-4">Chat History</h2>
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                {chatHistories.length > 0 ? (
                  [...chatHistories].reverse().map((history) => (
                    <motion.div
                      key={history.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#2A2F3C] rounded-lg p-4 hover:bg-[#3A3F4C] cursor-pointer"
                      onClick={() => loadChatHistory(history)}
                    >
                      <div className="text-sm text-gray-400 mb-1">{history.date}</div>
                      <div className="line-clamp-2">{history.preview}</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-gray-400">No chat history found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {activeTab === "chat" && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#222222] border-t border-gray-800 p-4">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
            >
              <Plus />
            </Button>
            <div className="flex-1 relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="resize-none min-h-[50px] max-h-[150px] bg-[#333333] border-gray-700 text-white placeholder:text-gray-500 w-full pr-12"
                disabled={isLoading}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 bottom-2 text-gray-400 hover:text-white hover:bg-blue-600 transition-colors duration-200"
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  <ArrowUp />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
