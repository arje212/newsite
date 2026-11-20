import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, Eye, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const decisionConfig = {
  Approved: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10 border-primary/30' },
  'Needs Changes': { icon: AlertCircle, color: 'text-amber-800', bg: 'bg-amber-700/10 border-amber-700/30' },
};

const statusOptions = ['Pending', 'Seen', 'Resolved'];
const statusColors = {
  Pending: 'bg-destructive/10 text-destructive',
  Seen: 'bg-accent/10 text-accent',
  Resolved: 'bg-primary/10 text-primary',
};

export default function DeliverableReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});

  const load = () => {
    setLoading(true);
    api.entities.DeliverableReview.list('-created_date')
      .then(setReviews)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateReview = async (id, data) => {
    const updated = await api.entities.DeliverableReview.update(id, data);
    setReviews(rs => rs.map(r => r.id === id ? updated : r));
    toast.success('Review updated.');
  };

  const sendResponse = async (review) => {
    const resp = responses[review.id];
    if (!resp?.trim()) { toast.error('Enter a response first.'); return; }
    const updated = await api.entities.DeliverableReview.update(review.id, {
      team_response: resp,
      status: 'Resolved',
    });
    // Notify client
    api.integrations.Core.SendEmail({
      to: review.client_email,
      subject: `💬 Team Response on: ${review.deliverable_title}`,
      body: `Hi ${review.client_name},\n\nThe CodeCraft team has responded to your review.\n\n📄 Deliverable: ${review.deliverable_title}\n✅ Your Decision: ${review.decision}\n\n💬 Team Response:\n${resp}\n\nLog in to the Client Portal to view your updated deliverables.\n\nBest regards,\nThe CodeCraft Team`,
    });
    setReviews(rs => rs.map(r => r.id === review.id ? updated : r));
    setResponses(r => ({ ...r, [review.id]: '' }));
    toast.success('Response saved. Email delivery requires SMTP configuration.');
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pending = reviews.filter(r => r.status === 'Pending');
  const rest = reviews.filter(r => r.status !== 'Pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-mono text-xs text-muted-foreground">{reviews.length} reviews</p>
          {pending.length > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-destructive/10 text-destructive">
              {pending.length} pending
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={load} className="h-7 gap-1.5 text-xs font-mono">
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-border/30 bg-card/20">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground">No reviews yet.</p>
        </div>
      )}

      {/* Pending first */}
      {[...pending, ...rest].map((review, i) => {
        const dec = decisionConfig[review.decision];
        return (
          <motion.div key={review.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-5 rounded-xl border border-border/40 bg-card/30 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-heading font-bold text-sm text-foreground">{review.deliverable_title}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{review.client_name} · {review.client_email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${dec.bg} ${dec.color}`}>
                  <dec.icon className="w-3 h-3" />{review.decision}
                </div>
                <select value={review.status}
                  onChange={e => updateReview(review.id, { status: e.target.value })}
                  className="h-6 rounded border border-border/40 bg-muted/20 text-[10px] font-mono text-foreground px-1.5">
                  {statusOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Feedback */}
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <p className="font-mono text-[10px] text-muted-foreground mb-1">Client Feedback:</p>
              <p className="font-mono text-xs text-foreground leading-relaxed">{review.feedback}</p>
            </div>

            {/* Existing team response */}
            {review.team_response && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-mono text-[10px] text-primary/60 mb-1">Your Response:</p>
                <p className="font-mono text-xs text-foreground leading-relaxed">{review.team_response}</p>
              </div>
            )}

            {/* Response input */}
            {review.status !== 'Resolved' && (
              <div className="flex gap-2">
                <Input
                  placeholder="Type a response to the client…"
                  value={responses[review.id] || ''}
                  onChange={e => setResponses(r => ({ ...r, [review.id]: e.target.value }))}
                  className="h-8 text-xs font-mono bg-muted/20 border-border/40 flex-1"
                />
                <Button size="sm" onClick={() => sendResponse(review)} className="h-8 text-xs font-mono px-3 gap-1">
                  <Send className="w-3 h-3" /> Respond
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${statusColors[review.status]}`}>
                {review.status}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {new Date(review.created_date).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}