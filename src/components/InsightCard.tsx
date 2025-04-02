
import { motion } from "framer-motion";
import { Clock, Users, GitBranchPlus, MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type InsightCardProps = {
  title: string;
  value: string | number;
  type: "time" | "agents" | "workflows" | "conversations";
  change?: number;
  tooltip?: string;
};

const InsightCard = ({ title, value, type, change, tooltip }: InsightCardProps) => {
  const icons = {
    time: Clock,
    agents: Users,
    workflows: GitBranchPlus,
    conversations: MessageCircle,
  };
  
  const Icon = icons[type];
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass dark:glass-dark rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full bg-gray-100/60 dark:bg-gray-800/60 p-2 cursor-help">
                  <Icon size={16} className="text-primary dark:text-sidebar-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip || title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold dark:text-white">{value}</p>
            
            {change !== undefined && (
              <p className={`text-xs ${change >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"} mt-1`}>
                {change >= 0 ? "+" : ""}{change}% from last week
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightCard;
