export interface Department {
  id: string;
  name: string;
  code: string;
  head_name: string;
  established_year: number;
  created_at: string;
}

export interface Course {
  id: string;
  department_id: string | null;
  name: string;
  code: string;
  credits: number;
  semester: number;
  description: string;
  created_at: string;
  departments?: Department;
}

export interface Faculty {
  id: string;
  auth_user_id: string | null;
  department_id: string | null;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  designation: string;
  qualification: string;
  joining_date: string;
  status: string;
  created_at: string;
  departments?: Department;
}

export interface Student {
  id: string;
  auth_user_id: string | null;
  department_id: string | null;
  enrollment_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  semester: number;
  batch_year: number;
  status: string;
  created_at: string;
  departments?: Department;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  faculty_id: string | null;
  semester: number;
  academic_year: string;
  created_at: string;
  students?: Student;
  courses?: Course;
  faculty?: Faculty;
}

export interface Attendance {
  id: string;
  enrollment_id: string;
  date: string;
  status: string;
  created_at: string;
  enrollments?: Enrollment;
}

export interface Grade {
  id: string;
  enrollment_id: string;
  exam_type: string;
  marks_obtained: number;
  max_marks: number;
  grade_letter: string;
  created_at: string;
  enrollments?: Enrollment;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: string;
  created_by: string;
  created_at: string;
}
