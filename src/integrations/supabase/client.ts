// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qzjdtnqrvfvmcawfpmox.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6amR0bnFydmZ2bWNhd2ZwbW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTY5NTgsImV4cCI6MjA1ODE5Mjk1OH0.U3zlXCWiV_7EElFo-LRnjGJ2e76LUNdENNn5GHBGqg0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);