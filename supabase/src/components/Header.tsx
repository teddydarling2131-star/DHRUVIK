import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/departments': 'Departments',
  '/courses': 'Courses',
  '/faculty': 'Faculty',
  '/students': 'Students',
  '/enrollments': 'Enrollments',
  '/attendance': 'Attendance',
  '/grades': 'Grades',
  '/announcements': 'Announcements',
};

export default function Header() {
  const location = useLocation();
  const title = titles[location.pathname] ?? 'EduManage';

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">College Management System</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-56"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">A</span>
        </div>
      </div>
    </header>
  );
}
