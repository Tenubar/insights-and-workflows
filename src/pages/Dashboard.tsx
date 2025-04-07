import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import InsightCard from "@/components/InsightCard";
import AgentSelector from "@/components/AgentSelector";
import WorkflowList from "@/components/WorkflowList";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { checkSession } from "@/lib/utils"
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton";

// Define interface for agent data
interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  chat: Array<any>;
}

const Dashboard = () => {
  const { user, updateLoggedBefore, setUser } = useAuth();
  
  // Safely extract the user's name from metadata or use a fallback
  const userName = user?.name || "User";
  const loggedBefore = user?.loggedBefore;
  const uGuid = user?.uGuid;
  const id = ""; 
  const name = "";
  const description = "";
  const avatar = "";
  const [loading, setLoading] = useState(true);
  const [lastAgentId, setLastAgentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalConversations, setTotalConversations] = useState(0);
  const [workflowsCount, setWorkflowsCount] = useState(0);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const storedLastAgentId = localStorage.getItem('lastSelectedAgentId');
    if (storedLastAgentId) {
      setLastAgentId(storedLastAgentId);
    }

    const checkLoggedBefore = async () => {
      const fetchUserDetails = async () => {
        const userData = await checkSession();
        if (userData) {
          setUser(userData);
          const uGuid = userData.uGuid;
          fetchAgentsAndConversations(uGuid);
        }
      };
  
      fetchUserDetails();
    
      if (!loggedBefore && uGuid) {
        try {

          // Agents data fetching and posting

          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/update-logged-before`, {
            uGuid,
            loggedBefore: true,
          },{withCredentials: true});

          const [getAgent1, getAgent2] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/get-agent/${1}`),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/get-agent/${2}`),
          ]);

          const agents = [getAgent1, getAgent2]
            .map((response, index) => {
              if (response.data?.item) {
                return {
                  description: response.data.item.description,
                  instructions: response.data.item.instructions,
                  name: response.data.item.name,
                  avatar: response.data.item.avatar,
                  id: response.data.item.id,
                  chat: [],
                };
              } else {
                console.error(
                  `Error: Agent ${index + 1} data or item is undefined`
                );
                return null;
              }
            })
            .filter(Boolean);

          await Promise.all(
            agents.map(async (agent) => {
              await axios.post(`${import.meta.env.VITE_API_BASE_URL}/post-agent`, {
                uGuid,
                agent,
              });
              console.log(`Agent ${agent.name} posted successfully`);
            })
          );

          // Workflows data fetching and posting
          const workflow1 = 'en32bviety20nmfs8m';
          const [getWorkflow1] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/get-workflow/${workflow1}`),
          ]);

          const workflows = [getWorkflow1]
            .map((response, index) => {
              if (response.data?.item) {
                const workflowData =
                typeof response.data.item.workflowData === "string"
                  ? JSON.parse(response.data.item.workflowData) // Parse if string
                  : response.data.item.workflowData; // Use as is if already an object

                const steps =  
                typeof response.data.item.steps === "string"
                ? JSON.parse(response.data.item.steps) // Parse if string
                : response.data.item.steps; // Use as is if already an object

                return {
                  description: response.data.item.description,
                  name: response.data.item.name,
                  status: response.data.item.status,
                  steps,
                  workflowData
                };
              } else {
                console.error(
                  `Error: Agent ${index + 1} data or item is undefined`
                );
                return null;
              }
            })
            .filter(Boolean);

            await Promise.all(
              workflows.map(async (workflow) => {
                console.log(workflow);
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/post-workflow`, {
                  uGuid,
                  workflow,
                });
                console.log(`Workflow ${workflow.name} posted successfully`);
              })
            );

        } catch (err) {
          console.error("Error updating loggedBefore:", err);
        } finally {
          updateLoggedBefore(true);
          setLoading(false);
          console.log("Logged Before updated successfully");
        }
      } else {
        setLoading(false);
      }

      const fetchAgentsAndConversations = async (uGuid: string) => {
        setInsightsLoading(true);
        if (!uGuid || typeof uGuid !== "string") {
          console.error("Error: uGuid is not provided.");
          setInsightsLoading(false);
          return;
        }
    
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/get-agents/${uGuid}`
          );
    
          if (response) {
            setAgents(response.data);
    
            let totalMessages = 0;
            for (const agent of response.data) {
              if (agent.chat && Array.isArray(agent.chat)) {
                totalMessages += agent.chat.length;
              }
            }
            setTotalConversations(totalMessages);
            
            setWorkflowsCount(4);
          } else {
            console.warn("Warning: Invalid response format. Expected an array of agents.");
          }
        } catch (error) {
          console.error("Error fetching agents data:", error.message || error);
        } finally {
          setInsightsLoading(false);
        }
      };

    };

    checkLoggedBefore();
  }, []); // Empty dependency array ensures useEffect runs once

  const handleAgentSelected = (agentId: string) => {
    localStorage.setItem('lastSelectedAgentId', agentId);
    setLastAgentId(agentId);
  };

  const insightData = [
    {
      title: "Time Saved",
      value: "0",
      type: "time" as const,
      change: 0,
      tooltip: "Time Saved"
    },
    {
      title: "Active Agents",
      value: insightsLoading ? "..." : agents.length,
      type: "agents" as const,
      change: 0,
      tooltip: "Agents Available"
    },
    {
      title: "Workflows",
      value: insightsLoading ? "..." : workflowsCount,
      type: "workflows" as const,
      change: 0,
      tooltip: "Workflows Available"
    },
    {
      title: "AI Conversations",
      value: insightsLoading ? "..." : totalConversations,
      type: "conversations" as const,
      change: 0,
      tooltip: "Chat Messages"
    },
  ];
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          Welcome back, {userName.split(" ")[0]}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500"
        >
          Here's what's happening with your workflows today
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {insightData.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {insightsLoading ? (
              <div className="glass dark:glass-dark rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16 mt-4" />
              </div>
            ) : (
              <InsightCard {...insight} />
            )}
          </motion.div>
        ))}
      </div>
    
      <div className="mb-10">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-medium mb-4"
      >
        Your Assistant
      </motion.h2>

      {!loading &&(
        <AgentSelector
          uGuid={uGuid}
          id={id}
          name={name}
          description={description}
          avatar={avatar}
          lastAgentId={lastAgentId}
          onAgentSelected={handleAgentSelected}
        />
      )}

      {loading && (
        <p>Loading... Please wait.</p> // Optional loading indicator
      )}
    </div>

      <div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-medium mb-4"
        >
          Workflows
        </motion.h2>
        <WorkflowList />
      </div>
    </DashboardLayout>
  );
};


export default Dashboard;
