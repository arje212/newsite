import React from 'react';
import { motion } from 'framer-motion';

export default function SectionHeading({ label, title, description, align = 'center' }) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col ${alignClass} mb-16`}
    >
      {label && (
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-3 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 w-fit">
          {label}
        </span>
      )}
      <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-foreground mt-2 max-w-3xl">
        {title}
      </h2>
      {description && (
        <p className="font-mono text-sm md:text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}