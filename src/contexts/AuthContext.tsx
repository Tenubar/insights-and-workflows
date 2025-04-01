import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import dotenv from 'dotenv';
// dotenv.config();

type User = {
  uGuid: string;
  name: string;
  email: string;
  createdAt: string;
  loggedBefore: boolean;
};

type AuthContextType = {
  user: User | null;
  setUser: (updatedUser: User) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLoggedBefore: (loggedBefore: boolean) => void;
  isAuthenticated: boolean;
};


// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

 export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateLoggedBefore = (loggedBefore: boolean) => {
    if (user) {
      const updatedUser = { ...user, loggedBefore }; // Update the property
      setUser(updatedUser); // Set the new user state
    }
  };


// Login function
const login = async (email: string, password: string) => {
  setLoading(true);

  try {
    // Send email and password to the backend
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, { email, password },{withCredentials: true});

    // Handle the server response
    const { user } = response.data; // Extract user data from response
    if (user) {
      setUser(user); // Update the user context
      toast.success("Login successful");
      navigate("/dashboard"); // Navigate to dashboard
    } else {
      toast.error("Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    toast.error("An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};
  


const register = async (name: string, email: string, password: string) => {
  setLoading(true);

  try {
    // Send a POST request to the backend API
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/register`, { name, email, password });

    // Handle successful registration
    toast.success(response.data); // Backend will send a success message
    navigate("/login");
  } catch (error) {
    // Handle errors from the backend
    console.error("Registration error:", error.response?.data || error.message);
    toast.error(error.response?.data || "An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      // Call the logout API
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`, {}, { withCredentials: true }); // Ensure cookies are sent with the request
      // Clear local session and navigate the user
      setUser(null); // Clear local user session
      toast.success("Logged out successfully"); // Show success message
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Logout error:", error); // Log the error for debugging
      toast.error("An unexpected error occurred during logout"); // Show error message
    }
  
  };
  

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        updateLoggedBefore,
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
