import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Courses from './pages/Courses';
import Faculty from './pages/Faculty';
import Students from './pages/Students';
import Enrollments from './pages/Enrollments';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Announcements from './pages/Announcements';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/students" element={<Students />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/announcements" element={<Announcements />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
