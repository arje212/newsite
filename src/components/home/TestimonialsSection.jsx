import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, MessagesSquare, PackageCheck } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

const principles = [
  {
    icon: MessagesSquare,
    number: '01',
    title: 'Clear communication',
    text: 'You know what is happening, what needs a decision, and who is responsible for the next step.',
  },
  {
    icon: ClipboardCheck,
    number: '02',
    title: 'Visible progress',
    text: 'Milestones, working files, and feedback stay in one place so there are fewer surprises.',
  },
  {
    icon: PackageCheck,
    number: '03',
    title: 'A thoughtful handoff',
    text: 'We close the loop with organized deliverables, practical notes, and a clear path for what comes next.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Working together"
          title="Good work needs a good process"
          description="A practical, transparent way to move from an early idea to a finished, supported product."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {principles.map((item, index) => (
            <motion.article
              key={item.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-xl border border-border bg-card p-7"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/8 text-primary"><item.icon className="h-5 w-5" /></div>
                <span className="font-mono text-xs tracking-widest text-muted-foreground">{item.number}</span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
