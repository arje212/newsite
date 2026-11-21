import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Github, Linkedin, Twitter } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import ContactForm from '../components/contact/ContactForm';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@codecraft.dev' },
  { icon: MapPin, label: 'Location', value: 'Remote-first · Worldwide' },
  { icon: Clock, label: 'Response Time', value: 'Within one business day' },
];

const socials = [
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
];

export default function Contact() {
  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Get in Touch"
          title="Start a Conversation"
          description="Have a project in mind? We'd love to hear about it. Reach out and let's build something incredible together."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Info column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="rounded-xl overflow-hidden h-48 w-full">
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" alt="Our office" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-5">
              {contactInfo.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">{item.label}</p>
                    <p className="font-mono text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border/30">
              <p className="font-heading font-semibold text-sm text-foreground mb-4">Follow Us</p>
              <div className="flex items-center gap-3">
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    className="w-11 h-11 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                  >
                    <s.icon className="w-4.5 h-4.5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/30">
              <p className="font-heading font-semibold text-foreground mb-2">Office Hours</p>
              <div className="space-y-1">
                <p className="font-mono text-sm text-muted-foreground">Monday – Friday: By appointment</p>
                <p className="font-mono text-sm text-muted-foreground">Weekend enquiries are welcome</p>
              </div>
            </div>
          </motion.div>

          {/* Form column */}
          <div className="p-8 rounded-xl border border-border/50 bg-card/30">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-6">Send us a message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}