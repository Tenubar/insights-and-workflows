
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import PageTransition from "@/components/PageTransition";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setSubmitted(true);
        toast.success("Check your email for the password reset link");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md shadow-xl rounded-xl w-full max-w-md p-8 border border-gray-100"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-3"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">IW</span>
              </div>
            </motion.div>
            <h1 className="text-2xl font-semibold">Reset Password</h1>
            <p className="text-gray-500 mt-1">We'll send you instructions to reset your password</p>
          </div>
          
          {submitted ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                <p>We've sent password reset instructions to <strong>{email}</strong>.</p>
                <p className="mt-2">Please check your email.</p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="mt-4 w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <span className="mr-2">Sending</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
              
              <div className="text-center text-sm mt-4">
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
