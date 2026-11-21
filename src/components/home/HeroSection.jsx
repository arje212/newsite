import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1800&q=85"
          alt="A considered digital workspace"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(145 15% 27%) 1px, transparent 1px), linear-gradient(90deg, hsl(145 15% 27%) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs text-primary tracking-wider">INNOVATION × COLLABORATION × EXCELLENCE</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-foreground">Crafting Digital</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary text-glow-cyan">
            Solutions
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-mono text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Five specialized teams. One unified vision. We engineer websites, applications,
          robotics systems, data pipelines, and cutting-edge research that push boundaries.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="group px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm hover:box-glow-cyan transition-all duration-300 flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/projects"
            className="px-8 py-3.5 rounded-lg border border-border/50 text-foreground font-heading font-semibold text-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
          >
            View Projects
          </Link>
        </motion.div>

        {/* Floating preview images */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-16 relative max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-[0_18px_55px_hsl(145_14%_18%/0.10)]">
            <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80"
              alt="Development workspace"
              className="w-full h-56 md:h-72 object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
          </div>
          {/* Floating mini cards */}
          <div className="absolute -top-4 -left-4 md:-left-8 p-3 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-sm hidden md:block">
            <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=120&q=80" alt="Robotics" className="w-20 h-14 rounded-lg object-cover mb-1.5" />
            <p className="font-mono text-[10px] text-primary">Robotics</p>
          </div>
          <div className="absolute -top-4 -right-4 md:-right-8 p-3 rounded-xl border border-accent/30 bg-card/80 backdrop-blur-sm hidden md:block">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&q=80" alt="Analytics" className="w-20 h-14 rounded-lg object-cover mb-1.5" />
            <p className="font-mono text-[10px] text-accent">Data Analytics</p>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: '05', label: 'Practice Areas' },
            { value: '01', label: 'Shared Workspace' },
            { value: '01', label: 'Dedicated Team' },
            { value: '∞', label: 'Ideas to Build' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-heading font-bold text-2xl md:text-3xl text-primary text-glow-cyan">{stat.value}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}