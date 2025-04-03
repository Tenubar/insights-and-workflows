
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
  // const form = useForm({ defaultValues: {} });

  useEffect(() => {
    const fetchData = async () => {
      // Skip fetching if initialData has been fetched or user/uGuid is unavailable
      if (!user || !user.uGuid || initialData?.hasBeenFetched) {
        console.log("Skipping fetch: User data not available or already fetched.");
        return;
      }
  
      const uGuid = user.uGuid;
  
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get-training-data/${uGuid}`);
        const trainingInfo = response.data.trainingInfo;
  
        // Transform trainingInfo into initial form values
        const formValues = trainingInfo.reduce((acc, item) => {
          acc[item.field] = item.value;
          return acc;
        }, {});
  
        console.log("Fetched training data:", formValues);
  
        // Add a flag to prevent refetching
        setInitialData({ ...formValues, hasBeenFetched: true });
        form.reset(formValues); // Populate the form fields with fetched data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching training data:", error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user, initialData]);



  const onSubmit = async (data: TrainingFormValues) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Training data saved successfully!");
    setIsSaving(false);
    
    // Convert form data to array format and log it
    const formDataArray = [
      { field: "Yourself", value: data.Yourself },
      { field: "Niche", value: data.Niche },
      { field: "Offers", value: data.Offers },
      { field: "Business", value: data.Business },
      { field: "Website", value: data.Website }
    ];

    const uGuid = user.uGuid;
     await axios.post(`${import.meta.env.VITE_API_BASE_URL}/post-training-data/${uGuid}`, {
      formDataArray,
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Training</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your agent training data and sessions</p>
      </div>
      
      <div className="glass dark:glass-dark rounded-xl p-8 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Context Info Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <Dumbbell className="h-5 w-5" />
                Context Info
              </h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="Yourself"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Yourself</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about yourself..." 
                          className="min-h-[100px] resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Share details about yourself that will help your agent understand you better.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Niche</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Digital Marketing, Finance, Health..." {...field} />
                      </FormControl>
                      <FormDescription>
                        What specific area or industry do you specialize in?
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Offers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Offers</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your products or services..." 
                          className="min-h-[100px] resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the products or services you offer to your clients or customers.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Business Info Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <Dumbbell className="h-5 w-5" />
                Business Info
              </h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="Business"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Your Business</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your business..." 
                          className="min-h-[100px] resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Share details about your business mission, vision, and values.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Your Website</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share details about your website..." 
                          className="min-h-[100px] resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe your website's purpose, content, and target audience.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Save Button */}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="gap-2"
                disabled={isSaving}
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
            </div>

          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default Training;
