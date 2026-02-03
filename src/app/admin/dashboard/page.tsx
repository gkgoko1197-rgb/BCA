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
import { ArrowUpDown, FileText, Download, Building, User, Banknote, Scissors, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [originalPayslipData, setOriginalPayslipData] = useState<DetailedPayslipData | null>(null);
  const [originalEmployee, setOriginalEmployee] = useState<Employee | null>(null);

  // State for inline editing of payslip
  const [isPayslipEditing, setIsPayslipEditing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const loadData = () => {
        const employeesData = JSON.parse(
          localStorage.getItem("employees") || "[]"
        );
        setEmployees(employeesData);
    };
    loadData();
    
    window.addEventListener('storage', loadData);
    return () => {
        window.removeEventListener('storage', loadData);
    };
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
    setOriginalPayslipData(JSON.parse(JSON.stringify(data)));
    setSelectedEmployeeForPayslip(employee);
    setOriginalEmployee(JSON.parse(JSON.stringify(employee)));
    setIsPayslipEditing(false);
  };
  
  const handlePayslipChange = (type: 'earnings' | 'deductions', index: number, value: string) => {
    if (!payslipData) return;

    const newPayslip = { ...payslipData, earnings: [...payslipData.earnings], deductions: [...payslipData.deductions] };
    const amount = parseFloat(value) || 0;

    if (type === 'earnings') {
        newPayslip.earnings[index] = { ...newPayslip.earnings[index], amount };
    } else {
        newPayslip.deductions[index] = { ...newPayslip.deductions[index], amount };
    }

    const totalEarnings = newPayslip.earnings.reduce((acc, item) => acc + item.amount, 0);
    const totalDeductions = newPayslip.deductions.reduce((acc, item) => acc + item.amount, 0);
    const netSalary = totalEarnings - totalDeductions;
    
    setPayslipData({ ...newPayslip, totalEarnings, totalDeductions, netSalary });
  };

  const handleDetailsChange = (field: keyof Employee | 'companyName' | 'companyAddress', value: string) => {
    if (field === 'companyName' || field === 'companyAddress') {
      if (payslipData) {
        const newPayslipData = { ...payslipData, company: { ...payslipData.company } };
        if (field === 'companyName') {
          newPayslipData.company.name = value;
        } else {
          newPayslipData.company.address = value;
        }
        setPayslipData(newPayslipData);
      }
    } else if (selectedEmployeeForPayslip) {
      setSelectedEmployeeForPayslip({ ...selectedEmployeeForPayslip, [field]: value });
    }
  };

  const handleSaveAllChanges = () => {
    if (selectedEmployeeForPayslip) {
      const updatedEmployees = employees.map(emp =>
        emp.id === selectedEmployeeForPayslip.id ? selectedEmployeeForPayslip : emp
      );
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      window.dispatchEvent(new Event('storage'));
      toast({
        title: "Changes Saved",
        description: "Employee details updated. Payslip changes are temporary for this session.",
      });
    }
    setOriginalPayslipData(payslipData);
    setOriginalEmployee(selectedEmployeeForPayslip);
    setIsPayslipEditing(false);
  };

  const handleCancelAllChanges = () => {
    setPayslipData(originalPayslipData);
    setSelectedEmployeeForPayslip(originalEmployee);
    setIsPayslipEditing(false);
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
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedEmployeeForPayslip(null);
            setIsPayslipEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Payslip for {originalEmployee?.name}
            </DialogTitle>
            <DialogDescription>
              {payslipData?.monthYear} - Employee ID:{" "}
              {originalEmployee?.employeeId}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 overflow-y-auto max-h-[70vh]">
             <div className="grid md:grid-cols-2 gap-6 text-sm">
                 <div className="space-y-4">
                    <h3 className="font-semibold flex items-center"><User className="mr-2 h-4 w-4 text-primary"/>Employee Information</h3>
                    {isPayslipEditing ? (
                        <>
                            <div className="grid grid-cols-3 items-center gap-2">
                                <Label className="text-right">Name</Label>
                                <Input value={selectedEmployeeForPayslip?.name || ''} onChange={(e) => handleDetailsChange('name', e.target.value)} className="col-span-2 h-8"/>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-2">
                                <Label className="text-right">Employee ID</Label>
                                <p className="col-span-2 text-muted-foreground">{selectedEmployeeForPayslip?.employeeId}</p>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-2">
                                <Label className="text-right">Designation</Label>
                                <Input value={selectedEmployeeForPayslip?.designation || ''} onChange={(e) => handleDetailsChange('designation', e.target.value)} className="col-span-2 h-8"/>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-2">
                                <Label className="text-right">Joining Date</Label>
                                <p className="col-span-2 text-muted-foreground">{selectedEmployeeForPayslip?.joiningDate}</p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {selectedEmployeeForPayslip?.name}</p>
                            <p><strong>Employee ID:</strong> {selectedEmployeeForPayslip?.employeeId}</p>
                            <p><strong>Designation:</strong> {selectedEmployeeForPayslip?.designation}</p>
                            <p><strong>Date of Joining:</strong> {selectedEmployeeForPayslip?.joiningDate}</p>
                        </div>
                    )}
                </div>
                <div className="space-y-4 text-right md:text-left">
                    <h3 className="font-semibold flex items-center md:items-start justify-end md:justify-start"><Building className="mr-2 h-4 w-4 text-primary"/>Employer Information</h3>
                     {isPayslipEditing ? (
                        <>
                           <div className="grid grid-cols-3 items-center gap-2 text-left">
                                <Label className="text-right">Company</Label>
                                <Input value={payslipData?.company.name || ''} onChange={(e) => handleDetailsChange('companyName', e.target.value)} className="col-span-2 h-8"/>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-2 text-left">
                                <Label className="text-right">Address</Label>
                                <Input value={payslipData?.company.address || ''} onChange={(e) => handleDetailsChange('companyAddress', e.target.value)} className="col-span-2 h-8"/>
                            </div>
                        </>
                    ) : (
                         <div className="space-y-2">
                            <p><strong>{payslipData?.company.name}</strong></p>
                            <p>{payslipData?.company.address}</p>
                        </div>
                    )}
                </div>
            </div>
            <Separator className="my-4" />
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2 flex items-center"><Banknote className="mr-2 h-4 w-4 text-green-500"/>Earnings</h3>
                    <Table>
                        <TableBody>
                            {payslipData?.earnings.map((item, index) => 
                              <TableRow key={item.label}>
                                <TableCell>{item.label}</TableCell>
                                <TableCell className="text-right">
                                  {isPayslipEditing ? (
                                    <Input type="number" value={item.amount} onChange={(e) => handlePayslipChange('earnings', index, e.target.value)} className="h-8 text-right"/>
                                  ) : (
                                    formatCurrency(item.amount)
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow className="font-bold bg-muted/50"><TableCell>Gross Salary</TableCell><TableCell className="text-right">{formatCurrency(payslipData?.totalEarnings || 0)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2 flex items-center"><Scissors className="mr-2 h-4 w-4 text-red-500"/>Deductions</h3>
                    <Table>
                        <TableBody>
                            {payslipData?.deductions.map((item, index) => 
                              <TableRow key={item.label}>
                                <TableCell>{item.label}</TableCell>
                                <TableCell className="text-right">
                                {isPayslipEditing ? (
                                    <Input type="number" value={item.amount} onChange={(e) => handlePayslipChange('deductions', index, e.target.value)} className="h-8 text-right"/>
                                  ) : (
                                    formatCurrency(item.amount)
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
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
          <DialogFooter className="sm:justify-between items-center">
             <div>
              {isPayslipEditing && <p className="text-sm text-muted-foreground">Employee details persist. Other changes are temporary.</p>}
            </div>
            {isPayslipEditing ? (
               <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelAllChanges}>Cancel</Button>
                  <Button onClick={handleSaveAllChanges}>Save Changes</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                  <Button onClick={() => handleDownload("PDF")}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                  </Button>
                  <Button onClick={() => handleDownload("TXT")} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  TXT
                  </Button>
                  <Button variant="secondary" onClick={() => setIsPayslipEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                  </Button>
                  <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                  </DialogClose>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
