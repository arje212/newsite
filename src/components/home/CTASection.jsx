import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-12 md:p-16 text-center overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-foreground mb-4">
              Ready to Build the Future?
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Whether you need a website, a data pipeline, or a robotics prototype — our teams are ready to bring your vision to life.
            </p>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm hover:box-glow-cyan transition-all duration-300"
            >
              Start Your Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}