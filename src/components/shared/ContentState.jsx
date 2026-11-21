import React from 'react';

export function Loading() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function Empty({ children = 'Nothing to show yet. Please check back soon.' }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-16 text-center">
      <p className="font-mono text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
