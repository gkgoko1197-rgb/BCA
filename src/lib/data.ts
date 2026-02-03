import { eachDayOfInterval, format } from 'date-fns';
import type { placeholderImages } from './placeholder-images';

export type Employee = {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  email: string;
  joiningDate: string;
  dob: string;
  address: string;
  phone: string;
  profileImage: string;
  leaveStatus: 'Accepted' | 'Rejected' | 'Pending' | null;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  message: string;
  date: string;
};

export type Message = {
    id: string;
    employeeName: string;
    subject: string;
    body: string;
    date: string;
}

const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

export const initialEmployees: Employee[] = [
  {
    id: "user-1",
    name: "Goko Vegeta",
    employeeId: "EMP001",
    designation: "Lead Software Engineer",
    email: "goko.vegeta@example.com",
    joiningDate: formatDate(new Date("2020-01-15")),
    dob: formatDate(new Date("1990-05-25")),
    address: "123 Saiyan Street, West City",
    phone: "555-0101",
    profileImage: "1",
    leaveStatus: null,
  },
  ...Array.from({ length: 19 }, (_, i) => {
    const id = i + 2;
    const firstNames = ["Son", "Krillin", "Bulma", "Piccolo", "Chi-Chi", "Trunks", "Android", "Master", "Yamcha", "Tien", "Frieza", "Cell", "Majin", "Beerus", "Whis", "Jiren", "Kale", "Caulifla", "Broly"];
    const lastNames = ["Gohan", "Mu", "Brief", "Jr.", "Ox-King", "Briefs", "18", "Roshi", "Shinhan", "Chaozu", "Force", "Saga", "Buu", "Sama", "Angel", "The Gray", "Berserker", "Super Saiyan", "Legendary"];
    const designations = ["Software Engineer", "Product Manager", "UI/UX Designer", "QA Tester", "DevOps Engineer", "Data Scientist", "HR Manager", "Marketing Head", "Intern", "Team Lead"];
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const joiningDate = new Date(2021 + Math.floor(i/5), (i % 12) + 1, (i % 28) + 1);
    const dob = new Date(1980 + i, (i % 12) + 1, (i % 28) + 1);

    return {
      id: `user-${id}`,
      name: name,
      employeeId: `EMP${String(id).padStart(4, '0')}`,
      designation: designations[i % designations.length],
      email: email,
      joiningDate: formatDate(joiningDate),
      dob: formatDate(dob),
      address: `${124 + i} Galaxy Road, Planet ${i + 1}`,
      phone: `555-${String(100 + i).padStart(4, '0')}`,
      profileImage: `${(i % 19) + 2}`,
      leaveStatus: null,
    };
  }),
];

export const sampleMessages: Message[] = Array.from({ length: 20 }, (_, i) => {
    const employee = initialEmployees[i % initialEmployees.length];
    return {
        id: `msg-${i + 1}`,
        employeeName: employee.name,
        subject: `Re: Project Dragonball Update ${i + 1}`,
        body: `Hi Admin, this is a sample message regarding the project. We are making good progress. Thanks, ${employee.name.split(' ')[0]}`,
        date: formatDate(new Date(2024, 5, 20 - i))
    }
});

export const sampleLeaveRequests: LeaveRequest[] = Array.from({ length: 5 }, (_, i) => {
    const employee = initialEmployees[(i + 5) % initialEmployees.length];
    return {
        id: `leave-${i + 1}`,
        employeeId: employee.employeeId,
        employeeName: employee.name,
        message: `Dear Admin, I would like to request a leave of absence for ${i + 1} day(s) for personal reasons. Thank you for your consideration.`,
        date: formatDate(new Date(2024, 6, 10 - i))
    }
});


export type AttendanceRecord = {
  present: number;
  absent: number;
  absentIds: string[];
};

export type AttendanceData = {
  [date: string]: AttendanceRecord;
};

const generateInitialAttendanceData = (): AttendanceData => {
  const data: AttendanceData = {};
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-02-28');
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const employeeIds = initialEmployees.map(emp => emp.employeeId);

  days.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const absentCount = Math.floor(Math.random() * 3); // 0, 1, or 2 absent
    const shuffledIds = [...employeeIds].sort(() => 0.5 - Math.random());
    const absentIds = shuffledIds.slice(0, absentCount);
    
    data[dateKey] = {
      present: employeeIds.length - absentCount,
      absent: absentCount,
      absentIds: absentIds,
    };
  });

  return data;
};

export const initialAttendanceData: AttendanceData = generateInitialAttendanceData();
