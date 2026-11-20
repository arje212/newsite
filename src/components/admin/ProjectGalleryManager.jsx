import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Upload, Trash2, Plus, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const PHASES = ['Design', 'Development', 'Testing', 'Review', 'Deployment'];

export default function ProjectGalleryManager({ project }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [phase, setPhase] = useState('Development');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!project) return;
    api.entities.ProjectPhoto.filter({ project_id: project.id }, '-created_date').then(setPhotos);
  }, [project?.id]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      const photo = await api.entities.ProjectPhoto.create({
        project_id: project.id,
        client_email: project.client_email,
        photo_url: file_url,
        caption: caption || '',
        phase,
      });
      setPhotos(prev => [photo, ...prev]);
    }
    setCaption('');
    setUploading(false);
    toast.success('Photo(s) uploaded!');
  };

  const handleDelete = async (id) => {
    await api.entities.ProjectPhoto.delete(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    toast.success('Photo deleted.');
  };

  if (!project) return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <ImageIcon className="w-8 h-8 mr-2 opacity-30" />
      <span className="font-mono text-sm">Select a project to manage its gallery.</span>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Upload controls */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Upload Progress Photos</p>
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Caption (optional)"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="h-9 text-sm font-mono bg-muted/20 border-border/40 flex-1 min-w-[160px]"
          />
          <select
            value={phase}
            onChange={e => setPhase(e.target.value)}
            className="h-9 rounded-lg border border-border/40 bg-muted/20 text-sm font-mono text-foreground px-3"
          >
            {PHASES.map(p => <option key={p}>{p}</option>)}
          </select>
          <label className={`flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-mono cursor-pointer hover:bg-primary/90 transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading…' : 'Choose Photos'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/30 rounded-xl text-muted-foreground">
          <ImageIcon className="w-10 h-10 opacity-20 mb-3" />
          <p className="font-mono text-xs">No photos uploaded yet for this project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence>
            {photos.map(photo => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative rounded-xl overflow-hidden border border-border/40 bg-card/30 aspect-square cursor-pointer"
                onClick={() => setLightbox(photo)}
              >
                <img src={photo.photo_url} alt={photo.caption || 'Project photo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {photo.phase && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-primary/80 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.phase}
                  </span>
                )}
                {photo.caption && (
                  <p className="absolute bottom-2 left-2 right-2 font-mono text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                    {photo.caption}
                  </p>
                )}
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(photo.id); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[85vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              <img src={lightbox.photo_url} alt={lightbox.caption || ''} className="w-full h-full object-contain rounded-xl" />
              {(lightbox.caption || lightbox.phase) && (
                <div className="mt-3 text-center">
                  {lightbox.phase && <span className="font-mono text-xs text-primary mr-3">{lightbox.phase}</span>}
                  {lightbox.caption && <span className="font-mono text-sm text-white/80">{lightbox.caption}</span>}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}