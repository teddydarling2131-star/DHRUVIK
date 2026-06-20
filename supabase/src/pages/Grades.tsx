import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Enrollment, Grade } from '../types';
import { Plus, Pencil, Trash2, AlertCircle, X } from 'lucide-react';

const empty = { enrollment_id: '', exam_type: 'midterm', marks_obtained: '', max_marks: '100', grade_letter: '' };
const examTypes = ['midterm', 'final', 'assignment', 'quiz', 'practical'];

function calcGrade(obtained: number, max: number): string {
  const pct = (obtained / max) * 100;
  if (pct >= 90) return 'O';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  if (pct >= 40) return 'C';
  return 'F';
}

const gradeColor = (g: string) => {
  if (['O', 'A+', 'A'].includes(g)) return 'bg-green-100 text-green-700';
  if (['B+', 'B'].includes(g)) return 'bg-blue-100 text-blue-700';
  if (g === 'C') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

export default function Grades() {
  const [grades, setGrades] = useState<(Grade & { enrollments: any })[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStudent, setFilterStudent] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing: Grade | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [{ data: g }, { data: e }, { data: s }] = await Promise.all([
      supabase.from('grades').select('*, enrollments(*, students(*), courses(*))').order('created_at', { ascending: false }),
      supabase.from('enrollments').select('*, students(*), courses(*)').order('created_at'),
      supabase.from('students').select('id, first_name, last_name, enrollment_number').order('first_name'),
    ]);
    setGrades(g ?? []);
    setEnrollments(e ?? []);
    setStudents((s ?? []) as any[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...empty }); setError(''); setModal({ open: true, editing: null }); }
  function openEdit(g: Grade) {
    setForm({ enrollment_id: g.enrollment_id, exam_type: g.exam_type, marks_obtained: String(g.marks_obtained), max_marks: String(g.max_marks), grade_letter: g.grade_letter });
    setError('');
    setModal({ open: true, editing: g });
  }

  async function save() {
    if (!form.enrollment_id || !form.marks_obtained) { setError('Enrollment and marks are required.'); return; }
    const obtained = parseFloat(form.marks_obtained);
    const max = parseFloat(form.max_marks);
    if (isNaN(obtained) || isNaN(max) || obtained < 0 || obtained > max) { setError('Invalid marks values.'); return; }
    setSaving(true); setError('');
    const grade_letter = form.grade_letter || calcGrade(obtained, max);
    const payload = { enrollment_id: form.enrollment_id, exam_type: form.exam_type, marks_obtained: obtained, max_marks: max, grade_letter };
    const { error: e } = modal.editing
      ? await supabase.from('grades').update(payload).eq('id', modal.editing.id)
      : await supabase.from('grades').insert(payload);
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false); setModal({ open: false, editing: null }); load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this grade record?')) return;
    await supabase.from('grades').delete().eq('id', id);
    load();
  }

  const filteredEnrollments = filterStudent ? enrollments.filter(e => e.student_id === filterStudent) : enrollments;
  const filteredEnrollmentIds = new Set(filteredEnrollments.map(e => e.id));
  const visible = filterStudent ? grades.filter(g => filteredEnrollmentIds.has(g.enrollment_id)) : grades;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select className="input w-56 appearance-none cursor-pointer" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.enrollment_number} - {s.first_name} {s.last_name}</option>)}
        </select>
        <div className="ml-auto">
          <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Grade</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Exam Type</th>
                  <th className="table-header">Marks</th>
                  <th className="table-header">Percentage</th>
                  <th className="table-header">Grade</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No grades found</td></tr>
                )}
                {visible.map(g => {
                  const pct = ((g.marks_obtained / g.max_marks) * 100).toFixed(1);
                  return (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <p className="font-medium text-gray-900">{g.enrollments?.students?.first_name} {g.enrollments?.students?.last_name}</p>
                        <p className="text-xs text-gray-400">{g.enrollments?.students?.enrollment_number}</p>
                      </td>
                      <td className="table-cell">
                        <p className="font-medium text-gray-900">{g.enrollments?.courses?.name}</p>
                        <p className="text-xs text-gray-400">{g.enrollments?.courses?.code}</p>
                      </td>
                      <td className="table-cell capitalize">{g.exam_type}</td>
                      <td className="table-cell font-mono">{g.marks_obtained}/{g.max_marks}</td>
                      <td className="table-cell">{pct}%</td>
                      <td className="table-cell">
                        <span className={`badge ${gradeColor(g.grade_letter)}`}>{g.grade_letter}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(g)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-500" /></button>
                          <button onClick={() => remove(g.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.editing ? 'Edit Grade' : 'Add Grade'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="label">Enrollment *</label>
                <select className="input" value={form.enrollment_id} onChange={e => setForm(p => ({ ...p, enrollment_id: e.target.value }))}>
                  <option value="">Select student enrollment</option>
                  {enrollments.map(e => (
                    <option key={e.id} value={e.id}>
                      {(e.students as any)?.first_name} {(e.students as any)?.last_name} — {(e.courses as any)?.code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Exam Type</label>
                <select className="input" value={form.exam_type} onChange={e => setForm(p => ({ ...p, exam_type: e.target.value }))}>
                  {examTypes.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Marks Obtained *</label>
                  <input className="input" type="number" min="0" value={form.marks_obtained} onChange={e => setForm(p => ({ ...p, marks_obtained: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Max Marks</label>
                  <input className="input" type="number" min="1" value={form.max_marks} onChange={e => setForm(p => ({ ...p, max_marks: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Grade Letter (auto-calculated if blank)</label>
                <input className="input" value={form.grade_letter} onChange={e => setForm(p => ({ ...p, grade_letter: e.target.value.toUpperCase() }))} placeholder="e.g. A+" maxLength={3} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setModal({ open: false, editing: null })}>Cancel</button>
              <button className="btn-primary flex-1" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
