import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import InsightCard from "@/components/InsightCard";
import AgentSelector from "@/components/AgentSelector";
import WorkflowList from "@/components/WorkflowList";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { checkSession } from "@/lib/utils"
import axios from 'axios';


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
  const [loading, setLoading] = useState(true); // New state for loading
  const [lastAgentId, setLastAgentId] = useState<string | null>(null);

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
        }
      };
  
      fetchUserDetails();
    
      if (!loggedBefore && uGuid) {
        try {
          
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
        } catch (err) {
          console.error("Error updating loggedBefore:", err);
        } finally {
          updateLoggedBefore(true);
          setLoading(false);
          console.log("Logged Before updated successfully");
        }
      } else {
        // If loggedBefore is true, stop the loading state
        setLoading(false);
      }
    };

    // Execute the function only once
    checkLoggedBefore();
  }, []); // Empty dependency array ensures useEffect runs once


  const handleAgentSelected = (agentId: string) => {
    localStorage.setItem('lastSelectedAgentId', agentId);
    setLastAgentId(agentId);
  };

  const insightData = [
    {
      title: "Time Saved",
      value: "32 hours",
      type: "time" as const,
      change: 12,
    },
    {
      title: "Active Agents",
      value: 4,
      type: "agents" as const,
      change: 33,
    },
    {
      title: "Workflows",
      value: 16,
      type: "workflows" as const,
      change: 8,
    },
    {
      title: "AI Conversations",
      value: 247,
      type: "conversations" as const,
      change: -5,
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
            <InsightCard {...insight} />
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
          // getAgents={getAgents}
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
