"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AttendanceData } from "@/lib/data";

export default function AdminAttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date("2025-01-01"));
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});

  const minDate = new Date("2025-01-01");
  const maxDate = new Date("2026-02-28");
  
  useEffect(() => {
    const storedData = localStorage.getItem('attendanceData');
    if (storedData) {
      setAttendanceData(JSON.parse(storedData));
    }
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (!isBefore(startOfMonth(newDate), startOfMonth(minDate))) {
      setCurrentDate(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    if (!isAfter(startOfMonth(newDate), startOfMonth(maxDate))) {
      setCurrentDate(newDate);
    }
  };

  const isPrevDisabled = isSameMonth(currentDate, minDate);
  const isNextDisabled = isSameMonth(currentDate, maxDate);

  return (
    <div className="flex h-[calc(100vh-108px)] -m-6 flex-col bg-background text-foreground p-4 gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} disabled={isPrevDisabled}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isNextDisabled}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <div className="grid grid-cols-7 text-center font-medium text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 flex-1 border-t border-l border-border">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const record = attendanceData[dateKey];
            const isCurrentMonth = isSameMonth(day, currentDate);

            const dayContent = (
                 <div
                    key={day.toString()}
                    className={cn(
                    "border-b border-r border-gray-200 p-2 flex flex-col items-start justify-start gap-1",
                    !isCurrentMonth && "bg-muted/50 text-muted-foreground"
                    )}
                >
                    <time dateTime={format(day, "yyyy-MM-dd")} className={cn(
                        "font-medium",
                         isSameDay(day, new Date()) && "text-primary"
                    )}>
                        {format(day, "d")}
                    </time>
                    {record && isCurrentMonth && (
                        <div className="flex flex-col items-start gap-1 pt-1 text-xs">
                           {record.present > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span>{record.present} Present</span>
                                </div>
                            )}
                            {record.absent > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <span>{record.absent} Absent</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );

            if (record && isCurrentMonth) {
                return (
                    <TooltipProvider key={dateKey} delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {dayContent}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{format(day, "PPP")}</p>
                                <div className="mt-2 space-y-1">
                                    <p><span className="font-semibold">Present:</span> {record.present}</p>
                                    <p><span className="font-semibold">Absent:</span> {record.absent}</p>
                                </div>
                                {record.absent > 0 && (
                                    <>
                                        <p className="font-semibold mt-2">Absent Employees:</p>
                                        <ul className="list-disc list-inside">
                                            {record.absentIds.map(id => <li key={id}>{id}</li>)}
                                        </ul>
                                    </>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }

            return dayContent;
          })}
      </div>
    </div>
  );
}
