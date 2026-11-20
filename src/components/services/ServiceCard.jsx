import React from 'react';
import { motion } from 'framer-motion';

export default function ServiceCard({ service, index }) {
  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${isReversed ? 'lg:direction-rtl' : ''}`}
    >
      <div className={`${isReversed ? 'lg:order-2' : ''}`}>
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-64 md:h-80 object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700"
          />
        </div>
      </div>

      <div className={`space-y-5 ${isReversed ? 'lg:order-1' : ''}`}>
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <service.icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-heading font-bold text-2xl md:text-3xl text-foreground">{service.title}</h3>
        <p className="font-mono text-sm text-muted-foreground leading-relaxed">{service.description}</p>

        <div>
          <h4 className="font-heading font-semibold text-sm text-foreground mb-3 uppercase tracking-wider">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {service.stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-md text-xs font-mono bg-primary/5 border border-primary/15 text-primary/90"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm text-foreground mb-3 uppercase tracking-wider">Deliverables</h4>
          <ul className="space-y-2">
            {service.deliverables.map((d) => (
              <li key={d} className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}