import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, ExternalLink } from 'lucide-react';

export default function MemberCard({ member, index }) {
  const [expanded, setExpanded] = useState(false);

  const initials = member.name
    .split(' ')
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .map(n => n[0])
    .join('');
  const hasPhoto = Boolean(member.photo_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-xl border border-border/50 bg-card/40 hover:border-primary/25 transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {hasPhoto ? (
            <img src={member.photo_url} alt={member.name} className="w-14 h-14 rounded-xl object-cover border border-primary/20 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-lg text-primary">{initials}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Role badge */}
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-primary/8 border border-primary/20 text-primary/80 mb-1.5">
              {member.role}
            </span>
            <h3 className="font-heading font-bold text-foreground text-base leading-tight">{member.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-mono text-xs text-muted-foreground truncate">{member.location}</span>
            </div>
          </div>
        </div>

        {/* About */}
        <p className="font-mono text-xs text-muted-foreground leading-relaxed mt-4">
          {member.about}
        </p>

        {/* Specialties */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {member.specialties.map(s => (
            <span key={s} className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/8 border border-accent/20 text-accent/80">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable skills */}
      <div className="border-t border-border/30">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-6 py-3 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all duration-200"
        >
          <span>Skills & Tools</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 flex flex-wrap gap-1.5">
                {member.skills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-mono bg-primary/5 border border-primary/15 text-primary/90">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Portfolio link */}
      {member.portfolio && (
        <div className="border-t border-border/30 px-6 py-3">
          <a
            href={member.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-primary/70 hover:text-primary transition-colors duration-200 group"
          >
            <ExternalLink className="w-3 h-3" />
            View E-Portfolio
            <span className="opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0.5 transition-all duration-200">→</span>
          </a>
        </div>
      )}
    </motion.div>
  );
}