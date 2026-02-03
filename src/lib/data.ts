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
    const designations = ["Software Engineer", "Product Manager", "UI/UX Designer", "QA Tester", "DevOps Engineer", "Data Scientist", "HR Manager", "Marketing Head"];
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const joiningDate = new Date(2021 + Math.floor(i/5), (i % 12) + 1, (i % 28) + 1);
    const dob = new Date(1992 + i, (i % 12) + 1, (i % 28) + 1);

    return {
      id: `user-${id}`,
      name: name,
      employeeId: `EMP${String(id).padStart(3, '0')}`,
      designation: designations[i % designations.length],
      email: email,
      joiningDate: formatDate(joiningDate),
      dob: formatDate(dob),
      address: `${124 + i} Galaxy Road, Planet ${i + 1}`,
      phone: `555-01${String(id).padStart(2, '0')}`,
      profileImage: `${id}`,
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

export const attendanceData: { [key: string]: string[] } = {
    "2024-07-01": ["EMP003", "EMP008"],
    "2024-07-02": ["EMP015"],
    "2024-07-05": ["EMP002", "EMP011", "EMP019"],
    "2024-07-08": ["EMP007"],
    "2024-07-10": ["EMP005", "EMP014"],
    "2024-07-12": ["EMP009"],
    "2024-07-15": ["EMP004", "EMP010", "EMP018", "EMP020"],
    "2024-07-18": ["EMP006"],
    "2024-07-22": ["EMP012", "EMP013"],
    "2024-07-25": ["EMP016", "EMP017"],
    "2024-07-29": ["EMP001"],
};
