import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from 'axios';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const checkSession = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get-user-details`, { withCredentials: true });
    const userData = response.data.user;
    const userLogged = response.data.logged;

    if (userData) {
      return {
        name: userData.name,
        email: userData.email,
        uGuid: userData.uGuid,
        createdAt: "",
        loggedBefore: userLogged.loggedBefore,
      };
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null; // Return null if there's an error
  }
};

