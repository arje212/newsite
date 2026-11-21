import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Grid } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import ProjectCard from '../components/projects/ProjectCard';
import CaseStudyModal from '../components/projects/CaseStudyModal';
import { useEntityList } from '@/hooks/use-entity-list';
import { Loading, Empty } from '../components/shared/ContentState';

const categories = ['All', 'Web', 'Robotics', 'Data', 'Research'];

/* Map a portfolio_projects row to the shape the card + modal components expect. */
const toProject = (row) => {
  const cs = row.case_study || {};
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    image: row.image_url || '',
    category: row.category,
    tech: Array.isArray(row.tech) ? row.tech : [],
    caseStudy: {
      timeline: cs.timeline || [],
      challenges: cs.challenges || [],
      solutions: cs.solutions || [],
      impact: cs.impact || [],
    },
  };
};

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [blueprintMode, setBlueprintMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { items, loading } = useEntityList('PortfolioProject', 'sort_order', { published: true });
  const projects = items.map(toProject);

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Portfolio"
          title="The Repository"
          description="A selection of our work across web, robotics, data, and research."
        />

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-mono transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setBlueprintMode(b => !b)}
            className={`relative flex items-center gap-2.5 px-4 py-2 rounded-lg border font-mono text-sm transition-all duration-300 shrink-0 ${
              blueprintMode
                ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_8px_22px_hsl(145_15%_27%/0.10)]'
                : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${blueprintMode ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
            <Cpu className="w-3.5 h-3.5" />
            Blueprint View
            <span className={`px-1.5 py-0.5 rounded text-[10px] ml-0.5 transition-all duration-300 ${blueprintMode ? 'bg-primary/20 text-primary' : 'bg-muted/60 text-muted-foreground'}`}>
              {blueprintMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <AnimatePresence>
          {blueprintMode && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-3.5 flex items-start gap-3">
                <Grid className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="font-mono text-xs text-primary/90 leading-relaxed">
                  <span className="font-semibold">Blueprint View Active</span> — Technical architecture schematics and data-flow diagrams are overlaid on each project thumbnail.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <Empty>{projects.length === 0 ? 'No projects have been published yet.' : 'No projects in this category yet.'}</Empty>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              blueprintMode={blueprintMode}
              onViewCaseStudy={() => setSelectedProject(project)}
            />
          ))}
        </div>
        )}
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <CaseStudyModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}