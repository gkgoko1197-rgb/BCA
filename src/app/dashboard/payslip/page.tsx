"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Download, Building, User, Calendar, Banknote, Scissors, BarChart, Check, Signature } from "lucide-react";
import type { Employee } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { generatePayslipDataForEmployee, type DetailedPayslipData } from "@/lib/payslip";

export default function PayslipPage() {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [payslipData, setPayslipData] = useState<DetailedPayslipData | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const employeeId = localStorage.getItem("employeeId");
        if (employeeId) {
            const employeesData = JSON.parse(localStorage.getItem('employees') || '[]');
            const currentEmployee = employeesData.find((e: Employee) => e.id === employeeId);
            if (currentEmployee) {
                setEmployee(currentEmployee);
                setPayslipData(generatePayslipDataForEmployee(currentEmployee));
            }
        }
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const generatePayslipText = (employee: Employee, payslip: DetailedPayslipData): string => {
        let content = `========================================\n`;
        content += `    PAYSLIP FOR ${payslip.monthYear}\n`;
        content += `========================================\n\n`;

        content += `--- Employer Information ---\n`;
        content += `Company: ${payslip.company.name}\n`;
        content += `Address: ${payslip.company.address}\n\n`;

        content += `--- Employee Information ---\n`;
        content += `Name: ${employee.name}\n`;
        content += `Employee ID: ${employee.employeeId}\n`;
        content += `Designation: ${employee.designation}\n`;
        content += `Date of Joining: ${employee.joiningDate}\n\n`;

        content += `--- Attendance Summary ---\n`;
        content += `Total Working Days: ${payslip.attendance.totalDays}\n`;
        content += `Days Present: ${payslip.attendance.present}\n`;
        content += `Loss of Pay Days: ${payslip.attendance.lop}\n\n`;

        content += `========================================\n`;
        content += `           EARNINGS\n`;
        content += `========================================\n`;
        payslip.earnings.forEach(item => {
            content += `${item.label.padEnd(25)}: ${formatCurrency(item.amount).padStart(15)}\n`;
        });
        content += `----------------------------------------\n`;
        content += `${'Gross Salary'.padEnd(25)}: ${formatCurrency(payslip.totalEarnings).padStart(15)}\n`;
        content += `========================================\n\n`;

        content += `========================================\n`;
        content += `           DEDUCTIONS\n`;
        content += `========================================\n`;
        payslip.deductions.forEach(item => {
            content += `${item.label.padEnd(25)}: ${formatCurrency(item.amount).padStart(15)}\n`;
        });
        content += `----------------------------------------\n`;
        content += `${'Total Deductions'.padEnd(25)}: ${formatCurrency(payslip.totalDeductions).padStart(15)}\n`;
        content += `========================================\n\n`;

        content += `--- SALARY SUMMARY ---\n`;
        content += `Net Salary: ${formatCurrency(payslip.netSalary)}\n\n`;

        content += `--- PAYMENT DETAILS ---\n`;
        content += `Salary Credit Date: ${payslip.payment.date}\n`;
        content += `Bank: ${payslip.payment.bank}, A/C: ${payslip.payment.account}\n\n`;

        content += `This is a system-generated payslip.\n`;

        return content;
    };

    const handleDownload = () => {
        if (!employee || !payslipData) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Payslip data not available.",
            });
            return;
        }

        const payslipText = generatePayslipText(employee, payslipData);
        const blob = new Blob([payslipText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Payslip-${employee.employeeId}-${payslipData.monthYear}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
            title: "Download Started",
            description: `Your payslip has been downloaded as a TXT file.`,
        });
    };

    if (!employee || !payslipData) {
        return <div>Loading payslip data...</div>;
    }
    
    const { totalEarnings, totalDeductions, netSalary } = payslipData;

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Payslip for {payslipData.monthYear}</CardTitle>
                    <CardDescription>Review your salary details for the current month.</CardDescription>
                </div>
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download Payslip</Button>
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
