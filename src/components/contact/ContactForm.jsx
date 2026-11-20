import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/api/client';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSending(true);
    try {
      await api.contact.submit(form);
      toast.success('Message received. We\'ll get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error.message || 'Your message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-5"
    >
      <div>
        <label className="font-mono text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">Name</label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          className="bg-muted/30 border-border/50 font-mono text-sm focus:border-primary/50 h-12"
        />
      </div>
      <div>
        <label className="font-mono text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">Email</label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com"
          className="bg-muted/30 border-border/50 font-mono text-sm focus:border-primary/50 h-12"
        />
      </div>
      <div>
        <label className="font-mono text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">Message</label>
        <Textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your project..."
          rows={5}
          className="bg-muted/30 border-border/50 font-mono text-sm focus:border-primary/50 resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={sending}
        className="w-full h-12 bg-primary text-primary-foreground font-heading font-semibold hover:box-glow-cyan transition-all duration-300"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        {sending ? 'Sending...' : 'Send Message'}
      </Button>
    </motion.form>
  );
}