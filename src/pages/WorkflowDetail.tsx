
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Define the workflow type
type Workflow = {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "archived";
  lastRun?: string;
  steps: number;
};

// Mock workflows data (to be replaced with actual data fetching)
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

// Input field type
type InputField = {
  id: string;
  name: string;
  enabled: boolean;
  value: string;
};

const WorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<InputField[]>([
    { id: "1", name: "Customer Email", enabled: true, value: "" },
    { id: "2", name: "Welcome Message", enabled: true, value: "" },
    { id: "3", name: "Priority Level", enabled: false, value: "" },
  ]);

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      const foundWorkflow = workflows.find(w => w.id === id);
      if (foundWorkflow) {
        setWorkflow(foundWorkflow);
      }
      setLoading(false);
    }, 800);
  }, [id]);

  const handleInputChange = (inputId: string, value: string) => {
    setInputs(prev => 
      prev.map(input => 
        input.id === inputId ? { ...input, value } : input
      )
    );
  };

  const handleEnableChange = (inputId: string, enabled: boolean) => {
    setInputs(prev => 
      prev.map(input => 
        input.id === inputId ? { ...input, enabled } : input
      )
    );
  };

  const handleRunWorkflow = () => {
    const enabledInputs = inputs
      .filter(input => input.enabled)
      .map(input => ({ name: input.name, value: input.value }));
    
    console.log("Running workflow with inputs:", enabledInputs);
    toast.success("Workflow started successfully!");
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
      <div className="max-w-4xl mx-auto">
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
          
          {user && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {user.name}
              </span>
            </div>
          )}
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{workflow.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{workflow.description}</p>
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
                      className={!input.enabled ? "text-gray-400 dark:text-gray-500" : ""}
                    >
                      {input.name}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={`enable-${input.id}`}
                        checked={input.enabled}
                        onCheckedChange={(checked) => 
                          handleEnableChange(input.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`enable-${input.id}`}
                        className="text-sm text-gray-500 dark:text-gray-400"
                      >
                        Enable
                      </Label>
                    </div>
                  </div>
                  
                  {input.name === "Welcome Message" ? (
                    <Textarea
                      id={`input-${input.id}`}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      disabled={!input.enabled}
                      placeholder={`Enter ${input.name.toLowerCase()}...`}
                      className="w-full"
                    />
                  ) : (
                    <Input
                      id={`input-${input.id}`}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      disabled={!input.enabled}
                      placeholder={`Enter ${input.name.toLowerCase()}...`}
                      className="w-full"
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
            >
              <Play size={18} className="mr-2" />
              Run Workflow
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default WorkflowDetail;
