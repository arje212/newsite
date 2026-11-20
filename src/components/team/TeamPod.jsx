import React from 'react';
import { motion } from 'framer-motion';

export default function TeamPod({ team, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group rounded-xl border border-border/50 bg-card/30 overflow-hidden hover:border-primary/20 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:box-glow-cyan transition-all">
            <team.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground">{team.name}</h3>
            <p className="font-mono text-xs text-primary/80">{team.focus}</p>
          </div>
        </div>

        <div className="space-y-3">
          {team.members.map((member, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border border-border/30 hover:border-primary/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <span className="font-heading font-bold text-xs text-foreground">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-heading text-sm font-medium text-foreground">{member.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}