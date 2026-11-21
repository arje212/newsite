import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const labelCls = 'font-mono text-[10px] text-muted-foreground mb-1 block uppercase';
const inputCls = 'h-9 text-sm font-mono bg-muted/20 border-border/40';
const selectCls = 'h-9 w-full rounded-md px-3 text-sm font-mono bg-muted/20 border border-border/40 text-foreground';

/* Editable list of small objects, e.g. [{ name, duration, status, desc }] */
function ListEditor({ label, value, onChange, itemFields }) {
  const rows = Array.isArray(value) ? value : [];
  const blank = Object.fromEntries(itemFields.map((f) => [f.key, f.options ? f.options[0] : '']));
  const setRow = (i, key, v) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  return (
    <div className="rounded-lg border border-border/40 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className={labelCls + ' mb-0'}>{label}</span>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...rows, blank])} className="h-7 gap-1 text-[11px] font-mono"><Plus className="w-3 h-3" />Add</Button>
      </div>
      {rows.length === 0 && <p className="font-mono text-[11px] text-muted-foreground">Nothing added yet.</p>}
      {rows.map((row, i) => (
        <div key={i} className="grid gap-2 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))_auto] items-start rounded-md bg-muted/10 p-2">
          {itemFields.map((f) => f.options ? (
            <select key={f.key} value={row[f.key] || f.options[0]} onChange={(e) => setRow(i, f.key, e.target.value)} className={selectCls} aria-label={f.label}>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <Input key={f.key} value={row[f.key] || ''} placeholder={f.label} aria-label={f.label} onChange={(e) => setRow(i, f.key, e.target.value)} className={inputCls} />
          ))}
          <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}

const toFormValue = (field, value) => {
  if (field.type === 'tags') return Array.isArray(value) ? value.join(', ') : '';
  if (field.type === 'boolean') return value !== false;
  if (field.type === 'groups') return value && typeof value === 'object' ? value : {};
  return value ?? '';
};
const fromFormValue = (field, value) => {
  if (field.type === 'tags') return String(value || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (field.type === 'number') return Number(value || 0);
  if (field.type === 'groups') {
    const out = {};
    field.groups.forEach((g) => { out[g.key] = (value?.[g.key] || []).filter((row) => Object.values(row).some((v) => String(v || '').trim())); });
    return out;
  }
  return value;
};

/**
 * Generic admin CRUD screen for a content table.
 * props: entity, noun, fields[], sort, rowTitle(item), rowSub(item), rowImage(item)
 */
export default function ContentManager({ entity, noun, fields, sort = 'sort_order', rowTitle, rowSub, rowImage }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

  const load = () => api.entities[entity].list(sort).then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [entity]);

  const blank = () => Object.fromEntries(fields.map((f) => [f.key, toFormValue(f, f.default)]));
  const openCreate = () => { setEditingId(null); setForm(blank()); setCreating(true); };
  const openEdit = (item) => { setCreating(false); setEditingId(item.id); setForm(Object.fromEntries(fields.map((f) => [f.key, toFormValue(f, item[f.key])]))); };
  const close = () => { setCreating(false); setEditingId(null); };
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const upload = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      set(key, file_url);
      toast.success('Image uploaded.');
    } catch (e) { toast.error(e.message || 'Upload failed.'); }
    finally { setUploadingKey(null); }
  };

  const save = async () => {
    const missing = fields.find((f) => f.required && !String(form[f.key] ?? '').trim());
    if (missing) { toast.error(`${missing.label} is required.`); return; }
    const payload = Object.fromEntries(fields.map((f) => [f.key, fromFormValue(f, form[f.key])]));
    setSaving(true);
    try {
      if (creating) await api.entities[entity].create(payload);
      else await api.entities[entity].update(editingId, payload);
      toast.success(creating ? `${noun} added.` : `${noun} updated.`);
      close();
      await load();
    } catch (e) { toast.error(e.message || 'Could not save.'); }
    finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete this ${noun.toLowerCase()}? This cannot be undone.`)) return;
    try { await api.entities[entity].delete(item.id); setItems((rows) => rows.filter((r) => r.id !== item.id)); toast.success(`${noun} deleted.`); }
    catch (e) { toast.error(e.message || 'Could not delete.'); }
  };

  const renderField = (f) => {
    const value = form[f.key];
    const wrap = (child) => <div key={f.key} className={f.wide || ['textarea', 'tags', 'image', 'groups'].includes(f.type) ? 'md:col-span-2' : ''}>{f.type !== 'boolean' && <label className={labelCls}>{f.label}{f.required && ' *'}</label>}{child}{f.help && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{f.help}</p>}</div>;
    switch (f.type) {
      case 'textarea': return wrap(<Textarea value={value || ''} rows={f.rows || 3} onChange={(e) => set(f.key, e.target.value)} className="text-sm font-mono bg-muted/20 border-border/40 resize-y" />);
      case 'number': return wrap(<Input type="number" value={value ?? 0} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />);
      case 'select': return wrap(<select value={value || f.options[0]} onChange={(e) => set(f.key, e.target.value)} className={selectCls}>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>);
      case 'tags': return wrap(<Input value={value || ''} onChange={(e) => set(f.key, e.target.value)} placeholder="comma, separated, values" className={inputCls} />);
      case 'boolean': return (
        <label key={f.key} className="flex items-center gap-2 font-mono text-xs text-foreground md:col-span-2">
          <input type="checkbox" checked={value !== false} onChange={(e) => set(f.key, e.target.checked)} />{f.label}
        </label>
      );
      case 'image': return wrap(
        <div className="flex flex-wrap items-center gap-3">
          {value ? <img src={value} alt="preview" className="w-20 h-14 rounded-lg object-cover border border-border/40" /> : <div className="w-20 h-14 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-center text-muted-foreground text-[10px] font-mono">No image</div>}
          <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/40 bg-muted/20 text-xs font-mono text-muted-foreground cursor-pointer hover:border-primary/30 transition-colors">
            <Upload className="w-3.5 h-3.5" />{uploadingKey === f.key ? 'Uploading…' : 'Upload'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(f.key, e.target.files?.[0])} />
          </label>
          <Input value={value || ''} onChange={(e) => set(f.key, e.target.value)} placeholder="…or paste an image URL" className={inputCls + ' flex-1 min-w-[200px]'} />
        </div>
      );
      case 'groups': return wrap(
        <div className="space-y-3">{f.groups.map((g) => <ListEditor key={g.key} label={g.label} itemFields={g.itemFields} value={value?.[g.key]} onChange={(rows) => set(f.key, { ...(value || {}), [g.key]: rows })} />)}</div>
      );
      default: return wrap(<Input value={value || ''} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />);
    }
  };

  const isOpen = creating || editingId !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground">{items.length} {noun.toLowerCase()}{items.length === 1 ? '' : 's'}</p>
        <Button size="sm" onClick={openCreate} className="gap-1.5 text-xs font-mono"><Plus className="w-3.5 h-3.5" />Add {noun}</Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <h4 className="font-heading font-bold text-sm text-foreground">{creating ? `New ${noun}` : `Edit ${noun}`}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{fields.map(renderField)}</div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" disabled={saving} onClick={save} className="gap-1.5 text-xs font-mono"><Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save'}</Button>
                <Button size="sm" variant="outline" onClick={close} className="gap-1.5 text-xs font-mono"><X className="w-3.5 h-3.5" />Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <p className="font-mono text-xs text-muted-foreground">Loading…</p> : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center font-mono text-sm text-muted-foreground">No {noun.toLowerCase()}s yet. Click “Add {noun}” to create the first one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/30">
              {rowImage && (rowImage(item) ? <img src={rowImage(item)} alt="" className="w-14 h-12 rounded-lg object-cover border border-border/40 shrink-0" /> : <div className="w-14 h-12 rounded-lg bg-muted/30 border border-border/40 shrink-0" />)}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm text-foreground truncate">{rowTitle(item)}</p>
                <p className="font-mono text-[10px] text-muted-foreground truncate">{rowSub?.(item)}{item.is_published === false ? ' · Hidden' : ''}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(item)} aria-label="Edit" className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(item)} aria-label="Delete" className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
