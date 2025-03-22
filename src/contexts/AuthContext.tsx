
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

// Define user type
type User = {
  id: string;
  email: string;
  name: string;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const MOCK_USERS = [
  {
    id: "1",
    email: "demo@example.com",
    password: "password123",
    name: "Demo User",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user in mock database
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );
    
    if (foundUser) {
      // Extract user data without password
      const { password, ...userData } = foundUser;
      
      // Save user to state and localStorage
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast.success("Login successful");
      navigate("/dashboard");
    } else {
      toast.error("Invalid email or password");
    }
    
    setLoading(false);
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    if (MOCK_USERS.some(u => u.email === email)) {
      toast.error("Email already in use");
      setLoading(false);
      return;
    }
    
    // Create new user
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      email,
      password,
      name,
    };
    
    // Add to mock database (in a real app, you'd send this to your API)
    MOCK_USERS.push(newUser);
    
    // Extract user data without password
    const { password: _, ...userData } = newUser;
    
    // Save user to state and localStorage
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    toast.success("Registration successful");
    navigate("/dashboard");
    
    setLoading(false);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
