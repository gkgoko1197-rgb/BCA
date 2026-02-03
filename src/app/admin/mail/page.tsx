"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Employee, LeaveRequest, Message } from "@/lib/data";
import { sampleMessages } from "@/lib/data";
import { Check, X } from "lucide-react";

export default function AdminMailPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const storedRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
        setLeaveRequests(storedRequests);
    }, []);

    const handleLeaveRequest = (requestId: string, employeeId: string, status: 'Accepted' | 'Rejected') => {
        // Update employee status
        let employees: Employee[] = JSON.parse(localStorage.getItem('employees') || '[]');
        const updatedEmployees = employees.map(emp => {
            if (emp.employeeId === employeeId) {
                return { ...emp, leaveStatus: status };
            }
            return emp;
        });
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
        
        // Remove leave request
        const updatedRequests = leaveRequests.filter(req => req.id !== requestId);
        localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
        setLeaveRequests(updatedRequests);
        
        toast({
            title: `Leave Request ${status}`,
            description: `The employee's leave status has been updated.`,
        });

        // Trigger storage event for other tabs to update
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <Tabs defaultValue="leave-requests">
            <TabsList>
                <TabsTrigger value="leave-requests">Leave Requests ({leaveRequests.length})</TabsTrigger>
                <TabsTrigger value="general-mail">General Mail ({sampleMessages.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="leave-requests" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Approval</CardTitle>
                        <CardDescription>Review and respond to employee leave requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {leaveRequests.length > 0 ? leaveRequests.map(req => (
                            <Card key={req.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{req.employeeName} ({req.employeeId})</CardTitle>
                                    <CardDescription>Received on {req.date}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm p-4 bg-muted rounded-md">{req.message}</p>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="destructive" size="sm" onClick={() => handleLeaveRequest(req.id, req.employeeId, 'Rejected')}>
                                        <X className="mr-2 h-4 w-4"/> Reject
                                    </Button>
                                    <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleLeaveRequest(req.id, req.employeeId, 'Accepted')}>
                                        <Check className="mr-2 h-4 w-4"/> Accept
                                    </Button>
                                </CardFooter>
                            </Card>
                        )) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>No pending leave requests.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="general-mail" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>General Mailbox</CardTitle>
                        <CardDescription>Standard messages from employees.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sampleMessages.map(msg => (
                             <Card key={msg.id} className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle className="text-base">{msg.subject}</CardTitle>
                                    <CardDescription>From: {msg.employeeName} on {msg.date}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{msg.body}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
