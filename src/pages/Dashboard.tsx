
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import InsightCard from "@/components/InsightCard";
import AgentSelector from "@/components/AgentSelector";
import WorkflowList from "@/components/WorkflowList";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Safely extract the user's name from metadata or use a fallback
  const userName = user?.user_metadata?.name || "User";
  
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
        <AgentSelector />
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
