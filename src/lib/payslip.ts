import type { Employee } from './data';

export type PayslipEarning = { label: string; amount: number };
export type PayslipDeduction = { label: string; amount: number };

export type DetailedPayslipData = {
    monthYear: string;
    company: { name: string; address: string };
    earnings: PayslipEarning[];
    deductions: PayslipDeduction[];
    attendance: { totalDays: number; present: number; leave: number; lop: number };
    payment: { date: string; bank: string; account: string; mode: string };
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
};

export const generatePayslipDataForEmployee = (employee: Employee): DetailedPayslipData => {
    const monthYear = "July 2024";
    const company = { name: "Capsule Corp.", address: "1 Technology Drive, West City" };

    const baseSalary = employee.baseSalary;
    const isSenior = ['Lead', 'Manager', 'Head'].some(d => employee.designation.includes(d));

    const earnings: PayslipEarning[] = [
        { label: "Basic Salary", amount: baseSalary },
        { label: "HRA", amount: baseSalary * 0.4 },
        { label: "DA", amount: baseSalary * 0.15 },
        { label: "Conveyance Allowance", amount: isSenior ? 3000 : 2500 },
        { label: "Medical Allowance", amount: isSenior ? 3000 : 2500 },
        { label: "Special Allowance", amount: baseSalary * 0.2 + (isSenior ? 5000 : 0) },
        { label: "Overtime Pay", amount: Math.floor(Math.random() * 5) * 1000 },
        { label: "Bonus", amount: isSenior ? 15000 : 10000 },
    ];

    const deductions: PayslipDeduction[] = [
        { label: "PF", amount: baseSalary * 0.12 },
        { label: "ESI", amount: baseSalary * 0.0175 },
        { label: "Professional Tax", amount: 200 },
        { label: "Income Tax / TDS", amount: baseSalary * 0.15 },
        { label: "Loan Deduction", amount: Math.random() > 0.7 ? 2000 : 0 },
    ];
    
    const totalEarnings = earnings.reduce((acc, item) => acc + item.amount, 0);
    const totalDeductions = deductions.reduce((acc, item) => acc + item.amount, 0);
    const netSalary = totalEarnings - totalDeductions;
    
    const totalDays = 22;
    const leave = Math.floor(Math.random() * 2);
    const lop = Math.random() > 0.8 ? 1 : 0;
    const present = totalDays - leave - lop;

    const attendance = { totalDays, present, leave, lop };
    
    const payment = { date: "July 31, 2024", bank: "Galactic Bank", account: `******${employee.phone.slice(-4)}`, mode: "Direct Deposit" };

    return { monthYear, company, earnings, deductions, attendance, payment, totalEarnings, totalDeductions, netSalary };
};
