import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';

type AgentSelectorProps = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  uGuid: string;
  lastAgentId?: string | null;
  onAgentSelected?: (agentId: string) => void;
};

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  chatCount?: number;
}

const AgentSelector = ({ uGuid, lastAgentId, onAgentSelected }: AgentSelectorProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch agents from the back-end
    const fetchAgents = async () => {
      try {
          setLoading(true);
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/get-agents/${uGuid}`);
          const data = await response.json();
          
          // Fetch chat counts for each agent
          const agentsWithChatCount = await Promise.all(
            data.map(async (agent: Agent) => {
              try {
                const chatResponse = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/chat-history-agent/${uGuid}/${agent.id}`
                );
                const chatCount = chatResponse.data.chatLogs ? chatResponse.data.chatLogs.length : 0;
                return { ...agent, chatCount };
              } catch (error) {
                console.error(`Error fetching chat count for agent ${agent.id}:`, error);
                return { ...agent, chatCount: 0 };
              }
            })
          );
          
          setAgents(agentsWithChatCount);
          
          // Find the last selected agent if available
          if (lastAgentId) {
            const lastAgent = agentsWithChatCount.find((agent) => agent.id === lastAgentId);
            if (lastAgent) {
              setSelectedAgent(lastAgent);
              if (onAgentSelected) onAgentSelected(lastAgent.id);
              return;
            }
          }
          
          // Default to first agent if no last agent found
          setSelectedAgent(agentsWithChatCount.length > 0 ? agentsWithChatCount[0] : null);
          if (agentsWithChatCount.length > 0 && onAgentSelected) {
            onAgentSelected(agentsWithChatCount[0].id);
          }
      } catch (err) {
          console.error("Error fetching agents:", err);
          setAgents([]);
          setSelectedAgent(null);
      } finally {
          setLoading(false);
      }
    };
  
    fetchAgents(); // Fetch agents on component mount
  }, [uGuid, lastAgentId, onAgentSelected]);

  const handleAgentClick = () => {
    setIsOpen(!isOpen); // Toggle the dropdown when clicking the main agent
  };

  const handleChatButtonClick = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/chat", { state: { agent } });
  };

  const selectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    if (onAgentSelected) {
      onAgentSelected(agent.id);
    }
    setIsOpen(false);
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
        {selectedAgent && (
          <div 
            onClick={handleAgentClick}
            className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 cursor-pointer"
          >
            <div className="flex items-center flex-1 mb-3 sm:mb-0">
              <Avatar className="w-12 h-12 mr-4 shrink-0">
                <AvatarImage src={selectedAgent.avatar} alt={selectedAgent.name} />
                <AvatarFallback>{selectedAgent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="font-medium">{selectedAgent.name}</p>
                  {selectedAgent.chatCount !== undefined && selectedAgent.chatCount > 0 && (
                    <div className="ml-2 flex items-center">
                      <MessageSquare size={14} className="text-gray-500 mr-1" />
                      <span className="text-xs text-gray-500">{selectedAgent.chatCount}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {selectedAgent.description}
                </p>
              </div>
            </div>
            <div className="flex items-center ml-0 sm:ml-4 w-full sm:w-auto">
              <div className="mr-3">
                <Button
                  onClick={(e) => handleChatButtonClick(selectedAgent, e)}
                  className="flex items-center w-auto px-3"
                  size="sm"
                >
                  <MessageSquare className="mr-1" size={16} />
                  Chat
                </Button>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  isOpen ? "transform rotate-180" : ""
                )}
              />
            </div>
          </div>
        )}

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
                  <div
                    key={agent.id}
                    onClick={() => selectAgent(agent)}
                    className={cn(
                      "w-full flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-md relative cursor-pointer",
                      selectedAgent?.id === agent.id
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <Avatar className="w-10 h-10 mb-2 sm:mb-0 sm:mr-3 shrink-0">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left mb-2 sm:mb-0 dark:text-gray-100">
                      <div className="flex items-center">
                        <p className="font-medium">{agent.name}</p>
                        {agent.chatCount !== undefined && agent.chatCount > 0 && (
                          <div className="ml-2 flex items-center">
                            <MessageSquare size={14} className="text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">{agent.chatCount}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {agent.description}
                      </p>
                    </div>
                    <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end">
                      <div className="mr-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatButtonClick(agent, e);
                          }}
                          className="flex items-center w-auto px-3"
                          size="sm"
                        >
                          <MessageSquare className="mr-1" size={16} />
                          Chat
                        </Button>
                      </div>
                      {selectedAgent?.id === agent.id && (
                        <Check size={16} className="text-primary ml-2" />
                      )}
                    </div>
                  </div>
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
