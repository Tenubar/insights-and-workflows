
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  LayoutDashboard, 
  GraduationCap, 
  FilePlus, 
  Database, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: GraduationCap, label: "Training", path: "/training" },
  { icon: FilePlus, label: "Create", path: "/create" },
  { icon: Database, label: "Content Hub", path: "/content-hub" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => {
    // Default to collapsed on mobile, expanded on desktop
    return isMobile;
  });
  const [initialRender, setInitialRender] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Set initial render to false after component mounts
  useEffect(() => {
    setInitialRender(false);
  }, []);

  // Auto-collapse the sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  // Update collapsed state when screen size changes
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 border-r border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col z-10",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 h-16 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        {!collapsed && (
          <div className="font-semibold text-xl">
            <img src="/ai-tool-logo.png" alt="AI Tool" className="h-8" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-2 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center rounded-md px-3 py-2 transition-all duration-200 ease-in-out",
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon size={20} />
                {!collapsed && (
                  <span
                    className={cn(
                      "ml-3 whitespace-nowrap overflow-hidden",
                      initialRender && "animate-fade-in"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center rounded-md px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out"
        >
          <LogOut size={20} />
          {!collapsed && (
            <span
              className={cn(
                "ml-3",
                initialRender && "animate-fade-in"
              )}
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
