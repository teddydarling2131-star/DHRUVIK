import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Faculty, Department } from '../types';
import { Plus, Pencil, Trash2, Users, AlertCircle, X, Mail, Phone, Badge } from 'lucide-react';

const empty = {
  first_name: '', last_name: '', email: '', phone: '', employee_id: '',
  department_id: '', designation: 'Lecturer', qualification: '', joining_date: '', status: 'active',
};

const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Faculty'];

export default function FacultyPage() {
  const [items, setItems] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing: Faculty | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [{ data: f }, { data: d }] = await Promise.all([
      supabase.from('faculty').select('*, departments(*)').order('first_name'),
      supabase.from('departments').select('*').order('name'),
    ]);
    setItems(f ?? []);
    setDepartments(d ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...empty }); setError(''); setModal({ open: true, editing: null }); }
  function openEdit(f: Faculty) {
    setForm({
      first_name: f.first_name, last_name: f.last_name, email: f.email, phone: f.phone,
      employee_id: f.employee_id, department_id: f.department_id ?? '', designation: f.designation,
      qualification: f.qualification, joining_date: f.joining_date ?? '', status: f.status,
    });
    setError('');
    setModal({ open: true, editing: f });
  }

  async function save() {
    if (!form.first_name.trim() || !form.email.trim() || !form.employee_id.trim()) {
      setError('First name, email, and employee ID are required.');
      return;
    }
    setSaving(true); setError('');
    const payload = { ...form, department_id: form.department_id || null, joining_date: form.joining_date || null };
    const { error: e } = modal.editing
      ? await supabase.from('faculty').update(payload).eq('id', modal.editing.id)
      : await supabase.from('faculty').insert(payload);
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false);
    setModal({ open: false, editing: null });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this faculty member?')) return;
    await supabase.from('faculty').delete().eq('id', id);
    load();
  }

  const visible = filterDept ? items.filter(f => f.department_id === filterDept) : items;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="relative">
          <select className="input w-48 appearance-none cursor-pointer" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Faculty</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.length === 0 && (
            <div className="col-span-full card flex flex-col items-center py-16 text-gray-400">
              <Users className="w-12 h-12 mb-3" />
              <p>No faculty found</p>
            </div>
          )}
          {visible.map(f => (
            <div key={f.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {f.first_name[0]}{f.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{f.first_name} {f.last_name}</p>
                    <p className="text-xs text-primary-600">{f.designation}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(f)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-500" /></button>
                  <button onClick={() => remove(f.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Badge className="w-3.5 h-3.5" /> {f.employee_id}</div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {f.email}</div>
                {f.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {f.phone}</div>}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">{(f.departments as any)?.name ?? '—'}</span>
                <span className={`badge ${f.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {f.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.editing ? 'Edit Faculty' : 'Add Faculty'}</h2>
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
                  <label className="label">Last Name *</label>
                  <input className="input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Employee ID *</label>
                <input className="input" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))} placeholder="EMP001" />
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
              <div>
                <label className="label">Designation</label>
                <select className="input" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))}>
                  {designations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Qualification</label>
                <input className="input" value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} placeholder="e.g. PhD Computer Science" />
              </div>
              <div>
                <label className="label">Joining Date</label>
                <input className="input" type="date" value={form.joining_date} onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
