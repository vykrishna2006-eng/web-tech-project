'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/api/auth/profile', { name, avatar_url: user?.avatar_url });
      updateUser(data);
      toast({ title: 'Profile updated!' });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences</p>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user?.plan === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user?.plan} plan
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Display Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input value={user?.email} disabled className="opacity-60" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Account Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Member since</span>
              <span className="font-medium">{user ? new Date().toLocaleDateString() : '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium capitalize">{user?.plan}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Admin</span>
              <span className="font-medium">{user?.is_admin ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </DashboardLayout>
  );
}
