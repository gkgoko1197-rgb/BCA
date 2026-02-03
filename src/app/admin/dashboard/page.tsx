"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, FileText, Download, Building, User, Banknote, Scissors } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { generatePayslipDataForEmployee, type DetailedPayslipData } from "@/lib/payslip";


export default function AdminEmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Employee;
    direction: "ascending" | "descending";
  } | null>(null);
  const [
    selectedEmployeeForPayslip,
    setSelectedEmployeeForPayslip,
  ] = useState<Employee | null>(null);
  const [payslipData, setPayslipData] = useState<DetailedPayslipData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const employeesData = JSON.parse(
      localStorage.getItem("employees") || "[]"
    );
    setEmployees(employeesData);
  }, []);

  const getAvatar = (emp: Employee) => {
    const placeholder = PlaceHolderImages.find((p) => p.id === emp.profileImage);
    return (
      placeholder?.imageUrl ||
      `https://picsum.photos/seed/${emp.employeeId}/400/400`
    );
  };

  const sortedEmployees = [...employees];
  if (sortConfig !== null) {
    sortedEmployees.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: keyof Employee) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({
    tKey,
    label,
  }: {
    tKey: keyof Employee;
    label: string;
  }) => (
    <TableHead>
      <Button variant="ghost" onClick={() => requestSort(tKey)}>
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  const handleOpenPayslip = (employee: Employee) => {
    const data = generatePayslipDataForEmployee(employee);
    setPayslipData(data);
    setSelectedEmployeeForPayslip(employee);
  };

  const handleDownload = (format: "PDF" | "TXT") => {
    toast({
      title: "Download Started",
      description: `Payslip will be downloaded as a ${format} file. (This is a demo)`,
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Employee Records</CardTitle>
          <CardDescription>
            A list of all employees in the company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <SortableHeader tKey="employeeId" label="Employee ID" />
                <SortableHeader tKey="designation" label="Designation" />
                <SortableHeader tKey="joiningDate" label="Joining Date" />
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={getAvatar(employee)}
                          alt={employee.name}
                          data-ai-hint="profile portrait"
                        />
                        <AvatarFallback>
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.employeeId}</Badge>
                  </TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.joiningDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPayslip(employee)}
                      >
                        <FileText className="mr-2 h-4 w-4" /> Payslip
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payslip Dialog */}
      <Dialog
        open={!!selectedEmployeeForPayslip}
        onOpenChange={(isOpen) => !isOpen && setSelectedEmployeeForPayslip(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Payslip for {selectedEmployeeForPayslip?.name}
            </DialogTitle>
            <DialogDescription>
              {payslipData?.monthYear} - Employee ID:{" "}
              {selectedEmployeeForPayslip?.employeeId}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
             <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center"><User className="mr-2 h-4 w-4 text-primary"/>Employee Information</h3>
                    <p><strong>Name:</strong> {selectedEmployeeForPayslip?.name}</p>
                    <p><strong>Employee ID:</strong> {selectedEmployeeForPayslip?.employeeId}</p>
                    <p><strong>Designation:</strong> {selectedEmployeeForPayslip?.designation}</p>
                    <p><strong>Date of Joining:</strong> {selectedEmployeeForPayslip?.joiningDate}</p>
                </div>
                <div className="space-y-2 text-right md:text-left">
                    <h3 className="font-semibold flex items-center md:items-start justify-end md:justify-start"><Building className="mr-2 h-4 w-4 text-primary"/>Employer Information</h3>
                    <p><strong>{payslipData?.company.name}</strong></p>
                    <p>{payslipData?.company.address}</p>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2 flex items-center"><Banknote className="mr-2 h-4 w-4 text-green-500"/>Earnings</h3>
                    <Table>
                        <TableBody>
                            {payslipData?.earnings.map(item => <TableRow key={item.label}><TableCell>{item.label}</TableCell><TableCell className="text-right">{formatCurrency(item.amount)}</TableCell></TableRow>)}
                            <TableRow className="font-bold bg-muted/50"><TableCell>Gross Salary</TableCell><TableCell className="text-right">{formatCurrency(payslipData?.totalEarnings || 0)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2 flex items-center"><Scissors className="mr-2 h-4 w-4 text-red-500"/>Deductions</h3>
                    <Table>
                        <TableBody>
                            {payslipData?.deductions.map(item => <TableRow key={item.label}><TableCell>{item.label}</TableCell><TableCell className="text-right">{formatCurrency(item.amount)}</TableCell></TableRow>)}
                            <TableRow className="font-bold bg-muted/50"><TableCell>Total Deductions</TableCell><TableCell className="text-right">{formatCurrency(payslipData?.totalDeductions || 0)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="text-right font-bold text-lg">
              Net Salary: {formatCurrency(payslipData?.netSalary || 0)}
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <div className="flex gap-2">
                <Button onClick={() => handleDownload("PDF")}>
                <Download className="mr-2 h-4 w-4" />
                PDF
                </Button>
                <Button onClick={() => handleDownload("TXT")} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                TXT
                </Button>
                <DialogClose asChild>
                <Button variant="ghost">Close</Button>
                </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
