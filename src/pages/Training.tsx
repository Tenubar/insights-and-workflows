
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Save, Dumbbell } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { checkSession } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext";
import axios from 'axios';
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const trainingFormSchema = z.object({
  Yourself: z.string().min(10, {
    message: "About yourself must be at least 10 characters.",
  }),
  Niche: z.string().min(3, {
    message: "Your niche must be at least 3 characters.",
  }),
  Offers: z.string().min(10, {
    message: "Your offers must be at least 10 characters.",
  }),
  Business: z.string().min(10, {
    message: "About your business must be at least 10 characters.",
  }),
  Website: z.string().min(10, {
    message: "About your website must be at least 10 characters.",
  }),
});

type TrainingFormValues = z.infer<typeof trainingFormSchema>;

const defaultValues: Partial<TrainingFormValues> = {
  Yourself: "",
  Niche: "",
  Offers: "",
  Business: "",
  Website: "",
};

const Training = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  interface InitialData {
    hasBeenFetched?: boolean;
    [key: string]: any;
  }

  const [initialData, setInitialData] = useState<InitialData>({});

  const { user, setUser } = useAuth();
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userData = await checkSession();
      if (userData) {
        setUser(userData);
      }
    };

    fetchUserDetails();
  }, []);

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Skip fetching if initialData has been fetched or user/uGuid is unavailable
      if (!user || !user.uGuid || initialData?.hasBeenFetched) {
        console.log("Skipping fetch: User data not available or already fetched.");
        return;
      }
  
      const uGuid = user.uGuid;
      setLoading(true);
  
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get-training-data/${uGuid}`);
        const trainingInfo = response.data.trainingInfo;
  
        // Transform trainingInfo into initial form values
        const formValues = trainingInfo.reduce((acc, item) => {
          acc[item.field] = item.value;
          return acc;
        }, {});
  
        console.log("Fetched training data:", formValues);
        
        // Log the data as an array
        console.log("Training data as array:", trainingInfo);
  
        // Add a flag to prevent refetching
        setInitialData({ ...formValues, hasBeenFetched: true });
        form.reset(formValues); // Populate the form fields with fetched data
      } catch (error) {
        console.error("Error fetching training data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user, initialData]);

  const onSubmit = async (data: TrainingFormValues) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Convert form data to array format and log it
    const formDataArray = [
      { field: "Yourself", value: data.Yourself },
      { field: "Niche", value: data.Niche },
      { field: "Offers", value: data.Offers },
      { field: "Business", value: data.Business },
      { field: "Website", value: data.Website }
    ];
    
    console.log("Form submitted data as array:", formDataArray);

    const uGuid = user.uGuid;
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/post-training-data/${uGuid}`, {
      formDataArray,
    });
    
    toast.success("Training data saved successfully!");
    setIsSaving(false);
  };

  // Load animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderFormField = (name: keyof TrainingFormValues, label: string, description: string, inputType: "input" | "textarea" = "textarea") => {
    if (loading) {
      return (
        <motion.div variants={itemVariants} className="space-y-2">
          <Skeleton className="h-5 w-1/4 mb-1" />
          <Skeleton className={`w-full ${inputType === "textarea" ? "h-[100px]" : "h-10"}`} />
          <Skeleton className="h-4 w-2/3" />
        </motion.div>
      );
    }
    
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {inputType === "textarea" ? (
                <Textarea 
                  placeholder={`Enter ${label.toLowerCase()}...`} 
                  className="min-h-[100px] resize-y"
                  {...field} 
                />
              ) : (
                <Input placeholder={`Enter ${label.toLowerCase()}...`} {...field} />
              )}
            </FormControl>
            <FormDescription>
              {description}
            </FormDescription>
          </FormItem>
        )}
      />
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Training</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your agent training data and sessions</p>
      </div>
      
      <div className="glass dark:glass-dark rounded-xl p-8 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
        <Form {...form}>
          <motion.form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Context Info Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <Dumbbell className="h-5 w-5" />
                Context Info
              </h2>
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  {renderFormField(
                    "Yourself", 
                    "About Yourself",
                    "Share details about yourself that will help your agent understand you better.",
                    "textarea"
                  )}
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  {renderFormField(
                    "Niche",
                    "Your Niche",
                    "What specific area or industry do you specialize in?",
                    "input"
                  )}
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  {renderFormField(
                    "Offers",
                    "Your Offers",
                    "Describe the products or services you offer to your clients or customers.",
                    "textarea"
                  )}
                </motion.div>
              </motion.div>
            </div>
            
            {/* Business Info Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <Dumbbell className="h-5 w-5" />
                Business Info
              </h2>
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  {renderFormField(
                    "Business",
                    "About Your Business",
                    "Share details about your business mission, vision, and values.",
                    "textarea"
                  )}
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  {renderFormField(
                    "Website",
                    "About Your Website",
                    "Describe your website's purpose, content, and target audience.",
                    "textarea"
                  )}
                </motion.div>
              </motion.div>
            </div>
            
            {/* Save Button */}
            <motion.div 
              className="flex justify-end"
              variants={itemVariants}
            >
              <Button 
                type="submit" 
                className="gap-2"
                disabled={isSaving || loading}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default Training;
