import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Code2, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/team', label: 'Team' },
  { path: '/projects', label: 'Projects' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/portal';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'glass-strong py-3' : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:box-glow-cyan transition-all duration-300">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-foreground">
            Code<span className="text-primary">Craft</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-all duration-300 ${
                location.pathname === link.path
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? <><Link to={dashboardPath} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-mono transition-all ${location.pathname === dashboardPath ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}><LayoutDashboard className="w-3.5 h-3.5" />{user.role === 'admin' ? 'Dashboard' : 'Portal'}</Link><button onClick={async () => { await logout().catch(() => {}); navigate('/'); }} className="px-3.5 py-2 rounded-lg text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50">Sign out</button></> : <Link to="/login" className="px-3.5 py-2 rounded-lg text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50">Sign in</Link>}
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm hover:box-glow-cyan transition-all duration-300"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-foreground hover:bg-muted/50 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong mt-2 mx-4 rounded-xl overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-mono transition-all ${
                    location.pathname === link.path
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? <><Link to={dashboardPath} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"><LayoutDashboard className="w-4 h-4" /> {user.role === 'admin' ? 'Admin Dashboard' : 'Client Portal'}</Link><button onClick={async () => { await logout().catch(() => {}); navigate('/'); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50">Sign out</button></> : <Link to="/login" className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">Sign in</Link>}

              <Link
                to="/contact"
                className="block px-4 py-3 mt-2 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}