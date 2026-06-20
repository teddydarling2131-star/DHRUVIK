import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, GraduationCap, BookOpen, Building2, TrendingUp, ClipboardCheck, Megaphone, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Announcement } from '../types';

interface Stats {
  students: number;
  faculty: number;
  courses: number;
  departments: number;
  enrollments: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ students: 0, faculty: 0, courses: 0, departments: 0, enrollments: 0 });
  const [deptData, setDeptData] = useState<{ name: string; students: number }[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, f, c, d, e, ann] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('faculty').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        students: s.count ?? 0,
        faculty: f.count ?? 0,
        courses: c.count ?? 0,
        departments: d.count ?? 0,
        enrollments: e.count ?? 0,
      });
      setAnnouncements(ann.data ?? []);

      // Department-wise student count
      const { data: depts } = await supabase
        .from('departments')
        .select('id, code');
      if (depts) {
        const counts = await Promise.all(
          depts.map(async dept => {
            const { count } = await supabase
              .from('students')
              .select('id', { count: 'exact', head: true })
              .eq('department_id', dept.id);
            return { name: dept.code, students: count ?? 0 };
          })
        );
        setDeptData(counts);
      }

      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'bg-blue-500', light: 'bg-blue-50 text-blue-600' },
    { label: 'Faculty Members', value: stats.faculty, icon: Users, color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-600' },
    { label: 'Courses Offered', value: stats.courses, icon: BookOpen, color: 'bg-amber-500', light: 'bg-amber-50 text-amber-600' },
    { label: 'Departments', value: stats.departments, icon: Building2, color: 'bg-rose-500', light: 'bg-rose-50 text-rose-600' },
    { label: 'Enrollments', value: stats.enrollments, icon: ClipboardCheck, color: 'bg-violet-500', light: 'bg-violet-50 text-violet-600' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, light }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${light}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            Students by Department
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deptData} dataKey="students" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Announcements */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary-500" />
          Recent Announcements
        </h3>
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-gray-900">{a.title}</p>
                    <span className={`badge ${a.audience === 'all' ? 'bg-blue-100 text-blue-700' : a.audience === 'students' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {a.audience}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString()} · {a.created_by}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
