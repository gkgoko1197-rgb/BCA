"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { FileText, LogOut, Menu, User, Briefcase } from "lucide-react";
import type { Employee } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
      router.push("/");
      return;
    }
    const employees: Employee[] = JSON.parse(localStorage.getItem("employees") || "[]");
    const currentEmployee = employees.find((emp) => emp.id === employeeId);
    if (currentEmployee) {
      setEmployee(currentEmployee);
    } else {
        router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("employeeId");
    router.push("/");
  };
  
  const getAvatar = (employee: Employee) => {
    const placeholder = PlaceHolderImages.find(p => p.id === employee.profileImage);
    return placeholder?.imageUrl || `https://picsum.photos/seed/${employee.employeeId}/400/400`;
  }

  const navItems = [
    { href: "/dashboard", label: "Personal Info", icon: User },
    { href: "/dashboard/payslip", label: "Payslip", icon: FileText },
  ];
  
  const NavLinks = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === item.href && "bg-muted text-primary"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  if (!isClient || !employee) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="">HR STREAM</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>
          <div className="mt-auto p-4">
             <Button size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>
                Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                  <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span >HR STREAM</span>
                </Link>
                {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn("mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                      pathname === item.href && "bg-muted text-primary"
                    )}
                >
                      <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
                ))}
              </nav>
              <div className="mt-auto">
                  <Button size="sm" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4"/>
                      Logout
                  </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-xl font-semibold">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={getAvatar(employee)} alt={employee.name} data-ai-hint="profile portrait" />
                  <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{employee.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
