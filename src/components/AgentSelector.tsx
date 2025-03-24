
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Agent = {
  id: string;
  name: string;
  description: string;
  avatar: string;
};

const agents: Agent[] = [
  {
    id: "1",
    name: "Donna AI: Your Empowering Life Coach",
    description: "Donna AI is your confident, insightful life coach, inspired by Donna Paulsen from Suits. She blends wit, charm, and wisdom to guide you through challenges, uncover your 'why,' and help you thrive. With Donna, you're not just supported—you're empowered.",
    avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=300&auto=format&fit=crop&q=80&crop=faces",
  },
  {
    id: "2",
    name: "Sales Assistant",
    description: "Helps with product recommendations and sales",
    avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&auto=format&fit=crop&q=80&crop=faces",
  },
  {
    id: "3",
    name: "Data Analyst",
    description: "Processes and analyzes data for insights",
    avatar: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&auto=format&fit=crop&q=80&crop=faces",
  },
];

const AgentSelector = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAgentClick = () => {
    setIsOpen(!isOpen); // Toggle the dropdown when clicking the main agent
  };

  const handleChatButtonClick = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/chat", { state: { agent } });
  };

  return (
    <div className="glass dark:glass-dark rounded-xl p-4 md:p-6 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Select an Agent</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {isOpen ? "Hide agents" : "View all"}
        </button>
      </div>

      <div className="relative">
        <button
          onClick={handleAgentClick}
          className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100"
        >
          <div className="flex items-center flex-1 mb-3 sm:mb-0">
            <Avatar className="w-12 h-12 mr-4 shrink-0">
              <AvatarImage src={selectedAgent.avatar} alt={selectedAgent.name} />
              <AvatarFallback>{selectedAgent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{selectedAgent.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{selectedAgent.description}</p>
            </div>
          </div>
          <div className="flex items-center ml-0 sm:ml-4 w-full sm:w-auto">
            <Button
              onClick={(e) => handleChatButtonClick(selectedAgent, e)}
              className="mr-3 flex items-center w-full sm:w-auto"
              size="sm"
            >
              <MessageSquare className="mr-1" size={16} />
              Chat with Agent
            </Button>
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-200",
                isOpen ? "transform rotate-180" : ""
              )}
            />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10"
            >
              <div className="p-2 grid grid-cols-1 gap-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                    }}
                    className={cn(
                      "w-full flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-md relative",
                      selectedAgent.id === agent.id 
                        ? "bg-blue-50 dark:bg-blue-900/30" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <Avatar className="w-10 h-10 mb-2 sm:mb-0 sm:mr-3 shrink-0">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left mb-2 sm:mb-0 dark:text-gray-100">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{agent.description}</p>
                    </div>
                    <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end">
                      <Button
                        onClick={(e) => handleChatButtonClick(agent, e)}
                        className="mr-3 flex items-center"
                        size="sm"
                      >
                        <MessageSquare className="mr-1" size={16} />
                        Chat
                      </Button>
                      {selectedAgent.id === agent.id && (
                        <Check size={16} className="text-primary ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AgentSelector;
