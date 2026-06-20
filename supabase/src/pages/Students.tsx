import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Student, Department } from '../types';
import { Plus, Pencil, Trash2, GraduationCap, AlertCircle, X, Mail, Phone, Hash } from 'lucide-react';

const empty = {
  first_name: '', last_name: '', email: '', phone: '', enrollment_number: '',
  department_id: '', gender: 'male', date_of_birth: '', address: '',
  semester: 1, batch_year: new Date().getFullYear(), status: 'active',
};

export default function Students() {
  const [items, setItems] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing: Student | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [{ data: s }, { data: d }] = await Promise.all([
      supabase.from('students').select('*, departments(*)').order('first_name'),
      supabase.from('departments').select('*').order('name'),
    ]);
    setItems(s ?? []);
    setDepartments(d ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...empty }); setError(''); setModal({ open: true, editing: null }); }
  function openEdit(s: Student) {
    setForm({
      first_name: s.first_name, last_name: s.last_name, email: s.email, phone: s.phone,
      enrollment_number: s.enrollment_number, department_id: s.department_id ?? '',
      gender: s.gender, date_of_birth: s.date_of_birth ?? '', address: s.address,
      semester: s.semester, batch_year: s.batch_year, status: s.status,
    });
    setError('');
    setModal({ open: true, editing: s });
  }

  async function save() {
    if (!form.first_name.trim() || !form.email.trim() || !form.enrollment_number.trim()) {
      setError('First name, email and enrollment number are required.'); return;
    }
    setSaving(true); setError('');
    const payload = { ...form, department_id: form.department_id || null, date_of_birth: form.date_of_birth || null };
    const { error: e } = modal.editing
      ? await supabase.from('students').update(payload).eq('id', modal.editing.id)
      : await supabase.from('students').insert(payload);
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false); setModal({ open: false, editing: null }); load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this student? Their enrollments and records will also be deleted.')) return;
    await supabase.from('students').delete().eq('id', id);
    load();
  }

  const visible = items.filter(s => {
    if (filterDept && s.department_id !== filterDept) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${s.first_name} ${s.last_name} ${s.enrollment_number} ${s.email}`.toLowerCase().includes(q);
    }
    return true;
  });

  const statusColor = (st: string) =>
    st === 'active' ? 'bg-green-100 text-green-700' : st === 'graduated' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input className="input w-56" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-44 appearance-none cursor-pointer" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
        </select>
        <select className="input w-36 appearance-none cursor-pointer" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="graduated">Graduated</option>
          <option value="dropped">Dropped</option>
        </select>
        <div className="ml-auto">
          <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Student</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">{visible.length} student{visible.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="table-header">Enrollment No.</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Semester</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Batch</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No students found</td></tr>
                )}
                {visible.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-xs">{s.enrollment_number}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {s.first_name[0]}
                        </div>
                        <span className="font-medium text-gray-900">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">{(s.departments as any)?.code ?? '—'}</td>
                    <td className="table-cell">Sem {s.semester}</td>
                    <td className="table-cell text-gray-500">{s.email}</td>
                    <td className="table-cell">{s.batch_year}</td>
                    <td className="table-cell">
                      <span className={`badge ${statusColor(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-500" /></button>
                        <button onClick={() => remove(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.editing ? 'Edit Student' : 'Add Student'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name *</label>
                  <input className="input" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input className="input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Enrollment Number *</label>
                <input className="input" value={form.enrollment_number} onChange={e => setForm(p => ({ ...p, enrollment_number: e.target.value }))} placeholder="STU2024001" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
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
                  <label className="label">Batch Year</label>
                  <input className="input" type="number" value={form.batch_year} onChange={e => setForm(p => ({ ...p, batch_year: parseInt(e.target.value) || 2024 }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input className="input" type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <textarea className="input h-16 resize-none" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="dropped">Dropped</option>
                </select>
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
