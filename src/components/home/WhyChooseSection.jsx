import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Shield, Rocket, Clock, Award } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

const reasons = [
  { icon: Zap, title: 'Cutting-Edge Tech', desc: 'We stay ahead of the curve with the latest frameworks and tools.' },
  { icon: Users, title: 'Collaborative Teams', desc: 'Different disciplines working in sync to create integrated solutions.' },
  { icon: Shield, title: 'Quality Assured', desc: 'Rigorous testing and review processes ensure production-ready output.' },
  { icon: Rocket, title: 'Fast Delivery', desc: 'Agile workflows mean we ship faster without compromising quality.' },
  { icon: Clock, title: 'Ongoing Support', desc: 'We stand by our work with continuous maintenance and iteration.' },
  { icon: Award, title: 'Measured Progress', desc: 'We agree on clear outcomes and review progress with you throughout the work.' },
];

export default function WhyChooseSection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="max-w-7xl mx-auto relative">
        <SectionHeading
          label="Why CodeCraft"
          title="Built Different, By Design"
          description="We combine deep specialization with cross-team collaboration to deliver exceptional results."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group p-6 rounded-xl border border-border/30 hover:border-primary/20 bg-card/30 hover:bg-card/60 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:box-glow-cyan transition-all">
                <reason.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1.5">{reason.title}</h3>
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}