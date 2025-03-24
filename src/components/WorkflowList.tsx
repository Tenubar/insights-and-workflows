
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, GitBranchPlus } from "lucide-react";

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "archived";
  lastRun?: string;
  steps: number;
};

const workflows: Workflow[] = [
  {
    id: "1",
    name: "Customer Onboarding",
    description: "Automate customer welcome and setup process",
    status: "active",
    lastRun: "2 hours ago",
    steps: 5,
  },
  {
    id: "2",
    name: "Data Analysis Pipeline",
    description: "Process and analyze customer data for insights",
    status: "active",
    lastRun: "1 day ago",
    steps: 8,
  },
  {
    id: "3",
    name: "Email Campaign Manager",
    description: "Create and schedule email marketing campaigns",
    status: "draft",
    steps: 4,
  },
  {
    id: "4",
    name: "Support Ticket Triage",
    description: "Automatically categorize and assign support tickets",
    status: "active",
    lastRun: "Just now",
    steps: 3,
  },
];

const WorkflowList = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="glass dark:glass-dark rounded-xl p-6 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Available Workflows</h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center">
          View all
          <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {workflows.map((workflow) => (
          <motion.div
            key={workflow.id}
            variants={item}
            whileHover={{ x: 4 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center cursor-pointer transition-all hover:shadow-sm"
          >
            <div>
              <div className="flex items-center">
                <h3 className="font-medium dark:text-white">{workflow.name}</h3>
                {workflow.status === "active" && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 mr-1"></span>
                    Active
                  </span>
                )}
                {workflow.status === "draft" && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{workflow.description}</p>
              
              <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center mr-4">
                  <GitBranchPlus size={12} className="mr-1" />
                  <span>{workflow.steps} steps</span>
                </div>
                
                {workflow.lastRun && (
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    <span>Last run {workflow.lastRun}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <button className="text-primary hover:text-primary/80 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default WorkflowList;
