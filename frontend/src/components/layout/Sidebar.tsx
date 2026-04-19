'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Kanban, BarChart3, FileText, Bell, CreditCard, Settings, LogOut, Shield, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/kanban', label: 'Kanban Board', icon: Kanban },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/resumes', label: 'Resumes', icon: FileText },
  { href: '/dashboard/interviews', label: 'Interview Logs', icon: BookOpen },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  return (
    <aside className="w-64 min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">IT</div>
          <div>
            <p className="font-bold text-sm">InternTrack Pro</p>
            <p className="text-xs text-gray-400 capitalize">{user?.plan} plan</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}>
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] text-center">{unreadCount}</Badge>
            )}
          </Link>
        ))}
        {user?.is_admin && (
          <Link href="/dashboard/admin"
            className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === '/dashboard/admin' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}>
            <Shield className="w-4 h-4" /><span>Admin Panel</span>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <LogOut className="w-4 h-4" /><span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
