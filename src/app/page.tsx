"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { initialEmployees } from "@/lib/data";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize data in localStorage if it doesn't exist
    if (typeof window !== 'undefined' && !localStorage.getItem('employees')) {
      localStorage.setItem('employees', JSON.stringify(initialEmployees));
    }
    if (typeof window !== 'undefined' && !localStorage.getItem('leaveRequests')) {
      localStorage.setItem('leaveRequests', JSON.stringify([]));
    }
  }, []);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userUsername === "GOKO" && userPassword === "GOKO") {
      const employee = initialEmployees.find(emp => emp.name.split(' ')[0].toUpperCase() === 'GOKO');
      if (employee && isClient) {
        localStorage.setItem("employeeId", employee.id);
        localStorage.removeItem("isAdmin");
        router.push("/dashboard");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password.",
      });
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === "1" && adminPassword === "GOKO") {
      if (isClient) {
        localStorage.setItem("isAdmin", "true");
        localStorage.removeItem("employeeId");
        router.push("/admin/dashboard");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid Admin ID or password.",
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-2 mb-8">
        <LogIn className="h-8 w-8 text-primary"/>
        <h1 className="text-3xl font-bold text-foreground">Employee Central Hub</h1>
      </div>
      <Tabs defaultValue="user" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user">User Login</TabsTrigger>
          <TabsTrigger value="admin">Admin Login</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <Card>
            <form onSubmit={handleUserLogin}>
              <CardHeader>
                <CardTitle>User Login</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-username">Username</Label>
                  <Input id="user-username" placeholder="GOKO" required value={userUsername} onChange={(e) => setUserUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input id="user-password" type="password" placeholder="GOKO" required value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Login</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card>
            <form onSubmit={handleAdminLogin}>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Enter your admin credentials to access the admin panel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-id">Admin ID</Label>
                  <Input id="admin-id" placeholder="1" required value={adminId} onChange={(e) => setAdminId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input id="admin-password" type="password" placeholder="GOKO" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Login as Admin</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
