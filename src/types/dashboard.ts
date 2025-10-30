import { Department } from './roles';

// Student related types
export interface Student {
  id: string;
  code: string;
  name: string;
  department: Department;
  balance: number;
  balanceHours: number;
  status: 'demo' | 'ongoing' | 'paused' | 'stopped';
  classSyllabus?: string;
  gmeetLink?: string;
  contact?: string;
  nextClass?: string;
  demoCompletedDate?: string;
  firstClassDate?: string;
  feedbackSubmitted?: boolean;
}

// Teacher related types
export interface Teacher {
  id: string;
  code: string;
  name: string;
  subject: string;
  syllabus?: string;
  medium?: string;
  rating?: number;
  conversionRatio?: number;
  availability?: boolean;
  hourlyRate: number;
  status: 'pending' | 'interviewed' | 'approved' | 'active';
  phone?: string;
  teachingStyle?: string;
  gadgets?: string;
  internetType?: string;
}

// Class related types
export interface ClassSession {
  id: string;
  date: string;
  time: string;
  subject: string;
  teacher: Teacher;
  teacherId: string;
  student: Student;
  studentId: string;
  duration: number;
  gmeetLink: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'disputed';
  attendanceMarked?: boolean;
  topic?: string;
  homework?: string;
  teacherJoined?: boolean;
  studentJoined?: boolean;
}

// Dispute related types
export interface Dispute {
  id: string;
  studentId: string;
  student: Student;
  classDate: string;
  classId: string;
  reason: string;
  ageHours: number;
  status: 'open' | 'resolved' | 'escalated';
  teacherResponse?: string;
  resolutionNotes?: string;
  finalAdjustment?: number;
  createdAt: string;
}

// Demo related types
export interface DemoRequest {
  id: string;
  parentName: string;
  studentName?: string;
  preferredTime: string;
  subject: string;
  status: 'pending' | 'assigned' | 'completed';
  teacherId?: string;
  teacher?: Teacher;
  gmeetLink?: string;
  outcome?: 'registered' | 'not_interested' | 'follow_up';
  completedDate?: string;
}

// Ledger related types
export interface LedgerEntry {
  id: string;
  date: string;
  studentId: string;
  student: Student;
  particulars: string;
  credit: number;
  debit: number;
  balance: number;
  invoiceNo?: string;
  narration: string;
  paymentOrigin?: 'domestic' | 'international';
}

// Salary related types
export interface SalaryRecord {
  id: string;
  teacherId: string;
  teacher: Teacher;
  month: string;
  hoursTaught: number;
  hourlyRate: number;
  grossSalary: number;
  gst: number;
  netSalary: number;
}

// Department summary
export interface DepartmentSummary {
  department: Department;
  activeStudents: number;
  activeTeachers: number;
  todayClasses: number;
  conversionRate: number;
  revenue: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Feedback types
export interface Feedback {
  id: string;
  studentId: string;
  teacherId: string;
  rating: number;
  comments: string;
  submittedDate: string;
}

// Exam types
export interface Exam {
  id: string;
  studentId: string;
  subject: string;
  date: string;
  score?: number;
  maxScore: number;
  teacherComments?: string;
}

// Timetable types
export interface TimetableSlot {
  id: string;
  studentId: string;
  teacherId: string;
  dayOfWeek: number; // 0-6, Sunday = 0
  time: string;
  duration: number;
  subject: string;
  recurring: boolean;
}

// Availability types
export interface TeacherAvailability {
  teacherId: string;
  dayOfWeek: number;
  timeSlot: string;
  available: boolean;
}

// Stats for dashboards
export interface DashboardStats {
  totalStudents?: number;
  activeStudents?: number;
  totalTeachers?: number;
  totalRevenue?: number;
  pendingDisputes?: number;
  lowBalanceStudents?: number;
  todayClasses?: number;
}
