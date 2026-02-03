"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Employee } from "@/lib/data";

export default function AdminAttendancePage() {
    const [month, setMonth] = useState<Date>(new Date());
    const [attendanceData, setAttendanceData] = useState<{ [key: string]: string[] }>({});
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAbsentees, setSelectedAbsentees] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const storedAttendance = JSON.parse(localStorage.getItem('attendanceData') || '{}');
        const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        setAttendanceData(storedAttendance);
        setEmployees(storedEmployees);
    }, []);

    const absentDays = Object.keys(attendanceData).map(dateStr => new Date(dateStr));
    const absentModifiers = { absent: absentDays };
    const absentModifiersClassNames = {
        absent: 'bg-destructive/20 text-destructive-foreground rounded-md',
    };
    
    const handleDayClick = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        setSelectedDate(date);
        setSelectedAbsentees(attendanceData[dateString] || []);
        setIsDialogOpen(true);
    };

    const handleSaveAttendance = () => {
        if (!selectedDate) return;

        const dateString = format(selectedDate, 'yyyy-MM-dd');
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

    const DayWithTooltip = ({ date }: { date: Date }) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const absentEmployeesForDay = attendanceData[dateString];

        const dayDiv = (
            <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={() => handleDayClick(date)}>
                {format(date, 'd')}
            </div>
        );

        if (!absentEmployeesForDay || absentEmployeesForDay.length === 0) {
            return dayDiv;
        }

        return (
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {dayDiv}
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="space-y-1 p-1">
                            <p className="font-bold text-sm">Absent on {format(date, 'MMM d')}:</p>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                                {absentEmployeesForDay.map(id => <Badge key={id} variant="secondary">{id}</Badge>)}
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };
    
    const todayString = format(new Date(), 'yyyy-MM-dd');
    const absenteesToday = attendanceData[todayString] || [];
    const totalEmployees = employees.length;
    const absentTodayCount = absenteesToday.length;
    const presentTodayCount = totalEmployees > 0 ? totalEmployees - absentTodayCount : 0;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Attendance Calendar (1 Year)</CardTitle>
                        <CardDescription>Overview of employee attendance. Dates with absences are highlighted. Click a date to mark attendance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            numberOfMonths={12}
                            month={month}
                            onMonthChange={setMonth}
                            pagedNavigation
                            modifiers={absentModifiers}
                            modifiersClassNames={absentModifiersClassNames}
                            className="w-full"
                            components={{
                                DayContent: DayWithTooltip
                            }}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                        <CardDescription>Key attendance metrics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-lg bg-green-100 dark:bg-green-900/50">
                            <span className="font-medium">Total Employees Present Today</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{presentTodayCount}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-lg bg-red-100 dark:bg-red-900/50">
                            <span className="font-medium">Total Employees Absent Today</span>
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{absentTodayCount}</span>
                        </div>
                        <div className="text-sm text-muted-foreground pt-4">
                            <p>This summary is for today. The calendar reflects all recorded absences.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark Attendance for {selectedDate && format(selectedDate, 'PPP')}</DialogTitle>
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
