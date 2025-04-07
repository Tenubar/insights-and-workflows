import { motion } from "framer-motion";
import { ArrowRight, Clock, GitBranchPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink 
} from "@/components/ui/pagination";
import { checkSession } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import axios from 'axios';
import { toast } from "@/components/ui/sonner";

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "archived";
  lastRun?: string;
  steps: Array<{
    id: string;
    name: string;
    type?: string;
  }>;
};

const ITEMS_PER_PAGE = 5;

const WorkflowList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get current user data if not available
        let userData = user;
        if (!userData || !userData.uGuid) {
          userData = await checkSession();
          if (userData) {
            setUser(userData);
          } else {
            throw new Error("User not authenticated");
          }
        }
        
        // Now fetch workflows with the user GUID
        await fetchWorkflows(userData.uGuid);
      } catch (err) {
        console.error("Error initializing workflow list:", err);
        setError("Failed to load workflows. Please try again later.");
        toast.error("Failed to load workflows");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchWorkflows = async (uGuid: string) => {
    try {
      if(!uGuid) {
        setError("User not authenticated. Please log in.");
        return;
      }
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/get-workflows/${uGuid}`);
      if (!response.data) {
        throw new Error("Failed to fetch workflows");
      }
      
      // Transform the data to ensure each workflow has properly structured steps
      const processedData = response.data.map((workflow: any) => {
        // Ensure steps is always an array with proper structure
        let processedSteps = Array.isArray(workflow.steps) ? workflow.steps : [];
        
        // If it's empty, add some default steps
        if (processedSteps.length === 0) {
          processedSteps = [
            { id: "step1", name: "Customer Email", type: "text" },
            { id: "step2", name: "Welcome Message", type: "textarea" },
            { id: "step3", name: "Priority Level", type: "text" }
          ];
        }
        
        return {
          ...workflow,
          steps: processedSteps
        };
      });
      
      setWorkflows(processedData);
    } catch (err) {
      console.error("Error fetching workflows:", err);
      setError("Failed to load workflows. Please try again later.");
      throw err; // rethrow to be handled by the caller
    }
  };

  const totalPages = Math.ceil(workflows.length / ITEMS_PER_PAGE);
  const hasMoreThanOnePage = workflows.length > ITEMS_PER_PAGE;
  
  const displayedWorkflows = workflows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
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

  const handleWorkflowClick = (workflow: any) => {
    // Extract the workflow ID from the workflow object
    const workflowId = workflow.workflowData?.workflow_id?.S || workflow.id;
    
    // Navigate to the workflow detail page with the workflow data
    navigate(`/workflow/${workflowId}`, { 
      state: { workflow: workflow }
    });
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        {displayedWorkflows.map((workflow) => (
          <motion.div
            key={workflow.id}
            variants={item}
            whileHover={{ x: 4 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center cursor-pointer transition-all hover:shadow-sm"
            onClick={() => handleWorkflowClick(workflow)}
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
                  <span>{Array.isArray(workflow.steps) ? workflow.steps.length : 0} steps</span>
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

      {hasMoreThanOnePage && (
        <div className="mt-6">
          <Pagination className="mt-4">
            <PaginationContent>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink 
                    isActive={currentPage === index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className="cursor-pointer transition-all hover:bg-primary/10 active:bg-primary/20 active:scale-95"
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default WorkflowList;
