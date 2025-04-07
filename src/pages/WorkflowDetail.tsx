
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, History, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Define the workflow type
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
  workflowData?: any; // For API response format
};

// Define a workflow run type
type WorkflowRun = {
  id: string;
  date: string;
  status: "success" | "failed" | "running";
  duration: string;
};

// Input field type
type InputField = {
  id: string;
  name: string;
  value: string;
  type?: string;
};

const WorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [inputs, setInputs] = useState<InputField[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const allInputsValid = inputs.every(input => input.value.trim().length > 0);

  useEffect(() => {
    // Get workflow data from the router state
    const workflowFromState = location.state?.workflow;
    
    if (workflowFromState) {
      setWorkflow(workflowFromState);
      
      // Initialize inputs based on workflow steps
      if (Array.isArray(workflowFromState.steps) && workflowFromState.steps.length > 0) {
        const initialInputs = workflowFromState.steps.map(step => ({
          id: step.id || Math.random().toString(36).substr(2, 9),
          name: step.name || "Untitled Input",
          value: "",
          type: step.type || "text"
        }));
        setInputs(initialInputs);
      } else {
        // Default inputs if no steps are defined
        setInputs([
          { id: "default1", name: "Customer Email", value: "", type: "text" },
          { id: "default2", name: "Welcome Message", value: "", type: "textarea" },
          { id: "default3", name: "Priority Level", value: "", type: "text" }
        ]);
      }
      
      // Initialize with empty workflow runs
      setWorkflowRuns([]);
      setLoading(false);
    } else if (id) {
      // Fallback: fetch workflow by ID if not available in state
      // This would be an API call in a real application
      setLoading(true);
      setTimeout(() => {
        // Mock data for demonstration
        const mockWorkflow = {
          id: id,
          name: "Workflow " + id,
          description: "This is a workflow description",
          status: "active" as const,
          steps: [
            { id: "step1", name: "Customer Email", type: "text" },
            { id: "step2", name: "Welcome Message", type: "textarea" },
            { id: "step3", name: "Priority Level", type: "text" }
          ]
        };
        setWorkflow(mockWorkflow);
        
        // Initialize inputs based on workflow steps
        const initialInputs = mockWorkflow.steps.map(step => ({
          id: step.id,
          name: step.name,
          value: "",
          type: step.type
        }));
        setInputs(initialInputs);
        
        // Initialize with empty workflow runs
        setWorkflowRuns([]);
        setLoading(false);
      }, 800);
    }
  }, [id, location.state]);

  const handleInputChange = (inputId: string, value: string) => {
    setInputs(prev => 
      prev.map(input => 
        input.id === inputId ? { ...input, value } : input
      )
    );
  };

  const handleRunWorkflow = () => {
    if (!allInputsValid) {
      toast.error("All fields are required to run the workflow");
      return;
    }
  
    const inputValues = inputs.map(input => ({ name: input.name, value: input.value }));
    console.log("Running workflow with inputs:", inputValues);
    
    // Set is running to true to disable the button
    setIsRunning(true);
    
    // Create a new workflow run with running status
    const newRun: WorkflowRun = {
      id: `run-${Date.now()}`,
      date: new Date().toLocaleString(),
      status: "running",
      duration: "ongoing"
    };
    
    // Add to workflow runs at the top
    setWorkflowRuns(prev => [newRun, ...prev]);
    
    // Show success toast
    toast.success("Workflow started successfully!");
    
    // Simulate workflow completion after 3 seconds
    setTimeout(() => {
      setIsRunning(false);
      // Update the status of the workflow run to success
      setWorkflowRuns(prev => [
        { ...prev[0], status: "success", duration: "2.5s" },
        ...prev.slice(1)
      ]);
    }, 3000);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const getStatusColor = (status: WorkflowRun['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const slideTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="animate-pulse h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
          <div className="animate-pulse h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="animate-pulse h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="animate-pulse h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
            ))}
          </div>
          <div className="animate-pulse h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-md mt-8"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!workflow) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Workflow Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The workflow you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto overflow-hidden">
        {/* Main content with history transition */}
        <div className="relative flex">
          <AnimatePresence initial={false} mode="wait">
            {!showHistory ? (
              <motion.div
                key="workflow-content"
                className="w-full"
                initial={{ x: showHistory ? "-100%" : 0 }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={slideTransition}
              >
                <div className="flex items-center justify-between mb-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </Button>
                </div>
                
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <motion.div variants={itemVariants} className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                      {workflow?.workflowData?.workflow_name?.S || workflow?.name}
                    </h1>
                    <Button 
                      variant="outline" 
                      onClick={toggleHistory}
                      className="flex items-center gap-2"
                    >
                      <History size={16} />
                      Workflow History
                    </Button>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="text-gray-500 dark:text-gray-400 -mt-6">
                    {workflow?.workflowData?.description?.S || workflow?.description}
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
                  >
                    <h2 className="text-xl font-semibold mb-6">Workflow Inputs</h2>
                    
                    <div className="space-y-6">
                      {inputs.map((input) => (
                        <div key={input.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label 
                              htmlFor={`input-${input.id}`}
                              className="flex items-center"
                            >
                              {input.name}
                            </Label>
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                input.value.trim().length > 0 
                                  ? "bg-green-500 border-green-500 text-white" 
                                  : "border-gray-300 dark:border-gray-600"
                              }`}>
                                {input.value.trim().length > 0 && <Check size={14} />}
                              </div>
                            </div>
                          </div>
                          
                          {input.type === "textarea" ? (
                            <Textarea
                              id={`input-${input.id}`}
                              value={input.value}
                              onChange={(e) => handleInputChange(input.id, e.target.value)}
                              placeholder={`Enter ${input.name.toLowerCase()}...`}
                              className="w-full"
                              required
                            />
                          ) : (
                            <Input
                              id={`input-${input.id}`}
                              value={input.value}
                              onChange={(e) => handleInputChange(input.id, e.target.value)}
                              placeholder={`Enter ${input.name.toLowerCase()}...`}
                              className="w-full"
                              required
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex justify-center">
                    <Button 
                      size="lg" 
                      onClick={handleRunWorkflow}
                      className="px-8"
                      disabled={!allInputsValid || isRunning}
                    >
                      {isRunning ? (
                        <>
                          <Clock size={18} className="mr-2 animate-pulse" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={18} className="mr-2" />
                          Run Workflow
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="history-panel"
                className="w-full"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={slideTransition}
              >
                <div className="mb-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleHistory}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft size={16} />
                    Back to Workflow
                  </Button>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold tracking-tight mb-6">
                    {workflow?.workflowData?.workflow_name?.S || workflow?.name} History
                  </h1>
                  
                  {workflowRuns.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">No workflow runs yet</p>
                      <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
                        Run the workflow to see history here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workflowRuns.map(run => (
                        <motion.div
                          key={run.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center cursor-pointer hover:shadow-sm transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{run.date}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                                {run.status === 'running' ? (
                                  <span className="flex items-center">
                                    <Clock size={10} className="mr-1 animate-pulse" />
                                    Running
                                  </span>
                                ) : (
                                  run.status.charAt(0).toUpperCase() + run.status.slice(1)
                                )}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Duration: {run.duration}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkflowDetail;
