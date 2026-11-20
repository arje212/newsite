import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Lightbulb, Users, Gem, Code2, BarChart3, Megaphone, FlaskConical } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import { api } from '@/api/client';

const values = [
  { icon: Lightbulb, title: 'Innovation', desc: 'We push boundaries by exploring emerging technologies and unconventional solutions.' },
  { icon: Users, title: 'Collaboration', desc: 'Five teams, one mission — cross-functional synergy drives our best work.' },
  { icon: Gem, title: 'Excellence', desc: 'Every line of code, every circuit, every dataset meets the highest standard.' },
];

const teams = [
  { icon: Code2, name: 'Rolando M. Melecio Jr.', desc: 'Lead Developer — Full-stack engineer and robotics specialist leading CodeCraft\'s technical direction.', members: 'Lead Developer' },
  { icon: BarChart3, name: 'John Franklin P. Nieras', desc: 'Developer / Data Analyst — Bridges software engineering and business intelligence with powerful dashboards.', members: 'Developer & Analyst' },
  { icon: Megaphone, name: 'Ryan Joshua Navarro', desc: 'Marketing Specialist — Client relations, inside sales, and account management expert.', members: 'Marketing Specialist' },
  { icon: Megaphone, name: 'Claire Mueco', desc: 'Marketing Specialist — Drives brand presence through digital marketing and content strategy.', members: 'Marketing Specialist' },
  { icon: FlaskConical, name: 'Ivan Jethro Mercado', desc: 'Data & Research Specialist — Expert in thesis writing, statistical analysis, and academic research.', members: 'Research Specialist' },
];

const iconMap = { 'Lead Developer': Code2, 'Developer / Data Analyst': BarChart3, 'Marketing Specialist': Megaphone, 'Data & Research Specialist': FlaskConical };

export default function About() {
  const [dbTeams, setDbTeams] = useState([]);
  useEffect(() => { api.entities.TeamMember.list('sort_order').then(setDbTeams).catch(() => {}); }, []);

  // Merge DB data into teams array (match by role/name), or fall back to static
  const resolvedTeams = teams.map(t => {
    const dbMatch = dbTeams.find(m => t.name.includes(m.name?.split(' ')[0]) || m.name?.includes(t.name.split(' ')[0]));
    return { ...t, photo_url: dbMatch?.photo_url || null };
  });

  return (
    <div className="pt-28 pb-24">
      {/* Hero */}
      <section className="px-6 mb-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            label="About Us"
            title="The Digital Crucible"
            description="CodeCraft is where code, data, and hardware fuse into a singular force of innovation. We are five specialized teams united by one purpose — building the future."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground mb-2">Our Mission</h3>
                  <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                    To deliver world-class digital solutions by combining deep technical expertise with a relentless drive for innovation. We empower businesses, researchers, and creators to achieve what was previously impossible.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-1">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground mb-2">Our Vision</h3>
                  <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                    To become the premier technology collective where every project — from a landing page to an autonomous robot — represents the gold standard of technical craftsmanship.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Photo collage */}
      <section className="px-6 mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-64 md:h-80">
            <div className="col-span-2 row-span-2 rounded-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" alt="Team collaboration" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80" alt="Tech work" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80" alt="Coding" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" alt="Data analytics" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80" alt="Robotics" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="px-6 mb-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading label="Core Values" title="What Drives Us" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-xl border border-border/50 bg-card/50 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{v.title}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The 5 Teams */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            label="Our Team"
            title="The People Behind CodeCraft"
            description="Five specialists, each a master of their domain, collaborating to deliver comprehensive digital solutions."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resolvedTeams.map((team, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group p-6 rounded-xl border border-border/50 bg-card/30 hover:border-primary/20 hover:bg-card/60 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  {team.photo_url ? (
                    <img src={team.photo_url} alt={team.name} className="w-11 h-11 rounded-lg object-cover border border-primary/20 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:box-glow-cyan transition-all">
                      <team.icon className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">{team.name}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-3">{team.desc}</p>
                <span className="font-mono text-xs text-primary/80">{team.members}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}