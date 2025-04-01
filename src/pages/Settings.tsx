import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { checkSession } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("user");
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


  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
      </div>
      
      <div className="glass rounded-xl p-6 border border-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 gap-2 mb-8">
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Update your account information and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Your username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="Current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="New password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="api-keys">
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔑</div>
              <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                API key management will be available in a future update. Stay tuned!
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔔</div>
              <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Notification settings will be available in a future update. Stay tuned!
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="billing">
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💳</div>
              <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Billing information and subscription management will be available in a future update. Stay tuned!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
