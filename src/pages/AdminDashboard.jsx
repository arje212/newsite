import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Folder, Send, Plus, Pencil, Trash2, Save, X, Upload, AlertCircle, MessageCircle, ImageIcon, Mail, Briefcase, Layers, Milestone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AdminProjectChat from '../components/admin/AdminProjectChat';
import ProjectGalleryManager from '../components/admin/ProjectGalleryManager';
import DeliverableReviewsManager from '../components/admin/DeliverableReviewsManager';
import ContentManager from '../components/admin/ContentManager';
import { servicesConfig, portfolioConfig, roadmapConfig } from '../components/admin/contentConfigs';

/* ─── Shared helpers ─── */
const TABS = [
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'services', label: 'Services', icon: Layers },
  { id: 'roadmap', label: 'Roadmap', icon: Milestone },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'projects', label: 'Client Projects', icon: Folder },
  { id: 'accounts', label: 'Client Accounts', icon: Users },
  { id: 'contacts', label: 'Contact Inbox', icon: Mail },
  { id: 'deliverables', label: 'Deliverables', icon: Send },
  { id: 'changes', label: 'Change Requests', icon: AlertCircle },
  { id: 'reviews', label: 'Reviews', icon: MessageCircle },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
];

const PortfolioTab = () => <ContentManager {...portfolioConfig} />;
const ServicesTab = () => <ContentManager {...servicesConfig} />;
const RoadmapTab = () => <ContentManager {...roadmapConfig} />;

const statusBadge = (s, map) => {
  const cls = map[s] || 'bg-muted/40 text-muted-foreground';
  return <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${cls}`}>{s}</span>;
};

/* ─── Auth Guard ─── */
function useAdminGuard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return { user, loading, isAdmin: user?.role === 'admin' };
}

/* ─── Projects Tab ─── */
function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [creating, setCreating] = useState(false);

  useEffect(() => { api.entities.ClientProject.list('-created_date').then(setProjects); }, []);

  const blankForm = { client_name: '', client_email: '', project_title: '', description: '', category: 'Web', status: 'In Progress', progress_percent: 0, team_lead: '', start_date: '', target_date: '' };

  const openEdit = (p) => { setEditing(p.id); setForm(p); setCreating(false); };
  const openCreate = () => { setEditing(null); setForm(blankForm); setCreating(true); };
  const cancel = () => { setEditing(null); setCreating(false); };

  const save = async () => {
    if (creating) {
      const created = await api.entities.ClientProject.create(form);
      setProjects(ps => [created, ...ps]);
      // Notify client about new project
      if (form.client_email) {
        api.integrations.Core.SendEmail({
          to: form.client_email,
          subject: `🚀 New Project Created: ${form.project_title}`,
          body: `Hi ${form.client_name},\n\nGreat news! Your new project has been set up on the CodeCraft Client Portal.\n\n📁 Project: ${form.project_title}\n📂 Category: ${form.category}\n📊 Status: ${form.status}\n👤 Team Lead: ${form.team_lead || 'CodeCraft Team'}\n📅 Start Date: ${form.start_date || 'TBD'}\n📅 Target Date: ${form.target_date || 'TBD'}\n\nYou can track your project's progress in real-time by logging into the Client Portal.\n\nBest regards,\nThe CodeCraft Team`,
        });
      }
      toast.success('Project created. Email delivery requires SMTP configuration.');
    } else {
      const prev = projects.find(p => p.id === editing);
      const updated = await api.entities.ClientProject.update(editing, form);
      setProjects(ps => ps.map(p => p.id === editing ? updated : p));
      // Notify client if status changed
      if (prev?.status !== form.status && form.client_email) {
        api.integrations.Core.SendEmail({
          to: form.client_email,
          subject: `📊 Project Status Update: ${form.project_title}`,
          body: `Hi ${form.client_name},\n\nYour project status has been updated!\n\n📁 Project: ${form.project_title}\n🔄 Status: ${prev?.status} → ${form.status}\n📈 Progress: ${form.progress_percent || 0}%\n\nLog in to the Client Portal to view the latest details and milestones.\n\nBest regards,\nThe CodeCraft Team`,
        });
        toast.success('Project updated. Email delivery requires SMTP configuration.');
      } else {
        toast.success('Project updated!');
      }
    }
    cancel();
  };

  const remove = async (id) => {
    await api.entities.ClientProject.delete(id);
    setProjects(ps => ps.filter(p => p.id !== id));
    toast.success('Project deleted.');
  };

  const isOpen = creating || editing !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground">{projects.length} projects</p>
        <Button size="sm" onClick={openCreate} className="gap-1.5 text-xs font-mono"><Plus className="w-3.5 h-3.5" />New Project</Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <h4 className="font-heading font-bold text-sm text-foreground">{creating ? 'New Project' : 'Edit Project'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[['client_name','Client Name'],['client_email','Client Email'],['project_title','Project Title'],['team_lead','Team Lead'],['start_date','Start Date'],['target_date','Target Date']].map(([k,l]) => (
                  <div key={k}><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">{l}</label>
                    <Input value={form[k] || ''} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" /></div>
                ))}
                <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Category</label>
                  <select value={form.category || 'Web'} onChange={e => setForm(f => ({...f,category:e.target.value}))} className="w-full h-9 rounded-lg border border-border/40 bg-muted/20 text-sm font-mono text-foreground px-3">
                    {['Web','Robotics','Data','Research'].map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Status</label>
                  <select value={form.status || 'In Progress'} onChange={e => setForm(f => ({...f,status:e.target.value}))} className="w-full h-9 rounded-lg border border-border/40 bg-muted/20 text-sm font-mono text-foreground px-3">
                    {['Scoping','In Progress','Review','Completed','On Hold'].map(s => <option key={s}>{s}</option>)}</select></div>
                <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Progress %</label>
                  <Input type="number" min="0" max="100" value={form.progress_percent || 0} onChange={e => setForm(f => ({...f,progress_percent:Number(e.target.value)}))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" /></div>
              </div>
              <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Description</label>
                <Textarea value={form.description || ''} onChange={e => setForm(f => ({...f,description:e.target.value}))} rows={2} className="text-sm font-mono bg-muted/20 border-border/40 resize-none" /></div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={save} className="gap-1.5 text-xs font-mono"><Save className="w-3.5 h-3.5" />Save</Button>
                <Button size="sm" variant="outline" onClick={cancel} className="gap-1.5 text-xs font-mono"><X className="w-3.5 h-3.5" />Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/30">
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-sm text-foreground truncate">{p.project_title}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{p.client_name} · {p.client_email} · {p.category}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-primary">{p.progress_percent || 0}%</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted/40 text-muted-foreground">{p.status}</span>
              <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Deliverables Tab ─── */
function DeliverablesTab() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ project_id: '', client_email: '', title: '', description: '', file_url: '', file_type: 'PDF', version: 'v1.0', is_final: false });
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.entities.Deliverable.list('-created_date').then(setItems);
    api.entities.ClientProject.list().then(setProjects);
  }, []);

  const pickProject = (id) => {
    const p = projects.find(x => x.id === id);
    setForm(f => ({ ...f, project_id: id, client_email: p?.client_email || '' }));
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file, private: true });
      setForm(f => ({ ...f, file_url }));
      toast.success('File uploaded!');
    } catch (error) {
      toast.error(error.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const created = await api.entities.Deliverable.create(form);
    setItems(i => [created, ...i]);
    // Notify client about new deliverable
    const proj = projects.find(p => p.id === form.project_id);
    if (form.client_email && proj) {
      api.integrations.Core.SendEmail({
        to: form.client_email,
        subject: `📦 New Deliverable Ready: ${form.title}`,
        body: `Hi ${proj.client_name},\n\nA new deliverable has been uploaded for your project!\n\n📁 Project: ${proj.project_title}\n📄 Deliverable: ${form.title}\n🗂️ Type: ${form.file_type}\n🔖 Version: ${form.version}${form.is_final ? '\n✅ This is the FINAL version' : ''}\n\nLog in to the Client Portal to download your file.\n\nBest regards,\nThe CodeCraft Team`,
      });
    }
    setCreating(false);
    setForm({ project_id: '', client_email: '', title: '', description: '', file_url: '', file_type: 'PDF', version: 'v1.0', is_final: false });
    toast.success('Deliverable added.');
  };

  const remove = async (id) => {
    await api.entities.Deliverable.delete(id);
    setItems(i => i.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground">{items.length} deliverables</p>
        <Button size="sm" onClick={() => setCreating(s => !s)} className="gap-1.5 text-xs font-mono"><Plus className="w-3.5 h-3.5" />Add Deliverable</Button>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <h4 className="font-heading font-bold text-sm text-foreground">New Deliverable</h4>
              <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Project</label>
                <select value={form.project_id} onChange={e => pickProject(e.target.value)} className="w-full h-9 rounded-lg border border-border/40 bg-muted/20 text-sm font-mono text-foreground px-3">
                  <option value="">Select project…</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.project_title} — {p.client_name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Title</label>
                  <Input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" /></div>
                <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Version</label>
                  <Input value={form.version} onChange={e => setForm(f => ({...f,version:e.target.value}))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" /></div>
                <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">File Type</label>
                  <select value={form.file_type} onChange={e => setForm(f => ({...f,file_type:e.target.value}))} className="w-full h-9 rounded-lg border border-border/40 bg-muted/20 text-sm font-mono text-foreground px-3">
                    {['PDF','ZIP','Figma','Video','Spreadsheet','Other'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" id="final" checked={form.is_final} onChange={e => setForm(f => ({...f,is_final:e.target.checked}))} className="accent-primary" />
                  <label htmlFor="final" className="font-mono text-xs text-muted-foreground">Mark as Final</label>
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Upload File</label>
                <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/40 bg-muted/20 text-sm font-mono text-muted-foreground cursor-pointer hover:border-primary/30 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading…' : form.file_url ? 'File uploaded ✓' : 'Choose file…'}
                  <input type="file" className="hidden" onChange={handleFile} />
                </label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={save} disabled={!form.project_id || !form.title} className="gap-1.5 text-xs font-mono"><Save className="w-3.5 h-3.5" />Save</Button>
                <Button size="sm" variant="outline" onClick={() => setCreating(false)} className="gap-1.5 text-xs font-mono"><X className="w-3.5 h-3.5" />Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map(d => (
          <div key={d.id} className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/30">
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-sm text-foreground truncate">{d.title}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{d.file_type} · {d.version}{d.is_final ? ' · Final' : ''}</p>
            </div>
            <button onClick={() => remove(d.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Change Requests Tab ─── */
function ChangeRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [editNotes, setEditNotes] = useState({});

  useEffect(() => { api.entities.ChangeRequest.list('-created_date').then(setRequests); }, []);

  const updateCR = async (id, data) => {
    const prev = requests.find(r => r.id === id);
    const updated = await api.entities.ChangeRequest.update(id, data);
    setRequests(rs => rs.map(r => r.id === id ? updated : r));

    // Notify client if status changed or admin notes were added/updated
    const statusChanged = data.status && data.status !== prev?.status;
    const notesAdded = data.admin_notes && data.admin_notes !== prev?.admin_notes;

    if ((statusChanged || notesAdded) && prev?.client_email) {
      const cr = { ...prev, ...data };
      let subject = '';
      let body = '';
      if (statusChanged && notesAdded) {
        subject = `🔄 Change Request Update: ${cr.title}`;
        body = `Hi ${cr.client_name},\n\nYour change request has been updated!\n\n📋 Request: ${cr.title}\n🔄 New Status: ${cr.status}\n💬 Team Note: ${cr.admin_notes}\n\nLog in to the Client Portal to view details.\n\nBest regards,\nThe CodeCraft Team`;
      } else if (statusChanged) {
        subject = `🔄 Change Request Status Update: ${cr.title}`;
        body = `Hi ${cr.client_name},\n\nThe status of your change request has been updated.\n\n📋 Request: ${cr.title}\n🔄 Status: ${prev?.status} → ${cr.status}\n\nLog in to the Client Portal to view details.\n\nBest regards,\nThe CodeCraft Team`;
      } else if (notesAdded) {
        subject = `💬 Team Response on: ${cr.title}`;
        body = `Hi ${cr.client_name},\n\nThe CodeCraft team has responded to your change request.\n\n📋 Request: ${cr.title}\n📊 Current Status: ${cr.status}\n💬 Team Note: ${cr.admin_notes}\n\nLog in to the Client Portal to view details.\n\nBest regards,\nThe CodeCraft Team`;
      }
      api.integrations.Core.SendEmail({ to: prev.client_email, subject, body });
    }

    toast.success('Update saved.');
  };

  const crStatusColors = { 'Submitted': 'bg-muted/40 text-muted-foreground', 'Under Review': 'bg-amber-700/10 text-amber-800', 'Approved': 'bg-primary/10 text-primary', 'Rejected': 'bg-destructive/10 text-destructive', 'Implemented': 'bg-emerald-700/10 text-emerald-800' };

  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-muted-foreground">{requests.length} requests</p>
      {requests.map(cr => (
        <div key={cr.id} className="p-5 rounded-xl border border-border/40 bg-card/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-heading font-bold text-sm text-foreground">{cr.title}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{cr.client_name} · {cr.client_email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${crStatusColors[cr.priority] || 'bg-muted/40 text-muted-foreground'}`}>{cr.priority}</span>
              <select value={cr.status} onChange={e => updateCR(cr.id, { status: e.target.value })}
                className="h-7 rounded border border-border/40 bg-muted/20 text-[10px] font-mono text-foreground px-2">
                {['Submitted','Under Review','Approved','Rejected','Implemented'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">{cr.description}</p>
          <div className="flex gap-2">
            <Input placeholder="Add team response note…" value={editNotes[cr.id] ?? (cr.admin_notes || '')} onChange={e => setEditNotes(n => ({...n,[cr.id]:e.target.value}))} className="h-8 text-xs font-mono bg-muted/20 border-border/40 flex-1" />
            <Button size="sm" onClick={() => updateCR(cr.id, { admin_notes: editNotes[cr.id] })} className="h-8 text-xs font-mono px-3"><Save className="w-3 h-3" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Team Members Tab ─── */
function TeamTab() {
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { api.entities.TeamMember.list('sort_order').then(setMembers); }, []);

  const blank = { name: '', role: '', location: '', about: '', specialties: [], skills: [], photo_url: '', portfolio_url: '', sort_order: 0 };
  const openEdit = (m) => { setEditing(m.id); setForm(m); setCreating(false); };
  const openCreate = () => { setEditing(null); setForm(blank); setCreating(true); };
  const cancel = () => { setEditing(null); setCreating(false); };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, photo_url: file_url }));
      toast.success('Photo uploaded!');
    } catch (error) {
      toast.error(error.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const data = { ...form, specialties: typeof form.specialties === 'string' ? form.specialties.split(',').map(s => s.trim()) : form.specialties, skills: typeof form.skills === 'string' ? form.skills.split(',').map(s => s.trim()) : form.skills };
    if (creating) {
      const created = await api.entities.TeamMember.create(data);
      setMembers(ms => [...ms, created].sort((a,b) => a.sort_order - b.sort_order));
      toast.success('Member added!');
    } else {
      const updated = await api.entities.TeamMember.update(editing, data);
      setMembers(ms => ms.map(m => m.id === editing ? updated : m));
      toast.success('Member updated!');
    }
    cancel();
  };

  const remove = async (id) => {
    await api.entities.TeamMember.delete(id);
    setMembers(ms => ms.filter(m => m.id !== id));
  };

  const isOpen = creating || editing !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground">{members.length} members</p>
        <Button size="sm" onClick={openCreate} className="gap-1.5 text-xs font-mono"><Plus className="w-3.5 h-3.5" />Add Member</Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <h4 className="font-heading font-bold text-sm text-foreground">{creating ? 'New Member' : 'Edit Member'}</h4>
              {/* Photo upload */}
              <div className="flex items-center gap-4">
                {form.photo_url ? <img src={form.photo_url} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-primary/30" /> : <div className="w-16 h-16 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-mono">No photo</div>}
                <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/40 bg-muted/20 text-sm font-mono text-muted-foreground cursor-pointer hover:border-primary/30 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading…' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[['name','Full Name'],['role','Role'],['location','Location'],['portfolio_url','Portfolio URL']].map(([k,l]) => (
                  <div key={k}><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">{l}</label>
                    <Input value={form[k] || ''} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" /></div>
                ))}
                <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Sort Order</label>
                  <Input type="number" value={form.sort_order || 0} onChange={e => setForm(f => ({...f,sort_order:Number(e.target.value)}))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" /></div>
              </div>
              <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">About</label>
                <Textarea value={form.about || ''} onChange={e => setForm(f => ({...f,about:e.target.value}))} rows={2} className="text-sm font-mono bg-muted/20 border-border/40 resize-none" /></div>
              <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Specialties (comma-separated)</label>
                <Input value={Array.isArray(form.specialties) ? form.specialties.join(', ') : form.specialties || ''} onChange={e => setForm(f => ({...f,specialties:e.target.value}))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" /></div>
              <div><label className="font-mono text-[10px] text-muted-foreground mb-1 block uppercase">Skills (comma-separated)</label>
                <Input value={Array.isArray(form.skills) ? form.skills.join(', ') : form.skills || ''} onChange={e => setForm(f => ({...f,skills:e.target.value}))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" /></div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={save} className="gap-1.5 text-xs font-mono"><Save className="w-3.5 h-3.5" />Save</Button>
                <Button size="sm" variant="outline" onClick={cancel} className="gap-1.5 text-xs font-mono"><X className="w-3.5 h-3.5" />Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/30">
            {m.photo_url ? <img src={m.photo_url} alt={m.name} className="w-12 h-12 rounded-xl object-cover border border-border/40 shrink-0" /> : <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/20 flex items-center justify-center font-heading font-bold text-primary text-sm shrink-0">{m.name?.split(' ').filter((_,i,a) => i===0||i===a.length-1).map(n=>n[0]).join('')}</div>}
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-sm text-foreground truncate">{m.name}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{m.role}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Gallery Tab ─── */
function GalleryTab() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.entities.ClientProject.list('-created_date').then(ps => {
      setProjects(ps);
      if (ps.length) setSelected(ps[0]);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Select Project</p>
        {projects.map(p => (
          <button key={p.id} onClick={() => setSelected(p)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${selected?.id === p.id ? 'border-primary/50 bg-primary/5' : 'border-border/40 bg-card/30 hover:border-primary/20'}`}>
            <p className="font-heading font-semibold text-xs text-foreground truncate">{p.project_title}</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{p.client_name}</p>
          </button>
        ))}
      </div>
      <div className="lg:col-span-2 p-5 rounded-xl border border-border/40 bg-card/30">
        <ProjectGalleryManager project={selected} />
      </div>
    </div>
  );
}

/* ─── Messages Tab ─── */
function MessagesTab({ user }) {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.entities.ClientProject.list('-created_date').then(ps => {
      setProjects(ps);
      if (ps.length) setSelected(ps[0]);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Select Project</p>
        {projects.map(p => (
          <button key={p.id} onClick={() => setSelected(p)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${selected?.id === p.id ? 'border-accent/50 bg-accent/5' : 'border-border/40 bg-card/30 hover:border-accent/20'}`}>
            <p className="font-heading font-semibold text-xs text-foreground truncate">{p.project_title}</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{p.client_name}</p>
          </button>
        ))}
      </div>
      <div className="lg:col-span-2 p-5 rounded-xl border border-border/40 bg-card/30">
        <AdminProjectChat project={selected} user={user} />
      </div>
    </div>
  );
}


/* ─── Client Accounts Tab ─── */
function AccountsTab() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.users.list().then(setAccounts).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, []);

  const createAccount = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const account = await api.users.invite(form);
      setAccounts((items) => [account, ...items]);
      setForm({ full_name: '', email: '', password: '' });
      toast.success('Client account created. Share the sign-in details securely with the client.');
    } catch (error) {
      toast.error(error.message || 'Could not create client account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg font-semibold text-foreground">Create client access</h3>
        <p className="text-sm text-muted-foreground mt-1">Create a separate sign-in for each client. Use a unique temporary password and share it privately.</p>
      </div>
      <form onSubmit={createAccount} className="grid gap-3 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
        <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Client name</label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Client full name" /></div>
        <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email address</label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@company.com" /></div>
        <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Temporary password</label><Input required type="password" minLength={12} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 12 characters" /></div>
        <div className="flex items-end"><Button disabled={saving} type="submit" className="w-full md:w-auto">{saving ? 'Creating…' : 'Create client account'}</Button></div>
      </form>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4"><h4 className="font-heading font-semibold">Accounts</h4><span className="text-xs text-muted-foreground">{accounts.length} total</span></div>
        {loading ? <p className="p-5 text-sm text-muted-foreground">Loading accounts…</p> : accounts.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No accounts found.</p> : accounts.map((account) => <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-3 last:border-0"><div><p className="text-sm font-medium text-foreground">{account.full_name}</p><p className="text-xs text-muted-foreground">{account.email}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground">{account.role}</span></div>)}
      </div>
    </div>
  );
}


/* ─── Contact Inbox Tab ─── */
function ContactsTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.contact.list().then(setMessages).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, []);
  if (loading) return <p className="text-sm text-muted-foreground">Loading messages…</p>;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h3 className="font-heading text-lg font-semibold">Contact messages</h3><span className="text-xs text-muted-foreground">{messages.length} messages</span></div>
      {messages.length === 0 ? <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Your inbox is clear.</div> : messages.map((message) => (
        <article key={message.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="font-semibold text-foreground">{message.name}</h4><a className="text-xs text-primary hover:underline" href={`mailto:${message.email}`}>{message.email}</a></div><time className="text-xs text-muted-foreground">{new Date(message.created_date).toLocaleString()}</time></div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{message.message}</p>
        </article>
      ))}
    </div>
  );
}

/* ─── Main Admin Dashboard ─── */
export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAdminGuard();
  const [activeTab, setActiveTab] = useState('portfolio');

  if (loading) return (
    <div className="pt-28 flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return (
    <div className="pt-28 pb-24 px-6 flex items-center justify-center min-h-screen">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-destructive/50 mx-auto mb-4" />
        <h2 className="font-heading font-bold text-xl text-foreground mb-2">Access Denied</h2>
        <p className="font-mono text-sm text-muted-foreground">This page is restricted to admin users only.</p>
      </div>
    </div>
  );

  const isMessages = activeTab === 'messages';
  const isGallery = activeTab === 'gallery';
  const isReviews = activeTab === 'reviews';
  const TabContent = { portfolio: PortfolioTab, services: ServicesTab, roadmap: RoadmapTab, projects: ProjectsTab, deliverables: DeliverablesTab, changes: ChangeRequestsTab, team: TeamTab, accounts: AccountsTab, contacts: ContactsTab }[activeTab];

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-3 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 inline-block">Admin Dashboard</span>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-3">Site Control Panel</h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">Logged in as <span className="text-foreground">{user?.full_name}</span> · {user?.email}</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 flex-wrap border-b border-border/30 mb-8">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs border-b-2 -mb-px transition-all duration-200 ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {isMessages ? <MessagesTab user={user} /> : isGallery ? <GalleryTab /> : isReviews ? <DeliverableReviewsManager /> : <TabContent />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}