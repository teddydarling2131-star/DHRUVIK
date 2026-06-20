import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Enrollment } from '../types';
import { Plus, CheckCircle, XCircle, Clock, AlertCircle, X, BarChart3 } from 'lucide-react';

type AttStatus = 'present' | 'absent' | 'late';

export default function Attendance() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filterStudent, setFilterStudent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [attendance, setAttendance] = useState<Record<string, AttStatus>>({});
  const [existing, setExisting] = useState<Record<string, string>>({}); // enrollmentId -> attendance id

  // Summary data
  const [summary, setSummary] = useState<{ present: number; absent: number; late: number }>({ present: 0, absent: 0, late: 0 });

  async function loadEnrollments() {
    const { data } = await supabase
      .from('enrollments')
      .select('*, students(*), courses(*)')
      .order('created_at');
    setEnrollments(data ?? []);
    const { data: s } = await supabase.from('students').select('id, first_name, last_name, enrollment_number').order('first_name');
    setStudents((s ?? []) as any[]);
    setLoading(false);
  }

  async function loadAttendance() {
    if (!selectedDate) return;
    const { data } = await supabase.from('attendance').select('*').eq('date', selectedDate);
    const map: Record<string, AttStatus> = {};
    const idMap: Record<string, string> = {};
    (data ?? []).forEach(a => {
      map[a.enrollment_id] = a.status as AttStatus;
      idMap[a.enrollment_id] = a.id;
    });
    setAttendance(map);
    setExisting(idMap);

    // Summary
    const present = (data ?? []).filter(a => a.status === 'present').length;
    const absent = (data ?? []).filter(a => a.status === 'absent').length;
    const late = (data ?? []).filter(a => a.status === 'late').length;
    setSummary({ present, absent, late });
  }

  useEffect(() => { loadEnrollments(); }, []);
  useEffect(() => { loadAttendance(); }, [selectedDate]);

  function toggle(enrollId: string, status: AttStatus) {
    setAttendance(p => ({ ...p, [enrollId]: status }));
  }

  async function saveAll() {
    setSaving(true); setError(''); setSuccessMsg('');
    const toSave = filteredEnrollments.map(e => ({
      enrollment_id: e.id,
      date: selectedDate,
      status: attendance[e.id] ?? 'present',
    }));

    for (const att of toSave) {
      if (existing[att.enrollment_id]) {
        await supabase.from('attendance').update({ status: att.status }).eq('id', existing[att.enrollment_id]);
      } else {
        await supabase.from('attendance').insert(att);
      }
    }
    setSaving(false);
    setSuccessMsg('Attendance saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
    loadAttendance();
  }

  const filteredEnrollments = filterStudent
    ? enrollments.filter(e => e.student_id === filterStudent)
    : enrollments;

  const statusIcon = (s: AttStatus | undefined) => {
    if (s === 'present') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === 'absent') return <XCircle className="w-4 h-4 text-red-500" />;
    if (s === 'late') return <Clock className="w-4 h-4 text-amber-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="label mb-1">Date</label>
          <input className="input w-44" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div>
          <label className="label mb-1">Filter by Student</label>
          <select className="input w-56 appearance-none cursor-pointer" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
            <option value="">All Students</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.enrollment_number} - {s.first_name} {s.last_name}</option>)}
          </select>
        </div>
        <div className="ml-auto mt-5">
          <button className="btn-primary" onClick={saveAll} disabled={saving || filteredEnrollments.length === 0}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Summary */}
      {Object.keys(existing).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Present', value: summary.present, color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle },
            { label: 'Absent', value: summary.absent, color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle },
            { label: 'Late', value: summary.late, color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`flex items-center gap-3 p-4 rounded-xl border ${color}`}>
              <Icon className="w-6 h-6" />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Course</th>
                  <th className="table-header text-center">Present</th>
                  <th className="table-header text-center">Absent</th>
                  <th className="table-header text-center">Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEnrollments.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No enrollments to mark attendance for</td></tr>
                )}
                {filteredEnrollments.map(e => {
                  const cur = attendance[e.id];
                  return (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-gray-900">{(e.students as any)?.first_name} {(e.students as any)?.last_name}</p>
                          <p className="text-xs text-gray-400">{(e.students as any)?.enrollment_number}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <p className="font-medium text-gray-900">{(e.courses as any)?.name}</p>
                        <p className="text-xs text-gray-400">{(e.courses as any)?.code}</p>
                      </td>
                      {(['present', 'absent', 'late'] as AttStatus[]).map(s => (
                        <td key={s} className="table-cell text-center">
                          <button
                            onClick={() => toggle(e.id, s)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                              cur === s
                                ? s === 'present' ? 'bg-green-500 text-white shadow-md' : s === 'absent' ? 'bg-red-500 text-white shadow-md' : 'bg-amber-500 text-white shadow-md'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                            }`}
                          >
                            {s === 'present' ? <CheckCircle className="w-4 h-4" /> : s === 'absent' ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
