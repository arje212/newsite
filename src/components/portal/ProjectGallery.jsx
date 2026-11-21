import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectGallery({ project }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activePhase, setActivePhase] = useState('All');

  useEffect(() => {
    if (!project) return;
    api.entities.ProjectPhoto.filter({ project_id: project.id }, '-created_date').then(data => {
      setPhotos(data);
      setLoading(false);
    });
  }, [project?.id]);

  const phases = ['All', ...new Set(photos.map(p => p.phase).filter(Boolean))];
  const filtered = activePhase === 'All' ? photos : photos.filter(p => p.phase === activePhase);

  const openLightbox = (photo, idx) => {
    setLightbox(photo);
    setLightboxIndex(idx);
  };

  const navigate = (dir) => {
    const newIdx = (lightboxIndex + dir + filtered.length) % filtered.length;
    setLightboxIndex(newIdx);
    setLightbox(filtered[newIdx]);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (photos.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ImageIcon className="w-10 h-10 text-muted-foreground/20 mb-3" />
      <p className="font-mono text-xs text-muted-foreground">No progress photos yet. Check back soon!</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-heading font-semibold text-sm text-foreground">Project Gallery</h4>
        <p className="font-mono text-[10px] text-muted-foreground">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Phase filter */}
      {phases.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {phases.map(p => (
            <button
              key={p}
              onClick={() => setActivePhase(p)}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all duration-200 ${activePhase === p ? 'bg-primary text-primary-foreground' : 'border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((photo, idx) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer border border-border/30 bg-card/30"
            onClick={() => openLightbox(photo, idx)}
          >
            <img src={photo.photo_url} alt={photo.caption || 'Project photo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {photo.phase && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-primary/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.phase}
              </span>
            )}
            {photo.caption && (
              <p className="absolute bottom-2 left-2 right-2 font-mono text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                {photo.caption}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>

            {filtered.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); navigate(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={e => { e.stopPropagation(); navigate(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <motion.div
              key={lightbox.id}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center gap-3"
              onClick={e => e.stopPropagation()}
            >
              <img src={lightbox.photo_url} alt={lightbox.caption || ''} className="max-h-[72vh] w-auto rounded-xl object-contain" />
              <div className="text-center">
                {lightbox.phase && <span className="font-mono text-xs text-primary mr-3">{lightbox.phase}</span>}
                {lightbox.caption && <span className="font-mono text-sm text-white/80">{lightbox.caption}</span>}
                {lightbox.created_date && <p className="font-mono text-[10px] text-white/40 mt-1">{format(new Date(lightbox.created_date), 'MMM d, yyyy')}</p>}
              </div>
              <p className="font-mono text-[10px] text-white/30">{lightboxIndex + 1} / {filtered.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}