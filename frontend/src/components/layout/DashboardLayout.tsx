'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { getSocket } from '@/lib/socket';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, fetchMe, loading } = useAuthStore();
  const { fetchNotifications, addNotification } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchMe();
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.on('notification:new', (data) => {
      addNotification({ ...data, id: Date.now().toString(), is_read: false, created_at: new Date().toISOString() });
      toast({ title: data.title, description: data.message });
    });
    socket.on('subscription:upgraded', () => {
      toast({ title: '🎉 Premium Activated!', description: 'Welcome to InternTrack Pro Premium!' });
    });
    return () => { socket.off('notification:new'); socket.off('subscription:upgraded'); };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
