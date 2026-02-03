"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Download, Building, User, Calendar, FileText, Banknote, Shield, Scissors, BarChart, Check, Signature } from "lucide-react";
import type { Employee } from "@/lib/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function PayslipPage() {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const employeeId = localStorage.getItem("employeeId");
        if (employeeId) {
            const employeesData = JSON.parse(localStorage.getItem('employees') || '[]');
            const currentEmployee = employeesData.find((e: Employee) => e.id === employeeId);
            setEmployee(currentEmployee);
        }
    }, []);

    const handleDownload = (format: 'PDF' | 'TXT') => {
        toast({
            title: "Download Started",
            description: `Your payslip will be downloaded as a ${format} file. (This is a demo)`,
        });
    };

    if (!employee) {
        return <div>Loading payslip data...</div>;
    }

    const payslipData = {
        monthYear: "July 2024",
        company: { name: "Capsule Corp.", address: "1 Technology Drive, West City" },
        earnings: [
            { label: "Basic Salary", amount: 50000 },
            { label: "HRA", amount: 20000 },
            { label: "DA", amount: 5000 },
            { label: "Conveyance Allowance", amount: 2500 },
            { label: "Medical Allowance", amount: 2500 },
            { label: "Special Allowance", amount: 10000 },
            { label: "Overtime Pay", amount: 5000 },
            { label: "Bonus", amount: 10000 },
        ],
        deductions: [
            { label: "PF", amount: 3600 },
            { label: "ESI", amount: 1000 },
            { label: "Professional Tax", amount: 200 },
            { label: "Income Tax / TDS", amount: 8000 },
            { label: "Loan Deduction", amount: 2000 },
        ],
        attendance: { totalDays: 22, present: 21, leave: 1, lop: 1 },
        payment: { date: "July 31, 2024", bank: "Galactic Bank", account: "******1234", mode: "Direct Deposit" },
    };

    const totalEarnings = payslipData.earnings.reduce((acc, item) => acc + item.amount, 0);
    const totalDeductions = payslipData.deductions.reduce((acc, item) => acc + item.amount, 0);
    const netSalary = totalEarnings - totalDeductions;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Payslip for {payslipData.monthYear}</CardTitle>
                    <CardDescription>Review your salary details for the current month.</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button><Download className="mr-2 h-4 w-4" /> Download Payslip</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Download Options</DialogTitle>
                            <DialogDescription>Choose the format for your download.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center gap-2">
                             <Button onClick={() => handleDownload('PDF')}><FileText className="mr-2 h-4 w-4"/>Download as PDF</Button>
                             <Button onClick={() => handleDownload('TXT')} variant="outline"><FileText className="mr-2 h-4 w-4"/>Download as TXT</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center"><User className="mr-2 h-4 w-4 text-primary"/>Employee Information</h3>
                        <p><strong>Name:</strong> {employee.name}</p>
                        <p><strong>Employee ID:</strong> {employee.employeeId}</p>
                        <p><strong>Designation:</strong> {employee.designation}</p>
                        <p><strong>Date of Joining:</strong> {employee.joiningDate}</p>
                    </div>
                    <div className="space-y-2 text-right md:text-left">
                        <h3 className="font-semibold flex items-center md:items-start justify-end md:justify-start"><Building className="mr-2 h-4 w-4 text-primary"/>Employer Information</h3>
                        <p><strong>{payslipData.company.name}</strong></p>
                        <p>{payslipData.company.address}</p>
                    </div>
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center"><Banknote className="mr-2 h-4 w-4 text-green-500"/>Earnings</h3>
                        <Table>
                            <TableBody>
                                {payslipData.earnings.map(item => <TableRow key={item.label}><TableCell>{item.label}</TableCell><TableCell className="text-right">{formatCurrency(item.amount)}</TableCell></TableRow>)}
                                <TableRow className="font-bold bg-muted/50"><TableCell>Gross Salary</TableCell><TableCell className="text-right">{formatCurrency(totalEarnings)}</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 flex items-center"><Scissors className="mr-2 h-4 w-4 text-red-500"/>Deductions</h3>
                        <Table>
                            <TableBody>
                                {payslipData.deductions.map(item => <TableRow key={item.label}><TableCell>{item.label}</TableCell><TableCell className="text-right">{formatCurrency(item.amount)}</TableCell></TableRow>)}
                                <TableRow className="font-bold bg-muted/50"><TableCell>Total Deductions</TableCell><TableCell className="text-right">{formatCurrency(totalDeductions)}</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
                 <Separator />
                 <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center"><Calendar className="mr-2 h-4 w-4 text-primary"/>Attendance Summary</h3>
                        <p><strong>Total Working Days:</strong> {payslipData.attendance.totalDays}</p>
                        <p><strong>Days Present:</strong> {payslipData.attendance.present}</p>
                        <p><strong>Loss of Pay Days:</strong> {payslipData.attendance.lop}</p>
                    </div>
                     <div className="bg-primary/10 p-4 rounded-lg text-center space-y-2">
                        <h3 className="font-semibold flex items-center justify-center"><BarChart className="mr-2 h-4 w-4 text-primary"/>Salary Summary</h3>
                        <p><strong>Gross Salary:</strong> {formatCurrency(totalEarnings)}</p>
                        <p><strong>Total Deductions:</strong> {formatCurrency(totalDeductions)}</p>
                        <p className="text-lg font-bold text-primary"><strong>Net Salary:</strong> {formatCurrency(netSalary)}</p>
                    </div>
                 </div>
            </CardContent>
            <CardFooter className="justify-between bg-muted/40 p-6 text-xs text-muted-foreground">
                <div className="space-y-1">
                    <h4 className="font-semibold text-foreground flex items-center"><Check className="mr-2 h-4 w-4"/>Payment Details</h4>
                    <p><strong>Salary Credit Date:</strong> {payslipData.payment.date}</p>
                    <p><strong>Bank:</strong> {payslipData.payment.bank}, A/C: {payslipData.payment.account}</p>
                </div>
                <div className="text-center">
                    <Signature className="h-8 w-8 mx-auto" />
                    <p className="font-semibold">Employer Signature</p>
                    <p>Company Seal</p>
                </div>
            </CardFooter>
        </Card>
    );
}
