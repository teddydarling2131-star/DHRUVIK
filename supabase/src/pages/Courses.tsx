import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Course, Department } from '../types';
import { Plus, Pencil, Trash2, BookOpen, AlertCircle, X, ChevronDown } from 'lucide-react';

const empty = { name: '', code: '', department_id: '', credits: 3, semester: 1, description: '' };

export default function Courses() {
  const [items, setItems] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing: Course | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from('courses').select('*, departments(*)').order('code'),
      supabase.from('departments').select('*').order('name'),
    ]);
    setItems(c ?? []);
    setDepartments(d ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...empty }); setError(''); setModal({ open: true, editing: null }); }
  function openEdit(c: Course) {
    setForm({ name: c.name, code: c.code, department_id: c.department_id ?? '', credits: c.credits, semester: c.semester, description: c.description });
    setError('');
    setModal({ open: true, editing: c });
  }

  async function save() {
    if (!form.name.trim() || !form.code.trim()) { setError('Name and code are required.'); return; }
    setSaving(true); setError('');
    const payload = { ...form, department_id: form.department_id || null };
    const { error: e } = modal.editing
      ? await supabase.from('courses').update(payload).eq('id', modal.editing.id)
      : await supabase.from('courses').insert(payload);
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false);
    setModal({ open: false, editing: null });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this course?')) return;
    await supabase.from('courses').delete().eq('id', id);
    load();
  }

  const visible = filterDept ? items.filter(c => c.department_id === filterDept) : items;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="relative">
          <select
            className="input pr-8 appearance-none cursor-pointer w-48"
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Code</th>
                <th className="table-header">Course Name</th>
                <th className="table-header">Department</th>
                <th className="table-header">Semester</th>
                <th className="table-header">Credits</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No courses found</td></tr>
              )}
              {visible.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <span className="font-mono text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">{c.code}</span>
                  </td>
                  <td className="table-cell font-medium text-gray-900">{c.name}</td>
                  <td className="table-cell text-gray-500">{(c.departments as any)?.code ?? '—'}</td>
                  <td className="table-cell">Sem {c.semester}</td>
                  <td className="table-cell">{c.credits} cr</td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => remove(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.editing ? 'Edit Course' : 'Add Course'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="label">Course Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Data Structures" />
              </div>
              <div>
                <label className="label">Course Code *</label>
                <input className="input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. CS201" />
              </div>
              <div>
                <label className="label">Department</label>
                <select className="input" value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
                  <label className="label">Credits</label>
                  <input className="input" type="number" min={1} max={6} value={form.credits} onChange={e => setForm(p => ({ ...p, credits: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief course description..." />
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
