import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ChevronDown, Globe, Bot, BarChart3, FlaskConical, Rocket } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

const categories = ['All', 'Web', 'Robotics', 'Data', 'Research'];

const milestones = [
  {
    quarter: 'Q1 2025',
    label: 'Completed',
    status: 'done',
    category: 'Web',
    icon: Globe,
    title: 'NovaMart E-Commerce Launch',
    desc: 'Shipped full-stack platform with AI recommendation engine, Stripe payments, and real-time inventory sync.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    quarter: 'Q1 2025',
    label: 'Completed',
    status: 'done',
    category: 'Research',
    icon: FlaskConical,
    title: 'Graph Neural Network Drug Discovery Concept',
    desc: 'An illustrative research concept exploring graph neural networks for molecular property prediction and early-stage drug discovery.',
    tags: ['PyTorch', 'RDKit', 'LaTeX'],
  },
  {
    quarter: 'Q2 2025',
    label: 'Completed',
    status: 'done',
    category: 'Robotics',
    icon: Bot,
    title: 'Autonomous Navigation Robot Prototype',
    desc: 'A sample robotics build combining mapping, obstacle avoidance, and path planning for a mobile platform.',
    tags: ['ROS', 'Python', 'TensorFlow'],
  },
  {
    quarter: 'Q2 2025',
    label: 'Completed',
    status: 'done',
    category: 'Data',
    icon: BarChart3,
    title: 'CityPulse Urban Analytics Concept',
    desc: 'A sample data product concept bringing traffic, energy, and public-service indicators into one planning dashboard.',
    tags: ['Spark', 'Tableau', 'SQL'],
  },
  {
    quarter: 'Q3 2025',
    label: 'In Progress',
    status: 'active',
    category: 'Web',
    icon: Globe,
    title: 'HealthSync v2.0 — Doctor Portal Expansion',
    desc: 'An illustrative healthcare product concept covering provider scheduling, lab result integration, and review workflows.',
    tags: ['React Native', 'Firebase', 'HL7'],
  },
  {
    quarter: 'Q3 2025',
    label: 'In Progress',
    status: 'active',
    category: 'Robotics',
    icon: Bot,
    title: 'SmartNest IoT Hub — Commercial Rollout',
    desc: 'Scaling from residential prototype to commercial building management with multi-zone HVAC and occupancy-aware automation.',
    tags: ['MQTT', 'Raspberry Pi', 'React'],
  },
  {
    quarter: 'Q4 2025',
    label: 'Upcoming',
    status: 'upcoming',
    category: 'Data',
    icon: BarChart3,
    title: 'Predictive Infrastructure Analytics Platform',
    desc: 'End-to-end ML platform forecasting municipal infrastructure failures — roads, bridges, utilities — 6 months ahead with >87% accuracy target.',
    tags: ['Python', 'TensorFlow', 'Spark'],
  },
  {
    quarter: 'Q4 2025',
    label: 'Upcoming',
    status: 'upcoming',
    category: 'Research',
    icon: FlaskConical,
    title: 'LLM Code Review Research Initiative',
    desc: 'Investigating fine-tuned LLM applicability for automated security vulnerability detection in open-source codebases. Targeting ICSE 2026 submission.',
    tags: ['Python', 'HuggingFace', 'LaTeX'],
  },
  {
    quarter: 'Q1 2026',
    label: 'Planned',
    status: 'planned',
    category: 'Web',
    icon: Rocket,
    title: 'CodeCraft Client Portal — Self-Serve Dashboard',
    desc: 'White-label project tracking portal letting clients view live milestones, deliverables, and team activity without manual reporting.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    quarter: 'Q1 2026',
    label: 'Planned',
    status: 'planned',
    category: 'Robotics',
    icon: Bot,
    title: 'Swarm Robotics Research Prototype',
    desc: 'Multi-agent coordination system for warehouse logistics using distributed consensus algorithms and V2V mesh communication.',
    tags: ['ROS2', 'Python', 'C++'],
  },
];

const statusConfig = {
  done: {
    label: 'Completed',
    dot: 'bg-primary border-primary',
    card: 'border-primary/25 bg-primary/5',
    badge: 'bg-primary/15 text-primary border-primary/30',
    icon: CheckCircle2,
    iconClass: 'text-primary',
    line: 'bg-primary',
  },
  active: {
    label: 'In Progress',
    dot: 'bg-accent border-accent animate-pulse',
    card: 'border-accent/30 bg-accent/5',
    badge: 'bg-accent/15 text-accent border-accent/30',
    icon: Clock,
    iconClass: 'text-accent',
    line: 'bg-gradient-to-b from-primary to-accent',
  },
  upcoming: {
    label: 'Upcoming',
    dot: 'bg-muted border-border',
    card: 'border-border/50 bg-card/30',
    badge: 'bg-muted/60 text-muted-foreground border-border/40',
    icon: Circle,
    iconClass: 'text-muted-foreground',
    line: 'bg-border/40',
  },
  planned: {
    label: 'Planned',
    dot: 'bg-muted/40 border-border/40',
    card: 'border-border/30 bg-card/20',
    badge: 'bg-muted/30 text-muted-foreground/70 border-border/30',
    icon: Circle,
    iconClass: 'text-muted-foreground/50',
    line: 'bg-border/20',
  },
};

function MilestoneCard({ milestone, index, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[milestone.status];
  const CategoryIcon = milestone.icon;
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="relative flex gap-6 group"
    >
      {/* Timeline spine + dot */}
      <div className="flex flex-col items-center shrink-0 w-10">
        <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1.5 z-10 ${cfg.dot}`} />
        {!isLast && (
          <div className={`w-px flex-1 mt-2 min-h-8 ${cfg.line}`} />
        )}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-8 rounded-xl border transition-all duration-300 overflow-hidden ${cfg.card}`}>
        {/* Header — always visible */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full text-left p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Category icon */}
              <div className="w-9 h-9 rounded-lg bg-background/40 border border-border/40 flex items-center justify-center shrink-0 mt-0.5">
                <CategoryIcon className={`w-4 h-4 ${cfg.iconClass}`} />
              </div>

              <div className="min-w-0">
                {/* Quarter + status badge */}
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">{milestone.quarter}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${cfg.badge}`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {milestone.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/60 border border-border/30 px-2 py-0.5 rounded">
                    {milestone.category}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-sm md:text-base text-foreground leading-tight">
                  {milestone.title}
                </h4>
              </div>
            </div>

            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Expandable body */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-3">
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">{milestone.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {milestone.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-muted/40 border border-border/30 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function RoadmapSection() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? milestones
    : milestones.filter(m => m.category === activeFilter);

  // Summary counts
  const counts = {
    done: milestones.filter(m => m.status === 'done').length,
    active: milestones.filter(m => m.status === 'active').length,
    upcoming: milestones.filter(m => m.status === 'upcoming' || m.status === 'planned').length,
  };

  return (
    <section className="py-24 px-6 relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <SectionHeading
          label="Roadmap"
          title="Development Timeline"
          description="An illustrative timeline of the kinds of web, robotics, data, and research work the studio can take on. These entries are examples, not a record of verified client engagements."
        />

        {/* Summary bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            { label: 'Completed', value: counts.done, color: 'text-primary', bg: 'bg-primary/5 border-primary/15' },
            { label: 'In Progress', value: counts.active, color: 'text-accent', bg: 'bg-accent/5 border-accent/15' },
            { label: 'Upcoming', value: counts.upcoming, color: 'text-muted-foreground', bg: 'bg-muted/20 border-border/30' },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 text-center ${s.bg}`}>
              <p className={`font-heading font-black text-2xl ${s.color}`}>{s.value}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-300 ${
                activeFilter === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.map((milestone, i) => (
              <MilestoneCard
                key={milestone.title}
                milestone={milestone}
                index={i}
                isLast={i === filtered.length - 1}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}