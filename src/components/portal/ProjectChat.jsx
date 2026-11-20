import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function ProjectChat({ project, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.entities.ProjectMessage.filter({ project_id: project.id }, 'created_date').then(msgs => {
      setMessages(msgs);
      setLoading(false);
    });

    const unsubscribe = api.entities.ProjectMessage.subscribe(event => {
      if (event.data?.project_id !== project.id) return;
      if (event.type === 'create') setMessages(prev => [...prev, event.data]);
      if (event.type === 'delete') setMessages(prev => prev.filter(m => m.id !== event.id));
    });

    return unsubscribe;
  }, [project.id]);

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
      sender_name: user.full_name || user.email,
      sender_role: 'client',
      message: text.trim(),
    });
    setText('');
    setSending(false);
  };

  const isMe = (msg) => msg.sender_email === user.email;

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h4 className="font-heading font-semibold text-sm text-foreground">
          Chat with {project.team_lead || 'CodeCraft Team'}
        </h4>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-auto" />
        <span className="font-mono text-[10px] text-muted-foreground">live</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground/20 mb-3" />
            <p className="font-mono text-xs text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${isMe(msg) ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-heading font-bold ${isMe(msg) ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
              {msg.sender_name?.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map(n => n[0]).join('').toUpperCase()}
            </div>
            {/* Bubble */}
            <div className={`max-w-[75%] ${isMe(msg) ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono leading-relaxed ${isMe(msg) ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/40 border border-border/30 text-foreground rounded-tl-sm'}`}>
                {msg.message}
              </div>
              <div className={`flex items-center gap-1.5 ${isMe(msg) ? 'flex-row-reverse' : ''}`}>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {msg.created_date ? format(new Date(msg.created_date), 'MMM d, h:mm a') : ''}
                </span>
                {!isMe(msg) && <span className="font-mono text-[9px] text-muted-foreground">{msg.sender_name}</span>}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border/30 pt-3">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
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