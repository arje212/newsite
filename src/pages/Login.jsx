import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Code2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const { user, login, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && user) navigate(user.role === 'admin' ? '/admin' : '/portal', { replace: true });
  }, [user, isLoadingAuth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const signedInUser = await login(form);
      toast.success('Welcome back.');
      const fallback = signedInUser.role === 'admin' ? '/admin' : '/portal';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-8rem)] px-6 py-20 flex items-center">
      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-[1.05fr_.95fr] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_80px_rgba(42,51,43,.10)]">
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground overflow-hidden">
          <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full border border-white/15" />
          <div className="absolute -right-10 -bottom-10 h-52 w-52 rounded-full border border-white/15" />
          <div className="relative flex items-center gap-3"><div className="h-11 w-11 rounded-xl border border-white/20 flex items-center justify-center"><Code2 /></div><span className="font-heading font-bold text-xl">CodeCraft</span></div>
          <div className="relative max-w-md"><p className="font-mono text-xs uppercase tracking-[.22em] text-white/65 mb-5">A clearer way to build</p><h1 className="font-heading text-5xl font-semibold leading-[1.08] tracking-tight">Good work.<br/>Built together.</h1><p className="mt-6 text-sm leading-7 text-white/75">A shared space for project progress, files, feedback, and conversations with the team.</p></div>
          <p className="relative font-mono text-[10px] uppercase tracking-[.18em] text-white/55">Independent studio platform · 2026</p>
        </div>
        <div className="p-7 sm:p-12 lg:p-14 flex flex-col justify-center">
          <div className="mb-9"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary mb-3">Member access</p><h2 className="font-heading text-3xl font-semibold text-foreground">Sign in to your space</h2><p className="text-sm text-muted-foreground mt-2">Use the account details provided by your CodeCraft administrator.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Email address</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input type="email" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" className="h-12 pl-10 bg-background border-border"/></div></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Password</label><div className="relative"><LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" className="h-12 pl-10 pr-11 bg-background border-border"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></div></div>
            <Button type="submit" disabled={submitting} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90">{submitting ? 'Signing in…' : 'Sign in'}<ArrowRight className="ml-2 h-4 w-4"/></Button>
          </form>
          <p className="text-xs text-muted-foreground mt-7 leading-5">Need an account? Ask the CodeCraft administrator to create your client access.</p>
        </div>
      </div>
    </section>
  );
}
