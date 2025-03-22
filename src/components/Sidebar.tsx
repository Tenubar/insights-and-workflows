
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Training, 
  FilePlus, 
  Database, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Training, label: "Training", path: "/training" },
  { icon: FilePlus, label: "Create", path: "/create" },
  { icon: Database, label: "Content Hub", path: "/content-hub" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 border-r border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 h-16 flex items-center justify-between border-b border-gray-100">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-semibold text-xl"
          >
            Insights
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-1 hover:bg-gray-100 transition-colors"
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
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon size={20} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out"
        >
          <LogOut size={20} />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-3"
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
