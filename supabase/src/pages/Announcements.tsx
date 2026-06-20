import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Announcement } from '../types';
import { Plus, Pencil, Trash2, Megaphone, AlertCircle, X } from 'lucide-react';

const empty = { title: '', content: '', audience: 'all', created_by: 'Admin' };

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Announcement | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...empty }); setError(''); setModal({ open: true, editing: null }); }
  function openEdit(a: Announcement) {
    setForm({ title: a.title, content: a.content, audience: a.audience, created_by: a.created_by });
    setError('');
    setModal({ open: true, editing: a });
  }

  async function save() {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return; }
    setSaving(true); setError('');
    const { error: e } = modal.editing
      ? await supabase.from('announcements').update(form).eq('id', modal.editing.id)
      : await supabase.from('announcements').insert(form);
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false); setModal({ open: false, editing: null }); load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    load();
  }

  const audienceColor = (a: string) =>
    a === 'all' ? 'bg-blue-100 text-blue-700' : a === 'students' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> New Announcement</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-gray-400">
          <Megaphone className="w-12 h-12 mb-3" />
          <p>No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(a => (
            <div key={a.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <span className={`badge ${audienceColor(a.audience)}`}>For: {a.audience}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>·</span>
                    <span>by {a.created_by}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-500" /></button>
                  <button onClick={() => remove(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.editing ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title..." />
              </div>
              <div>
                <label className="label">Content *</label>
                <textarea className="input h-28 resize-none" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Announcement details..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Audience</label>
                  <select className="input" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}>
                    <option value="all">All (Students & Faculty)</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
                <div>
                  <label className="label">Posted By</label>
                  <input className="input" value={form.created_by} onChange={e => setForm(p => ({ ...p, created_by: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setModal({ open: false, editing: null })}>Cancel</button>
              <button className="btn-primary flex-1" onClick={save} disabled={saving}>{saving ? 'Publishing...' : 'Publish'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
