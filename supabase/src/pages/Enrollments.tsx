import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Enrollment } from '../types';
import { Plus, Trash2, ClipboardList, AlertCircle, X, ChevronDown } from 'lucide-react';

const empty = { student_id: '', course_id: '', faculty_id: '', semester: 1, academic_year: '2024-25' };

export default function Enrollments() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStudent, setFilterStudent] = useState('');

  async function load() {
    const [{ data: e }, { data: s }, { data: c }, { data: f }] = await Promise.all([
      supabase.from('enrollments').select('*, students(*), courses(*), faculty(*)').order('created_at', { ascending: false }),
      supabase.from('students').select('id, first_name, last_name, enrollment_number').order('first_name'),
      supabase.from('courses').select('id, name, code').order('code'),
      supabase.from('faculty').select('id, first_name, last_name').order('first_name'),
    ]);
    setItems(e ?? []);
    setStudents((s ?? []) as any[]);
    setCourses((c ?? []) as any[]);
    setFaculty((f ?? []) as any[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.student_id || !form.course_id) { setError('Student and course are required.'); return; }
    setSaving(true); setError('');
    const payload = { ...form, faculty_id: form.faculty_id || null };
    const { error: e } = await supabase.from('enrollments').insert(payload);
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false); setModal(false); setForm({ ...empty }); load();
  }

  async function remove(id: string) {
    if (!confirm('Remove this enrollment? Attendance and grades for it will also be deleted.')) return;
    await supabase.from('enrollments').delete().eq('id', id);
    load();
  }

  const visible = filterStudent ? items.filter(e => e.student_id === filterStudent) : items;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select className="input w-56 appearance-none cursor-pointer" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.enrollment_number} - {s.first_name} {s.last_name}</option>)}
        </select>
        <div className="ml-auto">
          <button className="btn-primary" onClick={() => { setForm({ ...empty }); setError(''); setModal(true); }}>
            <Plus className="w-4 h-4" /> Enroll Student
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Faculty</th>
                  <th className="table-header">Semester</th>
                  <th className="table-header">Academic Year</th>
                  <th className="table-header">Enrolled On</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No enrollments found</td></tr>
                )}
                {visible.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{(e.students as any)?.first_name} {(e.students as any)?.last_name}</p>
                        <p className="text-xs text-gray-400">{(e.students as any)?.enrollment_number}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{(e.courses as any)?.name}</p>
                        <p className="text-xs text-gray-400">{(e.courses as any)?.code}</p>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">
                      {(e.faculty as any) ? `${(e.faculty as any).first_name} ${(e.faculty as any).last_name}` : '—'}
                    </td>
                    <td className="table-cell">Sem {e.semester}</td>
                    <td className="table-cell">{e.academic_year}</td>
                    <td className="table-cell text-gray-400">{new Date(e.created_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <button onClick={() => remove(e.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Enroll Student</h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="label">Student *</label>
                <select className="input" value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.enrollment_number} - {s.first_name} {s.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Course *</label>
                <select className="input" value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))}>
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Faculty</label>
                <select className="input" value={form.faculty_id} onChange={e => setForm(p => ({ ...p, faculty_id: e.target.value }))}>
                  <option value="">Select faculty (optional)</option>
                  {faculty.map(f => <option key={f.id} value={f.id}>{f.first_name} {f.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Semester</label>
                  <select className="input" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: parseInt(e.target.value) }))}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Academic Year</label>
                  <input className="input" value={form.academic_year} onChange={e => setForm(p => ({ ...p, academic_year: e.target.value }))} placeholder="2024-25" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Enroll'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
