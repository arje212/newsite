import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

/* ── Project Timeline ── */
function Timeline({ phases }) {
  return (
    <div className="relative">
      {/* Vertical spine */}
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />

      <div className="space-y-6">
        {phases.map((phase, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex gap-4 pl-1"
          >
            {/* Node */}
            <div className="relative shrink-0 mt-0.5">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-mono font-bold z-10 relative ${
                phase.status === 'done'
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-accent/10 border-accent/30 text-accent'
              }`}>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-heading font-semibold text-sm text-foreground">{phase.name}</h4>
                <span className="font-mono text-[10px] text-muted-foreground border border-border/40 px-2 py-0.5 rounded">
                  {phase.duration}
                </span>
                {phase.status === 'done' && (
                  <span className="font-mono text-[10px] text-primary bg-primary/8 border border-primary/20 px-2 py-0.5 rounded">
                    ✓ Complete
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">{phase.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Client Impact Metrics ── */
function ImpactMetric({ metric, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="p-5 rounded-xl border border-primary/20 bg-primary/5 text-center"
    >
      <p className="font-heading font-black text-2xl md:text-3xl text-primary mb-1 text-glow-cyan">
        {metric.value}
      </p>
      <p className="font-heading font-semibold text-xs text-foreground mb-1">{metric.label}</p>
      <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{metric.desc}</p>
    </motion.div>
  );
}

/* ── Main Modal ── */
export default function CaseStudyModal({ project, onClose }) {
  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 md:pt-16 overflow-y-auto"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl overflow-hidden mb-8"
          onClick={e => e.stopPropagation()}
        >
          {/* Hero image */}
          <div className="relative h-52 md:h-64 overflow-hidden">
            {project.image ? <img src={project.image} alt={project.title} className="w-full h-full object-cover opacity-60 saturate-50" /> : <div className="w-full h-full bg-muted/40" />}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/40 to-card" />

            {/* Top bar */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              <span className="px-3 py-1 rounded-lg text-xs font-mono bg-primary/15 border border-primary/30 text-primary backdrop-blur-sm">
                {project.category}
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-card/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-5 left-6 right-6">
              <p className="font-mono text-[10px] text-primary/70 uppercase tracking-widest mb-1">Case Study</p>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground tracking-tight leading-tight">
                {project.title}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 space-y-10">

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2">
              {project.tech.map(t => (
                <span key={t} className="px-3 py-1 rounded-md text-xs font-mono bg-muted/40 border border-border/40 text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>

            {project.caseStudy.timeline.length > 0 && (<>
            {/* ── 1. Project Timeline ── */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-bold text-lg text-foreground">Project Timeline</h3>
              </div>
              <Timeline phases={project.caseStudy.timeline} />
            </section>

            <div className="h-px bg-border/30" />
            </>)}

            {/* ── 2. Challenges & Solutions (side by side) ── */}
            {(project.caseStudy.challenges.length > 0 || project.caseStudy.solutions.length > 0) && (<>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Challenges */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                  <h3 className="font-heading font-bold text-lg text-foreground">Challenges Faced</h3>
                </div>
                <ul className="space-y-3">
                  {project.caseStudy.challenges.map((c, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.08 }}
                      className="flex gap-3"
                    >
                      <span className="w-5 h-5 rounded border border-accent/30 bg-accent/8 flex items-center justify-center text-accent text-[10px] font-mono font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-heading font-semibold text-sm text-foreground mb-0.5">{c.title}</p>
                        <p className="font-mono text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </section>

              {/* Solutions */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <h3 className="font-heading font-bold text-lg text-foreground">Solutions Delivered</h3>
                </div>
                <ul className="space-y-3">
                  {project.caseStudy.solutions.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.08 }}
                      className="flex gap-3"
                    >
                      <span className="w-5 h-5 rounded border border-primary/30 bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                      </span>
                      <div>
                        <p className="font-heading font-semibold text-sm text-foreground mb-0.5">{s.title}</p>
                        <p className="font-mono text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="h-px bg-border/30" />
            </>)}

            {/* ── 3. Client Impact ── */}
            {project.caseStudy.impact.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-bold text-lg text-foreground">Client Impact</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.caseStudy.impact.map((metric, i) => (
                  <ImpactMetric key={i} metric={metric} index={i} />
                ))}
              </div>
            </section>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}