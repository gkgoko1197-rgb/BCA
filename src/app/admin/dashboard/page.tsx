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
import { ArrowUpDown, FileText, Download, Building, User, Banknote, Scissors, Pencil, UserPlus } from "lucide-react";
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
      name: "",
      designation: "",
      email: "",
      phone: "",
      address: "",
      dob: "",
      joiningDate: "",
      baseSalary: "",
  });

  const [payslipPreview, setPayslipPreview] = useState({
    hra: 0,
    da: 0,
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    pf: 0,
    esi: 0,
    professionalTax: 0,
    incomeTax: 0,
    totalEarnings: 0,
    totalDeductions: 0,
    netSalary: 0,
  });

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

  useEffect(() => {
    const salary = parseFloat(newEmployee.baseSalary) || 0;
    const isSenior = ['Lead', 'Manager', 'Head'].some(d => newEmployee.designation.includes(d));
    
    const hra = salary * 0.4;
    const da = salary * 0.15;
    const conveyanceAllowance = isSenior ? 3000 : 2500;
    const medicalAllowance = isSenior ? 3000 : 2500;
    const specialAllowance = salary * 0.2 + (isSenior ? 5000 : 0);
    
    const pf = salary * 0.12;
    const esi = salary * 0.0175;
    const professionalTax = salary > 0 ? 200 : 0;
    const incomeTax = salary * 0.15;

    const earnings = [salary, hra, da, conveyanceAllowance, medicalAllowance, specialAllowance];
    const totalEarnings = earnings.reduce((acc, val) => acc + val, 0);
    
    const deductions = [pf, esi, professionalTax, incomeTax];
    const totalDeductions = deductions.reduce((acc, val) => acc + val, 0);

    const netSalary = totalEarnings - totalDeductions;

    setPayslipPreview({
      hra,
      da,
      conveyanceAllowance,
      medicalAllowance,
      specialAllowance,
      pf,
      esi,
      professionalTax,
      incomeTax,
      totalEarnings,
      totalDeductions,
      netSalary
    });
  }, [newEmployee.baseSalary, newEmployee.designation]);

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
        if(field === 'baseSalary') {
            setSelectedEmployeeForPayslip({ ...selectedEmployeeForPayslip, [field]: parseFloat(value) || 0 });
        } else {
            setSelectedEmployeeForPayslip({ ...selectedEmployeeForPayslip, [field]: value });
        }
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const generatePayslipText = (employee: Employee, payslip: DetailedPayslipData): string => {
    let content = `----------------------------------------\n`;
    content += `         PAYSLIP - ${payslip.monthYear}\n`;
    content += `----------------------------------------\n\n`;

    content += `COMPANY DETAILS\n`;
    content += `Name: ${payslip.company.name}\n`;
    content += `Address: ${payslip.company.address}\n\n`;

    content += `EMPLOYEE DETAILS\n`;
    content += `Name: ${employee.name}\n`;
    content += `Employee ID: ${employee.employeeId}\n`;
    content += `Designation: ${employee.designation}\n`;
    content += `Joining Date: ${employee.joiningDate}\n\n`;

    content += `----------------------------------------\n`;
    content += `           EARNINGS\n`;
    content += `----------------------------------------\n`;
    payslip.earnings.forEach(item => {
        content += `${item.label.padEnd(25)}: ${formatCurrency(item.amount).padStart(15)}\n`;
    });
    content += `----------------------------------------\n`;
    content += `${'Gross Salary'.padEnd(25)}: ${formatCurrency(payslip.totalEarnings).padStart(15)}\n`;
    content += `----------------------------------------\n\n`;
    
    content += `----------------------------------------\n`;
    content += `           DEDUCTIONS\n`;
    content += `----------------------------------------\n`;
    payslip.deductions.forEach(item => {
        content += `${item.label.padEnd(25)}: ${formatCurrency(item.amount).padStart(15)}\n`;
    });
    content += `----------------------------------------\n`;
    content += `${'Total Deductions'.padEnd(25)}: ${formatCurrency(payslip.totalDeductions).padStart(15)}\n`;
    content += `----------------------------------------\n\n`;

    content += `NET SALARY: ${formatCurrency(payslip.netSalary)}\n\n`;
    
    content += `----------------------------------------\n`;

    return content;
  };

  const handleDownload = (format: "PDF" | "TXT") => {
    if (!selectedEmployeeForPayslip || !payslipData) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No employee or payslip data available to download.",
        });
        return;
    }

    const payslipText = generatePayslipText(selectedEmployeeForPayslip, payslipData);
    const blob = new Blob([payslipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip-${selectedEmployeeForPayslip.employeeId}-${payslipData.monthYear}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Payslip has been downloaded as a ${format} file.`,
    });
  };

  const handleNewEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateEmployee = () => {
    const { name, designation, email, phone, address, dob, joiningDate, baseSalary } = newEmployee;

    if (!name.trim() || !designation.trim() || !email.trim() || !phone.trim() || !address.trim() || !dob.trim() || !joiningDate.trim() || !baseSalary.trim()) {
        toast({
            variant: "destructive",
            title: "Incomplete Form",
            description: "Please fill out all fields to create an employee.",
        });
        return;
    }

    const salary = parseFloat(baseSalary);
    if (isNaN(salary) || salary <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Salary",
            description: "Please enter a valid positive number for the base salary.",
        });
        return;
    }

    const maxIdNum = employees.reduce((max, emp) => {
        const num = parseInt(emp.employeeId.replace('EMP', ''), 10);
        return num > max ? num : max;
    }, 0);
    const newEmployeeId = `EMP${String(maxIdNum + 1).padStart(4, '0')}`;

    const profileImageId = String(Math.floor(Math.random() * 20) + 1);

    const employeeToAdd: Employee = {
        id: `user-${Date.now()}`,
        employeeId: newEmployeeId,
        name,
        designation,
        email,
        phone,
        address,
        dob,
        joiningDate,
        baseSalary: salary,
        profileImage: profileImageId,
        leaveStatus: null,
    };

    const updatedEmployees = [...employees, employeeToAdd];
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    window.dispatchEvent(new Event('storage'));

    toast({
        title: "Employee Created",
        description: `${employeeToAdd.name} has been added successfully.`,
    });

    setIsCreateDialogOpen(false);
    setNewEmployee({
        name: "",
        designation: "",
        email: "",
        phone: "",
        address: "",
        dob: "",
        joiningDate: "",
        baseSalary: "",
    });
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Employee Records</CardTitle>
            <CardDescription>
              A list of all employees in the company.
            </CardDescription>
          </div>
           <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
            </Button>
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
                                <Label className="text-right">Base Salary</Label>
                                <Input type="number" value={selectedEmployeeForPayslip?.baseSalary || ''} onChange={(e) => handleDetailsChange('baseSalary', e.target.value)} className="col-span-2 h-8"/>
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
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                    Fill in the details to create a new employee profile. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                <div className="md:col-span-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <Separator className="my-2" />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={newEmployee.name} onChange={handleNewEmployeeChange} placeholder="e.g., Son Goku" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={newEmployee.email} onChange={handleNewEmployeeChange} placeholder="e.g., goku@capsulecorp.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input id="designation" value={newEmployee.designation} onChange={handleNewEmployeeChange} placeholder="e.g., Software Engineer" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={newEmployee.phone} onChange={handleNewEmployeeChange} placeholder="e.g., 555-1234" />
                </div>
                <div className="space-y-2 md:col-span-4">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={newEmployee.address} onChange={handleNewEmployeeChange} placeholder="e.g., 439 East District" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" value={newEmployee.dob} onChange={handleNewEmployeeChange} placeholder="e.g., April 16, 1984" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input id="joiningDate" value={newEmployee.joiningDate} onChange={handleNewEmployeeChange} placeholder="e.g., June 26, 2020" />
                </div>

                <div className="md:col-span-4">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-semibold">Salary & Payslip Details</h3>
                    <p className="text-sm text-muted-foreground mt-1">Enter base salary to preview the calculated payslip components.</p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="baseSalary">Base Salary (Monthly)</Label>
                    <Input id="baseSalary" type="number" value={newEmployee.baseSalary} onChange={handleNewEmployeeChange} placeholder="e.g., 50000" />
                </div>
                <div className="space-y-2 md:col-span-2 font-bold text-lg flex items-end justify-center pb-2">
                  <span>Net Salary: {formatCurrency(payslipPreview.netSalary)}</span>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-2 text-muted-foreground">Earnings Preview</h4>
                  <div className="space-y-2">
                    <div className="flex items-center"><Label htmlFor="hra" className="w-1/2">HRA</Label><Input id="hra" readOnly value={payslipPreview.hra.toFixed(2)} className="bg-muted/50 h-8"/></div>
                    <div className="flex items-center"><Label htmlFor="da" className="w-1/2">DA</Label><Input id="da" readOnly value={payslipPreview.da.toFixed(2)} className="bg-muted/50 h-8"/></div>
                    <div className="flex items-center"><Label htmlFor="conveyance" className="w-1/2">Conveyance</Label><Input id="conveyance" readOnly value={payslipPreview.conveyanceAllowance.toFixed(2)} className="bg-muted/50 h-8"/></div>
                    <div className="flex items-center"><Label htmlFor="medical" className="w-1/2">Medical</Label><Input id="medical" readOnly value={payslipPreview.medicalAllowance.toFixed(2)} className="bg-muted/50 h-8"/></div>
                    <div className="flex items-center"><Label htmlFor="special" className="w-1/2">Special</Label><Input id="special" readOnly value={payslipPreview.specialAllowance.toFixed(2)} className="bg-muted/50 h-8"/></div>
                    <div className="flex items-center font-bold mt-2"><Label htmlFor="totalEarnings" className="w-1/2">Gross Earnings</Label><Input id="totalEarnings" readOnly value={payslipPreview.totalEarnings.toFixed(2)} className="bg-muted/50 h-8"/></div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium mb-2 text-muted-foreground">Deductions Preview</h4>
                  <div className="space-y-2">
                    <div className="flex items-center"><Label htmlFor="pf" className="w-1/2">PF</Label><Input id="pf" readOnly value={payslipPreview.pf.toFixed(2)} className="bg-muted/50 h-8"/></div>
                    <div className="flex items-center"><Label htmlFor="esi" className="w-1/2">ESI</Label><Input id="esi" readOnly value={payslipPreview.esi.toFixed(2)} className="bg-muted/50 h-8"/></div>
                    <div className="flex items-center"><Label htmlFor="tax" className="w-1/2">Prof. Tax</Label><Input id="tax" readOnly value={payslipPreview.professionalTax.toFixed(2)} className="bg-muted/50 h-8"/></div>
                    <div className="flex items-center"><Label htmlFor="tds" className="w-1/2">Income Tax</Label><Input id="tds" readOnly value={payslipPreview.incomeTax.toFixed(2)} className="bg-muted/50 h-8"/></div>
                     <div className="flex items-center font-bold mt-2"><Label htmlFor="totalDeductions" className="w-1/2">Total Deductions</Label><Input id="totalDeductions" readOnly value={payslipPreview.totalDeductions.toFixed(2)} className="bg-muted/50 h-8"/></div>
                  </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateEmployee}>Save Employee</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
