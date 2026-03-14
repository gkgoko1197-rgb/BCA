"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { initialEmployees, initialAttendanceData, sampleMessages, type Employee } from "@/lib/data";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [activeTab, setActiveTab] = useState("user");

  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize data in localStorage if it doesn't exist
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('employees')) {
        localStorage.setItem('employees', JSON.stringify(initialEmployees));
      }
      if (!localStorage.getItem('leaveRequests')) {
        localStorage.setItem('leaveRequests', JSON.stringify([]));
      }
      if (!localStorage.getItem('messages')) {
        localStorage.setItem('messages', JSON.stringify(sampleMessages));
      }
      if (!localStorage.getItem('attendanceData')) {
          localStorage.setItem('attendanceData', JSON.stringify(initialAttendanceData));
      }
    }
  }, []);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const employees: Employee[] = JSON.parse(localStorage.getItem("employees") || "[]");
    const employee = employees.find(
      (emp) => emp.email === userEmail && emp.password === userPassword
    );

    if (employee) {
      if (isClient) {
        localStorage.setItem("employeeId", employee.id);
        localStorage.removeItem("isAdmin");
        router.push("/dashboard");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === "admin" && adminPassword === "password") {
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
  
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Please fill in all fields.",
      });
      return;
    }

    const employees: Employee[] = JSON.parse(localStorage.getItem("employees") || "[]");

    const emailExists = employees.some((emp) => emp.email === signupEmail);
    if (emailExists) {
        toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: "An account with this email already exists.",
        });
        return;
    }

    const templateEmployee = initialEmployees[Math.floor(Math.random() * initialEmployees.length)];
    
    const maxIdNum = employees.reduce((max: number, emp: Employee) => {
        const num = parseInt(emp.employeeId.replace('EMP', ''), 10);
        return num > max ? num : max;
    }, 0);
    const newEmployeeId = `EMP${String(maxIdNum + 1).padStart(4, '0')}`;
    
    const newEmployee: Employee = {
        ...templateEmployee,
        id: `user-${Date.now()}`,
        employeeId: newEmployeeId,
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        profileImage: String(Math.floor(Math.random() * 20) + 1),
        leaveStatus: null,
    };
    
    const updatedEmployees = [...employees, newEmployee];
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    
    toast({
        title: "Sign Up Successful",
        description: "Your account has been created. Please log in.",
    });

    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setActiveTab("user");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-2 mb-8">
        <LogIn className="h-8 w-8 text-primary"/>
        <h1 className="text-3xl font-bold text-foreground">HR STREAM</h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="user">User Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                  <Label htmlFor="user-email">Email</Label>
                  <Input id="user-email" type="email" placeholder="goko.vegeta@example.com" required value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input id="user-password" type="password" placeholder="password" required value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Login</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <form onSubmit={handleSignUp}>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Sign up to get access. Your new profile will be based on a random existing employee template.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" placeholder="Son Goku" required value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="goku@capsulecorp.com" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="Choose a secure password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Sign Up</Button>
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
                  <Input id="admin-id" placeholder="admin" required value={adminId} onChange={(e) => setAdminId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input id="admin-password" type="password" placeholder="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
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
