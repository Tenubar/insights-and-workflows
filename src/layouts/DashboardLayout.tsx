
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#1A1F2C] dark:text-white">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <div className="absolute top-4 right-6 z-10">
          <ThemeToggle />
        </div>
        <main className="flex-1 p-6 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </div>

      <Toaster />
    </div>
  );
};

export default DashboardLayout;
