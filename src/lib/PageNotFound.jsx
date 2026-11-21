import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
  const location = useLocation();
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs tracking-[.2em] uppercase text-primary mb-4">Page not found</p>
        <h1 className="font-heading text-7xl font-semibold text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">There is no page at <span className="font-mono text-foreground">{location.pathname}</span>.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-primary hover:underline"><ArrowLeft className="h-4 w-4"/>Back to home</Link>
      </div>
    </main>
  );
}
