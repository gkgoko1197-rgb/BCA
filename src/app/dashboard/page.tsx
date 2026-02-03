"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { Employee, LeaveRequest, Message } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Mail, CheckCircle, XCircle, Clock } from "lucide-react";

export default function PersonalInfoPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [generalMailSubject, setGeneralMailSubject] = useState("");
  const [generalMailBody, setGeneralMailBody] = useState("");
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const employeeId = localStorage.getItem("employeeId");
    if (employeeId) {
      const employees: Employee[] = JSON.parse(localStorage.getItem("employees") || "[]");
      const currentEmployee = employees.find((emp) => emp.id === employeeId);
      if (currentEmployee) {
        setEmployee(currentEmployee);
      }
    }
  }, []);
  
  // Re-sync with localStorage if it changes elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      const employeeId = localStorage.getItem("employeeId");
      if (employeeId) {
        const employees: Employee[] = JSON.parse(localStorage.getItem("employees") || "[]");
        const updatedEmployee = employees.find(emp => emp.id === employeeId);
        if (updatedEmployee) {
          setEmployee(updatedEmployee);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleSendLeaveRequest = () => {
    if (!leaveMessage.trim()) {
        toast({ variant: "destructive", title: "Error", description: "Leave message cannot be empty." });
        return;
    }
    const leaveRequests: LeaveRequest[] = JSON.parse(localStorage.getItem("leaveRequests") || "[]");
    const newRequest: LeaveRequest = {
        id: `leave-${Date.now()}`,
        employeeId: employee!.employeeId,
        employeeName: employee!.name,
        message: leaveMessage,
        date: new Date().toLocaleDateString()
    };
    const updatedRequests = [...leaveRequests, newRequest];
    localStorage.setItem("leaveRequests", JSON.stringify(updatedRequests));

    // Also update employee status to Pending
    const employees: Employee[] = JSON.parse(localStorage.getItem("employees") || "[]");
    const updatedEmployees = employees.map(emp => emp.id === employee!.id ? {...emp, leaveStatus: 'Pending'} : emp);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
    setEmployee(prev => prev ? {...prev, leaveStatus: 'Pending'} : null);

    toast({ title: "Leave Request Sent", description: "Your request has been sent to the admin." });
    setLeaveMessage("");
    window.dispatchEvent(new Event('storage'));
  };

  const handleSendGeneralMail = () => {
    if (!generalMailSubject.trim() || !generalMailBody.trim()) {
        toast({ variant: "destructive", title: "Error", description: "Subject and message cannot be empty." });
        return;
    }
    const messages: Message[] = JSON.parse(localStorage.getItem("messages") || "[]");
    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        employeeName: employee!.name,
        subject: generalMailSubject,
        body: generalMailBody,
        date: new Date().toLocaleDateString()
    };
    const updatedMessages = [newMessage, ...messages];
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    
    toast({ title: "Mail Sent", description: "Your message has been sent to the admin." });
    setGeneralMailSubject("");
    setGeneralMailBody("");
    window.dispatchEvent(new Event('storage'));
  };

  const getAvatar = (emp: Employee) => {
    const placeholder = PlaceHolderImages.find(p => p.id === emp.profileImage);
    return placeholder?.imageUrl || `https://picsum.photos/seed/${emp.employeeId}/400/400`;
  }
  
  const renderStatusSeal = () => {
    if (!employee || !employee.leaveStatus) {
      return null;
    }

    let statusProps: { className: string; icon: React.ElementType; text: string; };

    switch (employee.leaveStatus) {
      case "Accepted":
        statusProps = { className: "bg-green-500", icon: CheckCircle, text: "Accepted" };
        break;
      case "Rejected":
        statusProps = { className: "bg-red-500", icon: XCircle, text: "Rejected" };
        break;
      case "Pending":
        statusProps = {
          className: "bg-yellow-400 text-yellow-900",
          icon: Clock,
          text: "Pending",
        };
        break;
      default:
        return null;
    }
    
    return (
        <Badge variant="outline" className={cn("absolute top-4 right-4 text-white border-2 text-base p-2", statusProps.className)}>
            <statusProps.icon className="h-4 w-4 mr-2" />
            Leave: {statusProps.text}
        </Badge>
    );
  };

  if (!isClient || !employee) return <div>Loading employee data...</div>;

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="grid grid-cols-3 items-center gap-4">
      <Label className="text-right text-muted-foreground">{label}</Label>
      <p className="col-span-2 font-medium">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
        <Card className="relative">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>View your personal details.</CardDescription>
                {employee.leaveStatus && renderStatusSeal()}
            </CardHeader>
            <CardContent className="grid md:grid-cols-[180px_1fr] gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32 border-4 border-primary">
                        <AvatarImage src={getAvatar(employee)} alt={employee.name} data-ai-hint="profile portrait"/>
                        <AvatarFallback className="text-4xl">{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <div className="text-center">
                        <p className="text-xl font-bold">{employee.name}</p>
                        <p className="text-muted-foreground">{employee.designation}</p>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <InfoField label="Employee ID" value={employee.employeeId} />
                    <InfoField label="Email ID" value={employee.email} />
                    <InfoField label="Phone Number" value={employee.phone} />
                    <InfoField label="Date of Joining" value={employee.joiningDate} />
                    <InfoField label="Date of Birth" value={employee.dob} />
                    <InfoField label="Address" value={employee.address} />
                </div>
            </CardContent>
            <CardFooter className="flex justify-start">
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Leave Mail</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Compose Leave Request</DialogTitle>
                                <DialogDescription>Your message will be sent to the admin for approval.</DialogDescription>
                            </DialogHeader>
                            <Textarea 
                                placeholder="Type your leave request here..." 
                                rows={6}
                                value={leaveMessage}
                                onChange={(e) => setLeaveMessage(e.target.value)}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button onClick={handleSendLeaveRequest}>Send Leave Permission Request</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> General Mail</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Compose General Mail</DialogTitle>
                                <DialogDescription>Your message will be sent to the admin.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    id="subject"
                                    placeholder="Subject"
                                    value={generalMailSubject}
                                    onChange={(e) => setGeneralMailSubject(e.target.value)}
                                />
                                <Textarea 
                                    placeholder="Type your message here..." 
                                    rows={5}
                                    value={generalMailBody}
                                    onChange={(e) => setGeneralMailBody(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button onClick={handleSendGeneralMail}>Send</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
