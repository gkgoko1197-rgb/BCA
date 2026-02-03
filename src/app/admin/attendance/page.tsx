"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Employee } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminAttendancePage() {
    const [month, setMonth] = useState<Date>(new Date());
    const [attendanceData, setAttendanceData] = useState<{ [key: string]: string[] }>({});
    const [employees, setEmployees] = useState<Employee[]>([]);
    
    // For the dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | undefined>();
    const [selectedAbsentees, setSelectedAbsentees] = useState<string[]>([]);

    // For the "Mark Attendance" card
    const [dateForMarking, setDateForMarking] = useState<Date | undefined>(new Date());
    
    const { toast } = useToast();

    useEffect(() => {
        const storedAttendance = JSON.parse(localStorage.getItem('attendanceData') || '{}');
        const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        setAttendanceData(storedAttendance);
        setEmployees(storedEmployees);
    }, []);

    const getAvatar = (emp: Employee) => {
        const placeholder = PlaceHolderImages.find(p => p.id === emp.profileImage);
        return placeholder?.imageUrl || `https://picsum.photos/seed/${emp.employeeId}/400/400`;
    }

    const openAttendanceDialog = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        setSelectedDateForDialog(date);
        setSelectedAbsentees(attendanceData[dateString] || []);
        setIsDialogOpen(true);
    };

    const handleSaveAttendance = () => {
        if (!selectedDateForDialog) return;

        const dateString = format(selectedDateForDialog, 'yyyy-MM-dd');
        const updatedAttendance = { ...attendanceData };

        if (selectedAbsentees.length > 0) {
            updatedAttendance[dateString] = selectedAbsentees;
        } else {
            delete updatedAttendance[dateString];
        }

        localStorage.setItem('attendanceData', JSON.stringify(updatedAttendance));
        setAttendanceData(updatedAttendance);
        setIsDialogOpen(false);
        toast({ title: "Success", description: "Attendance record updated." });
    };

    const DayWithAvatars = ({ date }: { date: Date }) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const absentEmployeeIds = attendanceData[dateString] || [];
        const absentEmployees = absentEmployeeIds.map(id => employees.find(e => e.employeeId === id)).filter(Boolean) as Employee[];

        return (
            <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={() => openAttendanceDialog(date)}>
                {format(date, 'd')}
                {absentEmployees.length > 0 && (
                    <div className="absolute bottom-1 flex -space-x-2">
                        {absentEmployees.slice(0, 2).map(emp => (
                             <Avatar key={emp.id} className="h-5 w-5 border-2 border-background">
                                <AvatarImage src={getAvatar(emp)} alt={emp.name} />
                                <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                        {absentEmployees.length > 2 && (
                             <Avatar className="h-5 w-5 border-2 border-background">
                                <AvatarFallback className="text-[10px] bg-muted-foreground text-white">+{absentEmployees.length - 2}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                )}
            </div>
        );
    };
    
    const todayString = format(new Date(), 'yyyy-MM-dd');
    const absenteesTodayIds = attendanceData[todayString] || [];
    const absenteesToday = absenteesTodayIds.map(id => employees.find(e => e.employeeId === id)).filter(Boolean) as Employee[];

    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Attendance Calendar</CardTitle>
                        <CardDescription>Click on a date to mark attendance. Avatars show absent employees.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            month={month}
                            onMonthChange={setMonth}
                            modifiers={{ absent: Object.keys(attendanceData).map(d => new Date(d)) }}
                            modifiersClassNames={{ absent: 'font-bold' }}
                            className="w-full"
                            components={{
                                DayContent: DayWithAvatars
                            }}
                        />
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Absentees</CardTitle>
                            <CardDescription>Employees marked absent for {format(new Date(), 'PPP')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {absenteesToday.length > 0 ? (
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {absenteesToday.map(emp => (
                                        <div key={emp.id} className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={getAvatar(emp)} alt={emp.name} data-ai-hint="profile portrait" />
                                                <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{emp.name}</p>
                                                <p className="text-sm text-muted-foreground">{emp.employeeId}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-10">
                                    <p>Everyone is present today!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Mark Daily Attendance</CardTitle>
                            <CardDescription>Select a date and mark employee attendance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateForMarking && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateForMarking ? format(dateForMarking, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dateForMarking}
                                        onSelect={setDateForMarking}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => dateForMarking && openAttendanceDialog(dateForMarking)} disabled={!dateForMarking}>
                                Mark Attendance
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark Attendance for {selectedDateForDialog && format(selectedDateForDialog, 'PPP')}</DialogTitle>
                        <DialogDescription>Select the employees who were absent on this day.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[300px] overflow-y-auto pr-4 space-y-3 py-2">
                        {employees.map(employee => (
                            <div key={employee.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`absent-${employee.employeeId}`}
                                    checked={selectedAbsentees.includes(employee.employeeId)}
                                    onCheckedChange={(checked) => {
                                        setSelectedAbsentees(prev => 
                                            checked 
                                                ? [...prev, employee.employeeId] 
                                                : prev.filter(id => id !== employee.employeeId)
                                        );
                                    }}
                                />
                                <label htmlFor={`absent-${employee.employeeId}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {employee.name} <span className="text-muted-foreground">({employee.employeeId})</span>
                                </label>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAttendance}>Save Attendance</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
