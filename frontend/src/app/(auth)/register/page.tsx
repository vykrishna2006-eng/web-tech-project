'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errors = (err as { response?: { data?: { errors?: { msg: string }[]; error?: string } } })?.response?.data;
      const msg = errors?.errors?.[0]?.msg || errors?.error || 'Registration failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-xl text-white mx-auto mb-4">IT</div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-1">Start tracking applications for free</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
