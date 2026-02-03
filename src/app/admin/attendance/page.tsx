
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
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const holidayEvents: { [key:string]: string[] } = {
    '2026-01-01': ["New Year's Day", "New Year's Day"],
    '2026-01-03': ["Hazarat Ali's Birthday", "Hazarat Ali's Birthday"],
    '2026-01-14': ['Makar Sankranti', 'Makar Sankranti', 'Pongal', 'Pongal'],
    '2026-01-23': ['Vasant Panchami', 'Vasant Panchami'],
    '2026-01-26': ['Republic Day', 'Republic Day'],
};

export default function AdminAttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-01-01"));
  const [selectedDate, setSelectedDate] = useState(new Date("2026-01-01"));
  const today = new Date("2026-01-09"); // To match the screenshot's "today" highlight

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const handleMonthChange = (date: Date) => {
      setCurrentDate(date);
      if(!isSameMonth(date, selectedDate)) {
        setSelectedDate(startOfMonth(date));
      }
  }

  return (
    <div className="flex h-[calc(100vh-108px)] bg-white -m-6 font-sans">
      {/* Left Sidebar */}
      <aside className="w-[256px] border-r border-gray-200 p-4 flex flex-col gap-6">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shadow-sm rounded-lg py-5 px-4 w-fit border-gray-300">
                    <Plus className="mr-2 h-4 w-4" /> 
                    <span className="text-sm font-medium">Create</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Event</DropdownMenuItem>
                <DropdownMenuItem>Absence</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-base">{format(currentDate, "MMMM yyyy")}</h2>
                <div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMonthChange(subMonths(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMonthChange(addMonths(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && setSelectedDate(day)}
                month={currentDate}
                onMonthChange={handleMonthChange}
                className="p-0"
                classNames={{
                    root: 'border-none',
                    head_cell: 'w-9 text-xs font-normal text-gray-500',
                    cell: 'w-9 h-9',
                    day: 'w-9 h-9 text-sm',
                    day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-full",
                    day_today: "bg-gray-100 text-gray-900 rounded-full",
                    day_outside: "text-gray-400",
                }}
            />
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input placeholder="Search for people" className="pl-10 bg-gray-100 border-none rounded-md" />
        </div>
      </aside>

      {/* Main Calendar View */}
      <main className="flex-1 flex flex-col">
        <div className="grid grid-cols-7 border-l border-gray-200">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((dayName, i) => (
             <div key={dayName} className="text-center font-medium text-gray-500 text-xs py-2 border-b border-r border-gray-200">
                {dayName}
             </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-gray-200 flex-1">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const events = holidayEvents[dateKey] || [];
            return (
              <div
                key={day.toString()}
                className={cn(
                  "border-b border-r border-gray-200 p-1 flex flex-col",
                  !isSameMonth(day, currentDate) && "bg-gray-50"
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex justify-end">
                  <time dateTime={format(day, "yyyy-MM-dd")} className={cn(
                      "text-xs font-medium",
                      isSameDay(day, today) && "flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white",
                      !isSameMonth(day, currentDate) && "text-gray-400"
                  )}>
                    {format(day, "d")}
                  </time>
                </div>
                <div className="mt-1 flex-grow overflow-y-auto space-y-0.5 pr-1">
                   {events.map((name, index) => {
                      return <div key={index} className="w-full text-xs text-white bg-green-600 hover:bg-green-700 rounded-sm px-1 py-0.5 truncate cursor-pointer">{name}</div>
                   })}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  );
}
