import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Building2,
  ClipboardList, BarChart3, Megaphone, Menu, X, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Departments', icon: Building2, to: '/departments' },
  { label: 'Courses', icon: BookOpen, to: '/courses' },
  { label: 'Faculty', icon: Users, to: '/faculty' },
  { label: 'Students', icon: GraduationCap, to: '/students' },
  { label: 'Enrollments', icon: ClipboardList, to: '/enrollments' },
  { label: 'Attendance', icon: BarChart3, to: '/attendance' },
  { label: 'Grades', icon: BarChart3, to: '/grades' },
  { label: 'Announcements', icon: Megaphone, to: '/announcements' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`flex flex-col bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700/60">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">EduManage</p>
              <p className="text-xs text-gray-400">College System</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center mx-auto">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-700/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">A</span>
            </div>
            <div>
              <p className="text-xs font-semibold">Administrator</p>
              <p className="text-xs text-gray-400">admin@college.edu</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
