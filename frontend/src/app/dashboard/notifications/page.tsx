'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Info, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
  reminder: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  alert: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
};

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead } = useNotificationStore();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1">{notifications.filter((n) => !n.is_read).length} unread</p>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <Button variant="outline" onClick={markAllRead} className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {notifications.map((n) => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = config.icon;
              return (
                <div key={n.id}
                  className={cn('flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors', n.is_read ? 'bg-white border-gray-100' : 'bg-indigo-50/50 border-indigo-100')}
                  onClick={() => !n.is_read && markRead(n.id)}>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn('text-sm font-medium', n.is_read ? 'text-gray-700' : 'text-gray-900')}>{n.title}</p>
                      {!n.is_read && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
