import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Layout, Bot, BarChart3, FileText, ArrowRight } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

const services = [
  { icon: Globe, title: 'Website Development', desc: 'Pixel-perfect, responsive websites built for performance and conversion.', color: 'primary', image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80' },
  { icon: Layout, title: 'Web Applications', desc: 'Scalable, full-stack web apps engineered for complex business needs.', color: 'primary', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80' },
  { icon: Bot, title: 'Robotics Projects', desc: 'Autonomous systems and IoT solutions pushing the edge of innovation.', color: 'accent', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80' },
  { icon: BarChart3, title: 'Data Analytics', desc: 'Transform raw data into actionable insights with advanced pipelines.', color: 'primary', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
  { icon: FileText, title: 'Research Papers', desc: 'Rigorous, publication-ready research across emerging tech domains.', color: 'accent', image: 'https://images.unsplash.com/photo-1532094349884-543559ede365?w=600&q=80' },
];

export default function ServicesPreview() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="What We Do"
          title="Five Sectors of Excellence"
          description="Each specialized team brings deep expertise to deliver world-class digital solutions."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to="/services"
                className="group block rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 overflow-hidden transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                    <service.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="font-mono text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                  <div className="flex items-center gap-1.5 mt-4 text-primary text-sm font-mono opacity-0 group-hover:opacity-100 transition-all duration-300">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}