import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import BlueprintOverlay from './BlueprintOverlay';

export default function ProjectCard({ project, index, blueprintMode, onViewCaseStudy }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group rounded-xl border bg-card/30 overflow-hidden transition-all duration-300 ${
        blueprintMode
          ? 'border-primary/40 shadow-[0_8px_22px_hsl(145_15%_27%/0.10)]'
          : 'border-border/50 hover:border-primary/20'
      }`}
    >
      {/* Image + overlay */}
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className={`w-full h-52 object-cover transition-all duration-700 ${
            blueprintMode
              ? 'opacity-30 scale-105 saturate-0'
              : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />

        {/* Category badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`px-2.5 py-1 rounded-md text-xs font-mono backdrop-blur-sm border transition-colors duration-300 ${
            blueprintMode
              ? 'bg-primary/20 border-primary/50 text-primary'
              : 'bg-primary/10 border-primary/20 text-primary'
          }`}>
            {project.category}
          </span>
        </div>

        {/* Blueprint schematic overlay */}
        <BlueprintOverlay category={project.category} visible={blueprintMode} />
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className={`font-heading font-semibold mb-1.5 transition-colors duration-300 ${
          blueprintMode ? 'text-primary' : 'text-foreground group-hover:text-primary'
        }`}>
          {project.title}
        </h3>

        <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className={`px-2 py-0.5 rounded text-xs font-mono border transition-all duration-300 ${
                blueprintMode
                  ? 'bg-primary/10 border-primary/30 text-primary/90'
                  : 'bg-muted/50 text-muted-foreground border-border/30'
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Blueprint-mode architecture hint */}
        {blueprintMode && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-[10px] text-primary/50 mt-3 leading-relaxed tracking-wide"
          >
            ◈ Architecture diagram active — hover to inspect
          </motion.p>
        )}

        {/* Case Study button */}
        <button
          onClick={onViewCaseStudy}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border/40 text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
        >
          <BookOpen className="w-3.5 h-3.5" />
          View Case Study
        </button>
      </div>
    </motion.div>
  );
}