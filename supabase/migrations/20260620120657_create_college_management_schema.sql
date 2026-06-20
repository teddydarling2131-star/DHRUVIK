/*
# College Management System - Core Schema

## Overview
Creates the full college management system database schema with multi-role support (admin, faculty, student).

## New Tables

### departments
- id (uuid, primary key)
- name (text, unique, not null) — department name e.g. "Computer Science"
- code (text, unique, not null) — short code e.g. "CS"
- head_name (text) — HOD name
- established_year (int)
- created_at (timestamp)

### courses
- id (uuid, primary key)
- department_id (uuid, FK → departments)
- name (text, not null) — course title
- code (text, unique, not null) — course code e.g. "CS101"
- credits (int) — credit hours
- semester (int) — semester number (1-8)
- description (text)
- created_at (timestamp)

### faculty
- id (uuid, primary key)
- auth_user_id (uuid, FK → auth.users, nullable) — linked Supabase auth user
- department_id (uuid, FK → departments)
- employee_id (text, unique) — employee ID number
- first_name, last_name (text)
- email (text, unique)
- phone (text)
- designation (text) — e.g. "Professor", "Associate Professor"
- qualification (text)
- joining_date (date)
- status (text) — active/inactive
- created_at (timestamp)

### students
- id (uuid, primary key)
- auth_user_id (uuid, FK → auth.users, nullable)
- department_id (uuid, FK → departments)
- enrollment_number (text, unique)
- first_name, last_name (text)
- email (text, unique)
- phone (text)
- date_of_birth (date)
- gender (text)
- address (text)
- semester (int)
- batch_year (int)
- status (text) — active/graduated/dropped
- created_at (timestamp)

### enrollments
- id (uuid, primary key)
- student_id (uuid, FK → students)
- course_id (uuid, FK → courses)
- faculty_id (uuid, FK → faculty)
- semester (int)
- academic_year (text)
- created_at (timestamp)

### attendance
- id (uuid, primary key)
- enrollment_id (uuid, FK → enrollments)
- date (date)
- status (text) — present/absent/late
- created_at (timestamp)

### grades
- id (uuid, primary key)
- enrollment_id (uuid, FK → enrollments)
- exam_type (text) — midterm/final/assignment/quiz
- marks_obtained (numeric)
- max_marks (numeric)
- grade_letter (text)
- created_at (timestamp)

### announcements
- id (uuid, primary key)
- title (text)
- content (text)
- audience (text) — all/students/faculty
- created_by (text) — name of creator
- created_at (timestamp)

## Security
- RLS enabled on all tables
- Public read/write for anon + authenticated (admin-managed single-tenant app)
*/

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  head_name text DEFAULT '',
  established_year int DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_departments" ON departments;
CREATE POLICY "anon_select_departments" ON departments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_departments" ON departments;
CREATE POLICY "anon_insert_departments" ON departments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_departments" ON departments;
CREATE POLICY "anon_update_departments" ON departments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_departments" ON departments;
CREATE POLICY "anon_delete_departments" ON departments FOR DELETE TO anon, authenticated USING (true);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  credits int DEFAULT 3,
  semester int DEFAULT 1,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE TO anon, authenticated USING (true);

-- Faculty
CREATE TABLE IF NOT EXISTS faculty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  employee_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  designation text DEFAULT 'Lecturer',
  qualification text DEFAULT '',
  joining_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_faculty" ON faculty;
CREATE POLICY "anon_select_faculty" ON faculty FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_faculty" ON faculty;
CREATE POLICY "anon_insert_faculty" ON faculty FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_faculty" ON faculty;
CREATE POLICY "anon_update_faculty" ON faculty FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_faculty" ON faculty;
CREATE POLICY "anon_delete_faculty" ON faculty FOR DELETE TO anon, authenticated USING (true);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  enrollment_number text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  date_of_birth date,
  gender text DEFAULT 'other',
  address text DEFAULT '',
  semester int DEFAULT 1,
  batch_year int DEFAULT EXTRACT(YEAR FROM NOW()),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE TO anon, authenticated USING (true);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id uuid REFERENCES faculty(id) ON DELETE SET NULL,
  semester int NOT NULL,
  academic_year text NOT NULL DEFAULT '2024-25',
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id, academic_year)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_enrollments" ON enrollments;
CREATE POLICY "anon_select_enrollments" ON enrollments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_enrollments" ON enrollments;
CREATE POLICY "anon_insert_enrollments" ON enrollments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_enrollments" ON enrollments;
CREATE POLICY "anon_update_enrollments" ON enrollments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_enrollments" ON enrollments;
CREATE POLICY "anon_delete_enrollments" ON enrollments FOR DELETE TO anon, authenticated USING (true);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present',
  created_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_attendance" ON attendance;
CREATE POLICY "anon_select_attendance" ON attendance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
CREATE POLICY "anon_insert_attendance" ON attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance;
CREATE POLICY "anon_update_attendance" ON attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance;
CREATE POLICY "anon_delete_attendance" ON attendance FOR DELETE TO anon, authenticated USING (true);

-- Grades
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  exam_type text NOT NULL DEFAULT 'midterm',
  marks_obtained numeric(6,2) NOT NULL,
  max_marks numeric(6,2) NOT NULL DEFAULT 100,
  grade_letter text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_grades" ON grades;
CREATE POLICY "anon_select_grades" ON grades FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_grades" ON grades;
CREATE POLICY "anon_insert_grades" ON grades FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_grades" ON grades;
CREATE POLICY "anon_update_grades" ON grades FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_grades" ON grades;
CREATE POLICY "anon_delete_grades" ON grades FOR DELETE TO anon, authenticated USING (true);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  audience text DEFAULT 'all',
  created_by text DEFAULT 'Admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
CREATE POLICY "anon_select_announcements" ON announcements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_announcements" ON announcements;
CREATE POLICY "anon_insert_announcements" ON announcements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_announcements" ON announcements;
CREATE POLICY "anon_update_announcements" ON announcements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_announcements" ON announcements;
CREATE POLICY "anon_delete_announcements" ON announcements FOR DELETE TO anon, authenticated USING (true);

-- Seed some demo departments
INSERT INTO departments (name, code, head_name, established_year) VALUES
  ('Computer Science & Engineering', 'CSE', 'Dr. Rajesh Kumar', 1998),
  ('Electronics & Communication', 'ECE', 'Dr. Priya Sharma', 2000),
  ('Mechanical Engineering', 'ME', 'Dr. Suresh Patel', 1995),
  ('Civil Engineering', 'CE', 'Dr. Anita Verma', 1993),
  ('Business Administration', 'MBA', 'Dr. Mohan Das', 2005)
ON CONFLICT (code) DO NOTHING;

-- Seed demo courses
INSERT INTO courses (department_id, name, code, credits, semester, description)
SELECT d.id, c.name, c.code, c.credits, c.semester, c.description FROM (
  VALUES
    ('CSE', 'Data Structures & Algorithms', 'CS201', 4, 3, 'Fundamental data structures and algorithm design'),
    ('CSE', 'Database Management Systems', 'CS301', 4, 5, 'Relational databases, SQL, and normalization'),
    ('CSE', 'Operating Systems', 'CS302', 4, 5, 'Process management, memory, and file systems'),
    ('CSE', 'Web Technologies', 'CS401', 3, 7, 'HTML, CSS, JavaScript, and web frameworks'),
    ('ECE', 'Digital Electronics', 'EC201', 4, 3, 'Boolean algebra, logic gates, and circuits'),
    ('ECE', 'Signals & Systems', 'EC301', 4, 5, 'Continuous and discrete-time signal analysis'),
    ('ME', 'Thermodynamics', 'ME201', 4, 3, 'Laws of thermodynamics and applications'),
    ('MBA', 'Marketing Management', 'MB301', 3, 3, 'Principles of marketing and strategy')
) AS c(dept_code, name, code, credits, semester, description)
JOIN departments d ON d.code = c.dept_code
ON CONFLICT (code) DO NOTHING;

-- Seed demo faculty
INSERT INTO faculty (department_id, employee_id, first_name, last_name, email, phone, designation, qualification, joining_date, status)
SELECT d.id, f.employee_id, f.first_name, f.last_name, f.email, f.phone, f.designation, f.qualification, f.joining_date::date, 'active'
FROM (
  VALUES
    ('CSE', 'EMP001', 'Rajesh', 'Kumar', 'rajesh.kumar@college.edu', '9876543210', 'Professor', 'PhD Computer Science', '2010-07-01'),
    ('CSE', 'EMP002', 'Meena', 'Joshi', 'meena.joshi@college.edu', '9876543211', 'Associate Professor', 'MTech CSE', '2015-08-01'),
    ('ECE', 'EMP003', 'Priya', 'Sharma', 'priya.sharma@college.edu', '9876543212', 'Professor', 'PhD Electronics', '2008-06-01'),
    ('ME', 'EMP004', 'Suresh', 'Patel', 'suresh.patel@college.edu', '9876543213', 'Professor', 'PhD Mechanical', '2005-07-01'),
    ('MBA', 'EMP005', 'Mohan', 'Das', 'mohan.das@college.edu', '9876543214', 'Professor', 'PhD Management', '2012-08-01')
) AS f(dept_code, employee_id, first_name, last_name, email, phone, designation, qualification, joining_date)
JOIN departments d ON d.code = f.dept_code
ON CONFLICT (employee_id) DO NOTHING;

-- Seed demo students
INSERT INTO students (department_id, enrollment_number, first_name, last_name, email, phone, date_of_birth, gender, semester, batch_year, status)
SELECT d.id, s.enrollment_number, s.first_name, s.last_name, s.email, s.phone, s.dob::date, s.gender, s.semester, s.batch_year, 'active'
FROM (
  VALUES
    ('CSE', 'STU2024001', 'Arun', 'Singh', 'arun.singh@student.edu', '9123456781', '2003-05-15', 'male', 3, 2024),
    ('CSE', 'STU2024002', 'Deepa', 'Nair', 'deepa.nair@student.edu', '9123456782', '2003-08-22', 'female', 3, 2024),
    ('CSE', 'STU2024003', 'Kiran', 'Rao', 'kiran.rao@student.edu', '9123456783', '2002-11-10', 'male', 5, 2023),
    ('ECE', 'STU2024004', 'Sneha', 'Gupta', 'sneha.gupta@student.edu', '9123456784', '2003-03-18', 'female', 3, 2024),
    ('ME',  'STU2024005', 'Ravi', 'Verma', 'ravi.verma@student.edu', '9123456785', '2003-07-25', 'male', 3, 2024),
    ('MBA', 'STU2024006', 'Pooja', 'Mehta', 'pooja.mehta@student.edu', '9123456786', '2001-12-05', 'female', 3, 2024)
) AS s(dept_code, enrollment_number, first_name, last_name, email, phone, dob, gender, semester, batch_year)
JOIN departments d ON d.code = s.dept_code
ON CONFLICT (enrollment_number) DO NOTHING;

-- Seed announcements
INSERT INTO announcements (title, content, audience, created_by) VALUES
  ('Semester Examinations Schedule', 'The semester examinations will commence from July 15, 2025. Students are advised to check the detailed schedule on the notice board.', 'all', 'Admin'),
  ('Faculty Development Program', 'A Faculty Development Program on AI & Machine Learning will be held from June 25-30, 2025. All faculty members are encouraged to attend.', 'faculty', 'Admin'),
  ('Scholarship Applications Open', 'Applications for merit-based scholarships for the academic year 2025-26 are now open. Eligible students can apply through the student portal.', 'students', 'Admin')
ON CONFLICT DO NOTHING;
