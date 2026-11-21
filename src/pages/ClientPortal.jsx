import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Download, Send, CheckCircle2, Clock, AlertCircle, Plus, X, FileText, Zap, MessageCircle, ImageIcon } from 'lucide-react';
import ProjectChat from '../components/portal/ProjectChat';
import ProjectGallery from '../components/portal/ProjectGallery';
import DeliverableReviewPanel from '../components/portal/DeliverableReviewPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  'Scoping':     { color: 'text-muted-foreground', bg: 'bg-muted/40 border-border/40', bar: 'bg-muted-foreground' },
  'In Progress': { color: 'text-accent', bg: 'bg-accent/10 border-accent/30', bar: 'bg-accent' },
  'Review':      { color: 'text-amber-800', bg: 'bg-amber-700/10 border-amber-700/30', bar: 'bg-amber-700' },
  'Completed':   { color: 'text-primary', bg: 'bg-primary/10 border-primary/30', bar: 'bg-primary' },
  'On Hold':     { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', bar: 'bg-destructive' },
};

const priorityColor = {
  Low: 'text-muted-foreground border-border/40',
  Medium: 'text-amber-800 border-amber-700/30',
  High: 'text-accent border-accent/40',
  Critical: 'text-destructive border-destructive/40',
};

const crStatusColor = {
  'Submitted':    'bg-muted/40 text-muted-foreground',
  'Under Review': 'bg-amber-700/10 text-amber-800',
  'Approved':     'bg-primary/10 text-primary',
  'Rejected':     'bg-destructive/10 text-destructive',
  'Implemented':  'bg-emerald-700/10 text-emerald-800',
};

function ProjectCard({ project, onSelect, selected }) {
  const cfg = statusConfig[project.status] || statusConfig['In Progress'];
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(project)}
      className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${selected ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card/30 hover:border-primary/20'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-heading font-bold text-foreground text-sm">{project.project_title}</h3>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">{project.category} · Lead: {project.team_lead || 'CodeCraft Team'}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${cfg.bg} ${cfg.color} shrink-0`}>{project.status}</span>
      </div>
      <div className="w-full bg-muted/30 rounded-full h-1.5 mb-1">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${project.progress_percent || 0}%` }} />
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">{project.progress_percent || 0}% complete</p>
    </motion.button>
  );
}

function MilestoneTimeline({ milestones }) {
  if (!milestones?.length) return <p className="font-mono text-xs text-muted-foreground">No milestones added yet.</p>;
  return (
    <div className="space-y-3">
      {milestones.map((m, i) => (
        <div key={i} className="flex items-center gap-3">
          {m.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> : m.status === 'active' ? <Clock className="w-4 h-4 text-accent shrink-0 animate-pulse" /> : <div className="w-4 h-4 rounded-full border border-border/50 shrink-0" />}
          <div className="flex-1">
            <p className="font-mono text-xs text-foreground">{m.name}</p>
            {m.date && <p className="font-mono text-[10px] text-muted-foreground">{m.date}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DeliverablesList({ projectId, user }) {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState({});
  useEffect(() => {
    api.entities.Deliverable.filter({ project_id: projectId }).then(setItems);
  }, [projectId]);

  if (!items.length) return <p className="font-mono text-xs text-muted-foreground">No deliverables uploaded yet.</p>;

  return (
    <div className="space-y-3">
      {items.map(d => (
        <div key={d.id} className="rounded-lg border border-border/40 bg-card/30 overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-mono text-xs text-foreground truncate">{d.title}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{d.file_type} · {d.version}{d.is_final ? ' · Final' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {d.file_url ? (
                <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono gap-1 px-2">
                    <Download className="w-3 h-3" /> Download
                  </Button>
                </a>
              ) : (
                <span className="font-mono text-[10px] text-muted-foreground">Not yet available</span>
              )}
              <Button size="sm" variant="ghost"
                onClick={() => setExpanded(e => ({ ...e, [d.id]: !e[d.id] }))}
                className="h-7 text-[10px] font-mono gap-1 px-2 text-muted-foreground">
                Review
              </Button>
            </div>
          </div>
          {expanded[d.id] && (
            <div className="px-4 pb-4">
              <DeliverableReviewPanel deliverable={d} user={user} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChangeRequestPanel({ project }) {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.entities.ChangeRequest.filter({ project_id: project.id }).then(setRequests);
  }, [project.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Please fill in all fields.'); return; }
    setSubmitting(true);
    const newCR = await api.entities.ChangeRequest.create({
      ...form,
      project_id: project.id,
      client_email: project.client_email,
      client_name: project.client_name,
    });
    setRequests(r => [newCR, ...r]);
    setForm({ title: '', description: '', priority: 'Medium' });
    setShowForm(false);
    setSubmitting(false);
    toast.success('Change request submitted!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-semibold text-sm text-foreground">Change Requests</h4>
        <Button size="sm" onClick={() => setShowForm(s => !s)} className="h-7 text-[10px] font-mono gap-1 px-2.5">
          {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card/30">
              <Input placeholder="Change title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-9 text-sm font-mono bg-muted/20 border-border/40" />
              <Textarea placeholder="Describe the change in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="text-sm font-mono bg-muted/20 border-border/40 resize-none" />
              <div className="flex items-center gap-2">
                <label className="font-mono text-xs text-muted-foreground">Priority:</label>
                {['Low', 'Medium', 'High', 'Critical'].map(p => (
                  <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono border transition-all ${form.priority === p ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border/30 text-muted-foreground hover:border-primary/20'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-9 text-xs font-mono gap-1.5">
                <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {requests.length === 0 && !showForm && <p className="font-mono text-xs text-muted-foreground">No change requests yet.</p>}
      <div className="space-y-2">
        {requests.map(cr => (
          <div key={cr.id} className="p-3 rounded-lg border border-border/40 bg-card/20">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-mono text-xs text-foreground font-semibold">{cr.title}</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${crStatusColor[cr.status]}`}>{cr.status}</span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mb-1">{cr.description}</p>
            <span className={`text-[10px] font-mono border px-2 py-0.5 rounded ${priorityColor[cr.priority]}`}>{cr.priority}</span>
            {cr.admin_notes && <p className="font-mono text-[10px] text-primary/80 mt-2 border-t border-border/30 pt-2">Team note: {cr.admin_notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientPortal() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('status');
  const [chatProject, setChatProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProject) setChatProject(selectedProject);
  }, [selectedProject?.id]);

  useEffect(() => {
    const init = async () => {
      const me = await api.auth.me();
      setUser(me);
      const ps = await api.entities.ClientProject.filter({ client_email: me.email });
      setProjects(ps);
      if (ps.length) setSelectedProject(ps[0]);
      setLoading(false);
    };
    init().catch((error) => {
      console.error('Client portal failed to load:', error);
      setLoadError(error.message || 'Unable to load your portal.');
      setLoading(false);
    });
  }, [navigate]);

  if (loading) return (
    <div className="pt-28 pb-24 px-6 flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (loadError) return (
    <div className="pt-28 pb-24 px-6 flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md rounded-2xl border border-destructive/30 bg-card p-8">
        <p className="font-heading font-semibold text-foreground mb-2">Could not load your portal</p>
        <p className="font-mono text-sm text-muted-foreground break-words">{loadError}</p>
        <button onClick={() => window.location.reload()} className="mt-5 font-mono text-xs text-primary underline">Try again</button>
      </div>
    </div>
  );

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-3 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 inline-block">Client Portal</span>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-3">Welcome back, <span className="text-primary">{user?.full_name?.split(' ')[0] || 'Client'}</span></h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">{user?.email} · {projects.length} active project{projects.length !== 1 ? 's' : ''}</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-border/30 bg-card/20">
            <Folder className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-heading font-semibold text-foreground mb-2">No Projects Yet</p>
            <p className="font-mono text-sm text-muted-foreground">Your projects will appear here once our team sets them up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project list */}
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Your Projects</p>
              {projects.map(p => (
                <ProjectCard key={p.id} project={p} selected={selectedProject?.id === p.id} onSelect={setSelectedProject} />
              ))}
            </div>

            {/* Detail panel */}
            {selectedProject && (
              <motion.div key={selectedProject.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-2 space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-border/30 pb-0">
                  {[
                    { id: 'status', label: 'Live Status', icon: Zap },
                    { id: 'deliverables', label: 'Deliverables', icon: Download },
                    { id: 'changes', label: 'Change Requests', icon: Send },
                    { id: 'chat', label: 'Messages', icon: MessageCircle },
                    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs border-b-2 transition-all duration-200 -mb-px ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                      <tab.icon className="w-3.5 h-3.5" />{tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 rounded-xl border border-border/50 bg-card/30">
                  {activeTab === 'status' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="font-heading font-bold text-lg text-foreground">{selectedProject.project_title}</h3>
                          <p className="font-mono text-xs text-muted-foreground mt-0.5">{selectedProject.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-mono border ${statusConfig[selectedProject.status]?.bg} ${statusConfig[selectedProject.status]?.color}`}>{selectedProject.status}</span>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-mono text-xs text-muted-foreground">Overall Progress</span>
                          <span className="font-mono text-xs text-primary">{selectedProject.progress_percent || 0}%</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2">
                          <motion.div className={`h-2 rounded-full ${statusConfig[selectedProject.status]?.bar}`} initial={{ width: 0 }} animate={{ width: `${selectedProject.progress_percent || 0}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 rounded-lg border border-border/30 bg-card/20">
                          <p className="font-mono text-[10px] text-muted-foreground mb-1">Start Date</p>
                          <p className="font-heading font-semibold text-sm text-foreground">{selectedProject.start_date || '—'}</p>
                        </div>
                        <div className="p-3 rounded-lg border border-border/30 bg-card/20">
                          <p className="font-mono text-[10px] text-muted-foreground mb-1">Target Date</p>
                          <p className="font-heading font-semibold text-sm text-foreground">{selectedProject.target_date || '—'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-foreground mb-4">Milestones</h4>
                        <MilestoneTimeline milestones={selectedProject.milestones} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'deliverables' && (
                    <div className="space-y-4">
                      <h4 className="font-heading font-semibold text-sm text-foreground">Downloadable Deliverables</h4>
                      <DeliverablesList projectId={selectedProject.id} user={user} />
                    </div>
                  )}

                  {activeTab === 'changes' && <ChangeRequestPanel project={selectedProject} />}
                  {activeTab === 'chat' && user && <ProjectChat project={selectedProject} user={user} />}
                  {activeTab === 'gallery' && <ProjectGallery project={selectedProject} />}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}