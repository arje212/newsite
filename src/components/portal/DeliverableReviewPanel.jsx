import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, MessageSquare, ChevronDown, ChevronUp, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const decisionConfig = {
  Approved: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10 border-primary/30' },
  'Needs Changes': { icon: AlertCircle, color: 'text-amber-800', bg: 'bg-amber-700/10 border-amber-700/30' },
};

const statusConfig = {
  Pending: { label: 'Awaiting Team', color: 'text-muted-foreground', bg: 'bg-muted/40' },
  Seen: { label: 'Team Reviewing', color: 'text-accent', bg: 'bg-accent/10' },
  Resolved: { label: 'Resolved', color: 'text-primary', bg: 'bg-primary/10' },
};

function ExistingReview({ review }) {
  const dec = decisionConfig[review.decision];
  const sta = statusConfig[review.status] || statusConfig.Pending;
  return (
    <div className="p-4 rounded-xl border border-border/40 bg-card/20 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border ${dec.bg} ${dec.color}`}>
          <dec.icon className="w-3.5 h-3.5" />
          {review.decision}
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sta.bg} ${sta.color}`}>{sta.label}</span>
      </div>
      <p className="font-mono text-xs text-muted-foreground leading-relaxed">{review.feedback}</p>
      {review.team_response && (
        <div className="mt-2 pt-2 border-t border-border/30">
          <p className="font-mono text-[10px] text-muted-foreground mb-0.5">Team response:</p>
          <p className="font-mono text-xs text-primary/80">{review.team_response}</p>
        </div>
      )}
    </div>
  );
}

export default function DeliverableReviewPanel({ deliverable, user }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [decision, setDecision] = useState('Approved');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.DeliverableReview.filter({ deliverable_id: deliverable.id })
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [deliverable.id]);

  const hasReviewed = reviews.some(r => r.client_email === user?.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) { toast.error('Please add your feedback.'); return; }
    setSubmitting(true);

    const review = await api.entities.DeliverableReview.create({
      deliverable_id: deliverable.id,
      project_id: deliverable.project_id,
      client_email: user.email,
      client_name: user.full_name || user.email,
      deliverable_title: deliverable.title,
      decision,
      feedback,
      status: 'Pending',
    });

    // Notify team via email
    api.integrations.Core.SendEmail({
      to: 'team@codecraft.dev',
      subject: `📋 Review Submitted: ${deliverable.title}`,
      body: `A client has submitted a review on a deliverable.\n\n📄 Deliverable: ${deliverable.title}\n👤 Client: ${user.full_name || user.email}\n✅ Decision: ${decision}\n\n💬 Feedback:\n${feedback}\n\nLog in to the Admin Dashboard → Deliverables to respond.`,
    });

    setReviews(r => [review, ...r]);
    setFeedback('');
    setShowForm(false);
    setSubmitting(false);
    toast.success(decision === 'Approved' ? '✅ Deliverable approved!' : '📝 Feedback submitted for the team to review.');
  };

  if (loading) return <div className="flex justify-center py-4"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-border/30">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Reviews ({reviews.length})
        </p>
        {!hasReviewed && (
          <Button size="sm" variant={showForm ? 'outline' : 'default'}
            onClick={() => setShowForm(s => !s)}
            className="h-7 text-[10px] font-mono gap-1 px-2.5">
            {showForm ? 'Cancel' : 'Leave Review'}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card/20">
              {/* Decision toggle */}
              <div className="flex gap-2">
                {['Approved', 'Needs Changes'].map(d => {
                  const cfg = decisionConfig[d];
                  return (
                    <button key={d} type="button" onClick={() => setDecision(d)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 ${decision === d ? `${cfg.bg} ${cfg.color}` : 'border-border/30 text-muted-foreground hover:border-primary/20'}`}>
                      <cfg.icon className="w-3.5 h-3.5" />{d}
                    </button>
                  );
                })}
              </div>
              <Textarea
                placeholder={decision === 'Approved' ? 'Any final notes? (optional)' : 'Describe what needs to be changed...'}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={3}
                className="text-xs font-mono bg-muted/20 border-border/40 resize-none"
              />
              <Button type="submit" disabled={submitting} className="w-full h-8 text-xs font-mono gap-1.5">
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting…' : 'Submit Review'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {hasReviewed && (
        <p className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> You've already submitted a review for this deliverable.
        </p>
      )}

      <div className="space-y-2">
        {reviews.map(r => <ExistingReview key={r.id} review={r} />)}
      </div>
    </div>
  );
}