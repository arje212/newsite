import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function AdminProjectChat({ project, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!project) return;
    api.entities.ProjectMessage.filter({ project_id: project.id }, 'created_date').then(msgs => {
      setMessages(msgs);
      setLoading(false);
    });

    const unsubscribe = api.entities.ProjectMessage.subscribe(event => {
      if (event.data?.project_id !== project.id) return;
      if (event.type === 'create') setMessages(prev => [...prev, event.data]);
    });

    return unsubscribe;
  }, [project?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await api.entities.ProjectMessage.create({
      project_id: project.id,
      sender_email: user.email,
      sender_name: user.full_name || 'CodeCraft Team',
      sender_role: 'team',
      message: text.trim(),
    });
    setText('');
    setSending(false);
  };

  const isTeam = (msg) => msg.sender_role === 'team';

  if (!project) return <p className="font-mono text-xs text-muted-foreground">Select a project to view chat.</p>;
  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
        <MessageCircle className="w-4 h-4 text-accent" />
        <div>
          <h4 className="font-heading font-semibold text-sm text-foreground">{project.project_title}</h4>
          <p className="font-mono text-[10px] text-muted-foreground">Client: {project.client_name} · {project.client_email}</p>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-auto" />
        <span className="font-mono text-[10px] text-muted-foreground">live</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground/20 mb-3" />
            <p className="font-mono text-xs text-muted-foreground">No messages yet for this project.</p>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${isTeam(msg) ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-heading font-bold ${isTeam(msg) ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
              {msg.sender_name?.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className={`max-w-[75%] flex flex-col gap-0.5 ${isTeam(msg) ? 'items-end' : 'items-start'}`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono leading-relaxed ${isTeam(msg) ? 'bg-accent/20 border border-accent/30 text-foreground rounded-tr-sm' : 'bg-muted/40 border border-border/30 text-foreground rounded-tl-sm'}`}>
                {msg.message}
              </div>
              <div className={`flex items-center gap-1.5 ${isTeam(msg) ? 'flex-row-reverse' : ''}`}>
                <span className="font-mono text-[9px] text-muted-foreground">{msg.created_date ? format(new Date(msg.created_date), 'MMM d, h:mm a') : ''}</span>
                <span className="font-mono text-[9px] text-muted-foreground">{msg.sender_name}</span>
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border/30 pt-3">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Reply to client…"
          className="flex-1 h-9 text-sm font-mono bg-muted/20 border-border/40"
          disabled={sending}
        />
        <Button type="submit" size="sm" disabled={sending || !text.trim()} className="h-9 w-9 p-0 shrink-0">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}