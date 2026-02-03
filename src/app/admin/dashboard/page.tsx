"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export default function AdminEmployeePage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'ascending' | 'descending' } | null>(null);

    useEffect(() => {
        const employeesData = JSON.parse(localStorage.getItem('employees') || '[]');
        setEmployees(employeesData);
    }, []);

    const getAvatar = (emp: Employee) => {
        const placeholder = PlaceHolderImages.find(p => p.id === emp.profileImage);
        return placeholder?.imageUrl || `https://picsum.photos/seed/${emp.employeeId}/400/400`;
    }
    
    const sortedEmployees = [...employees];
    if (sortConfig !== null) {
        sortedEmployees.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    const requestSort = (key: keyof Employee) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ tKey, label }: {tKey: keyof Employee, label: string}) => (
        <TableHead>
            <Button variant="ghost" onClick={() => requestSort(tKey)}>
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Employee Records</CardTitle>
                <CardDescription>A list of all employees in the company.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <SortableHeader tKey="employeeId" label="Employee ID" />
                            <SortableHeader tKey="designation" label="Designation" />
                            <SortableHeader tKey="joiningDate" label="Joining Date" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedEmployees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={getAvatar(employee)} alt={employee.name} data-ai-hint="profile portrait" />
                                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{employee.name}</p>
                                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{employee.employeeId}</Badge>
                                </TableCell>
                                <TableCell>{employee.designation}</TableCell>
                                <TableCell>{employee.joiningDate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
