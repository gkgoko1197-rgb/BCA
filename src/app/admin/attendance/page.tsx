"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format, getYear, setYear, getMonth, setMonth, startOfMonth } from "date-fns";
import type { Employee } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AdminAttendancePage() {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [attendanceData, setAttendanceData] = useState<{ [key: string]: string[] }>({});
    const [employees, setEmployees] = useState<Employee[]>([]);
    
    // For the dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | undefined>();
    const [selectedAbsentees, setSelectedAbsentees] = useState<string[]>([]);
    
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
        // Don't open dialog for outside days
        if (getMonth(date) !== getMonth(currentDate)) {
            return;
        }
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
        const isOutsideMonth = getMonth(date) !== getMonth(currentDate);

        return (
            <div 
                className={cn("relative w-full h-full flex flex-col items-start p-1", isOutsideMonth ? 'cursor-default' : 'cursor-pointer hover:bg-accent/50')} 
                onClick={() => openAttendanceDialog(date)}
            >
                <span className={cn("font-medium", isOutsideMonth && "opacity-50")}>{format(date, 'd')}</span>
                {absentEmployees.length > 0 && !isOutsideMonth && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex justify-center w-full">
                         <div className="flex -space-x-2">
                            {absentEmployees.slice(0, 2).map(emp => (
                                <Avatar key={emp.id} className="h-5 w-5 border-2 border-white">
                                    <AvatarImage src={getAvatar(emp)} alt={emp.name} />
                                    <AvatarFallback className="text-[10px]">{emp.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            ))}
                            {absentEmployees.length > 2 && (
                                <Avatar className="h-5 w-5 border-2 border-white">
                                    <AvatarFallback className="text-[10px] bg-muted-foreground text-white">+{absentEmployees.length - 2}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const year = getYear(currentDate);
    const months = Array.from({ length: 12 }, (_, i) => startOfMonth(setMonth(new Date(year, 0, 1), i)));

    const handleYearChange = (direction: 'prev' | 'next') => {
        const newYear = direction === 'prev' ? year - 1 : year + 1;
        setCurrentDate(setYear(currentDate, newYear));
    }

    return (
        <div className="flex flex-col h-full -m-6 bg-gray-100">
            <header className="bg-gray-800 text-white py-4 px-6">
                <h1 className="text-3xl font-bold tracking-wider text-center">
                    <span className="text-orange-400">{year}</span> CALENDAR-PLANNER
                </h1>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                <main className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between pb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-orange-500">{format(currentDate, 'MMMM')}</h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                             <Button variant="outline" size="icon" onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <Calendar
                        month={currentDate}
                        onMonthChange={setCurrentDate}
                        className="w-full"
                        classNames={{
                            caption: "hidden", // We have our own header
                            head_row: "flex justify-around mb-2",
                            head_cell: "text-gray-500 uppercase font-semibold text-xs w-full pb-2 text-center",
                            row: 'flex w-full justify-around border-t',
                            cell: cn('h-20 sm:h-24 md:h-28 w-full relative border-l first:border-l-0'),
                            day: 'w-full h-full',
                            day_today: 'bg-orange-100',
                            day_selected: 'bg-primary/20 text-primary-foreground',
                            day_outside: 'text-muted-foreground opacity-50'
                        }}
                        showOutsideDays
                        components={{
                            DayContent: DayWithAvatars,
                        }}
                    />
                </main>
                <aside className="lg:col-span-1 bg-white p-4 rounded-lg shadow-lg">
                     <div className="flex items-center justify-between pb-2 border-b mb-4">
                        <Button variant="ghost" size="icon" onClick={() => handleYearChange('prev')}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h3 className="font-bold text-xl text-gray-700">{year}</h3>
                        <Button variant="ghost" size="icon" onClick={() => handleYearChange('next')}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
                        {months.map(month => (
                            <Button
                                key={month.getMonth()}
                                variant={getMonth(month) === getMonth(currentDate) ? "default" : "outline"}
                                className={cn(
                                    "h-12 text-sm",
                                    getMonth(month) === getMonth(currentDate) && "bg-orange-500 hover:bg-orange-600 text-white"
                                )}
                                onClick={() => setCurrentDate(month)}
                            >
                                {format(month, 'MMM')}
                            </Button>
                        ))}
                    </div>
                </aside>
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
        </div>
    );
}
