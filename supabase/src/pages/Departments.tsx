import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Department } from '../types';
import { Plus, Pencil, Trash2, Building2, AlertCircle, X } from 'lucide-react';

const empty: Omit<Department, 'id' | 'created_at'> = {
  name: '', code: '', head_name: '', established_year: new Date().getFullYear(),
};

export default function Departments() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Department | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await supabase.from('departments').select('*').order('name');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ ...empty });
    setError('');
    setModal({ open: true, editing: null });
  }

  function openEdit(d: Department) {
    setForm({ name: d.name, code: d.code, head_name: d.head_name, established_year: d.established_year });
    setError('');
    setModal({ open: true, editing: d });
  }

  async function save() {
    if (!form.name.trim() || !form.code.trim()) { setError('Name and code are required.'); return; }
    setSaving(true);
    setError('');
    if (modal.editing) {
      const { error: e } = await supabase.from('departments').update(form).eq('id', modal.editing.id);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from('departments').insert(form);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSaving(false);
    setModal({ open: false, editing: null });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this department? Courses and faculty linked to it will be unlinked.')) return;
    await supabase.from('departments').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div />
        <button className="btn-primary" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-gray-400">
          <Building2 className="w-12 h-12 mb-3" />
          <p className="font-medium">No departments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(d => (
            <div key={d.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {d.code}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-500">Est. {d.established_year}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => remove(d.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              {d.head_name && (
                <p className="mt-3 text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <span className="font-medium text-gray-700">HOD:</span> {d.head_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.editing ? 'Edit Department' : 'Add Department'}</h2>
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
                <label className="label">Department Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="label">Code *</label>
                <input className="input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. CSE" maxLength={10} />
              </div>
              <div>
                <label className="label">Head of Department</label>
                <input className="input" value={form.head_name} onChange={e => setForm(p => ({ ...p, head_name: e.target.value }))} placeholder="Dr. Name" />
              </div>
              <div>
                <label className="label">Established Year</label>
                <input className="input" type="number" value={form.established_year} onChange={e => setForm(p => ({ ...p, established_year: parseInt(e.target.value) || 2000 }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setModal({ open: false, editing: null })}>Cancel</button>
              <button className="btn-primary flex-1" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
