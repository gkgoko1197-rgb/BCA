"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { attendanceData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

export default function AdminAttendancePage() {
    const [month, setMonth] = useState<Date>(new Date());

    const absentDays = Object.keys(attendanceData).map(dateStr => new Date(dateStr));

    const absentModifiers = {
        absent: absentDays,
    };
    const absentModifiersClassNames = {
        absent: 'bg-destructive/20 text-destructive-foreground rounded-md',
    };

    const DayWithTooltip = ({ date }: { date: Date }) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const absentEmployees = attendanceData[dateString];

        if (!absentEmployees) {
            return <div>{format(date, 'd')}</div>;
        }

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <div className="w-full h-full flex items-center justify-center cursor-pointer">{format(date, 'd')}</div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="space-y-1">
                        <p className="font-bold text-sm">Absent on {format(date, 'MMM d')}:</p>
                        <div className="flex flex-wrap gap-1">
                            {absentEmployees.map(id => <Badge key={id} variant="secondary">{id}</Badge>)}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Attendance Calendar (1 Year)</CardTitle>
                    <CardDescription>Overview of employee attendance. Dates with absences are highlighted. Hover for details.</CardDescription>
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
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">18</span>
                    </div>
                     <div className="flex justify-between items-center p-4 rounded-lg bg-red-100 dark:bg-red-900/50">
                        <span className="font-medium">Total Employees Absent Today</span>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">2</span>
                    </div>
                    <div className="text-sm text-muted-foreground pt-4">
                        <p>This is sample data for today. The calendar reflects historical absences.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
