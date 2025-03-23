
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowUp, ArrowLeft, MessageSquare, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
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

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agent = location.state?.agent;
  const [activeTab, setActiveTab] = useState("chat");
  
  // Mock chat history data
  const chatHistories: ChatHistory[] = [
    {
      id: "1",
      date: "Today, 2:30 PM",
      preview: "I feel like I have too much on my plate and don't know how to prioritize.",
      messages: [
        {
          id: "h1-1",
          content: "I feel like I have too much on my plate and don't know how to prioritize.",
          sender: "user"
        },
        {
          id: "h1-2",
          content: "Having too much on your plate can be overwhelming. Try listing everything you need to do, then categorize by urgency and importance. Focus on high priority items first, and don't be afraid to delegate or postpone less critical tasks.",
          sender: "agent"
        }
      ]
    },
    {
      id: "2",
      date: "Yesterday, 10:15 AM",
      preview: "I'm feeling stuck in my job, but I'm scared to make a change.",
      messages: [
        {
          id: "h2-1",
          content: "I'm feeling stuck in my job, but I'm scared to make a change.",
          sender: "user"
        },
        {
          id: "h2-2",
          content: "It's common to feel stuck in your career. Consider what aspects of your current role you enjoy and what's missing. Small steps toward change can feel less overwhelming than a complete overhaul.",
          sender: "agent"
        }
      ]
    },
    {
      id: "3",
      date: "Oct 10, 2023",
      preview: "I keep doubting myself. How do I stop feeling like I'm not good enough?",
      messages: [
        {
          id: "h3-1",
          content: "I keep doubting myself. How do I stop feeling like I'm not good enough?",
          sender: "user"
        },
        {
          id: "h3-2",
          content: "Self-doubt is something we all experience. Try to recognize your accomplishments, no matter how small, and be as kind to yourself as you would be to a friend facing the same feelings.",
          sender: "agent"
        }
      ]
    }
  ];
  
  const suggestedPrompts: SuggestedPrompt[] = [
    {
      id: "1", 
      text: "I'm feeling stuck in my job, but I'm scared to make a change."
    },
    {
      id: "2", 
      text: "I keep doubting myself. How do I stop feeling like I'm not good enough?"
    },
    {
      id: "3", 
      text: "I don't know how to stop comparing myself to others."
    },
    {
      id: "4", 
      text: "I feel like I have too much on my plate and don't know how to prioritize."
    }
  ];

  useEffect(() => {
    // Redirect if no agent data was passed
    if (!agent) {
      navigate("/dashboard");
    }
  }, [agent, navigate]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate agent response (in a real app, this would be an API call)
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAgentResponse(content),
        sender: "agent",
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);
  };

  const getAgentResponse = (userMessage: string): string => {
    // This would typically be an API call to a backend service
    // For now, we'll return a simple response based on keywords
    if (userMessage.toLowerCase().includes("stuck") || userMessage.toLowerCase().includes("job")) {
      return "It's common to feel stuck in your career. Consider what aspects of your current role you enjoy and what's missing. Small steps toward change can feel less overwhelming than a complete overhaul.";
    } else if (userMessage.toLowerCase().includes("doubt") || userMessage.toLowerCase().includes("not good enough")) {
      return "Self-doubt is something we all experience. Try to recognize your accomplishments, no matter how small, and be as kind to yourself as you would be to a friend facing the same feelings.";
    } else if (userMessage.toLowerCase().includes("comparing")) {
      return "Comparison is a natural human tendency, but it often robs us of joy. Try to focus on your personal growth journey rather than measuring yourself against others.";
    } else if (userMessage.toLowerCase().includes("prioritize") || userMessage.toLowerCase().includes("too much")) {
      return "Having too much on your plate can be overwhelming. Try listing everything you need to do, then categorize by urgency and importance. Focus on high priority items first, and don't be afraid to delegate or postpone less critical tasks.";
    }
    
    return "I understand what you're going through. Let's explore this further together. What specific aspects of this situation are most challenging for you?";
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
  };

  if (!agent) return null;

  return (
    <div className="flex flex-col h-screen bg-[#1A1F2C] text-white">
      {/* Header */}
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
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="mb-8 text-center max-w-md">
                    <Avatar className="h-16 w-16 mb-4 mx-auto">
                      <img src={agent.avatar} alt={agent.name} className="rounded-full" />
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
                    <p className="text-gray-300 mb-6">
                      {agent.description}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3 mt-8 w-full max-w-md mx-auto">
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
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        message.sender === "user" ? "ml-auto bg-blue-600" : "mr-auto bg-[#2A2F3C]"
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
            >
              <h2 className="text-xl font-semibold mb-4">Chat History</h2>
              <div className="space-y-3">
                {chatHistories.map((history) => (
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
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Input area - only show in chat tab */}
      {activeTab === "chat" && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#222222] border-t border-gray-800 p-4">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Plus />
            </Button>
            <div className="flex-1 relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="resize-none min-h-[50px] max-h-[150px] bg-[#333333] border-gray-700 text-white placeholder:text-gray-500 w-full pr-12"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 bottom-2 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
              >
                <ArrowUp />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
