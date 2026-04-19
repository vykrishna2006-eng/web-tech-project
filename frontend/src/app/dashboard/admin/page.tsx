'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { Users, Briefcase, DollarSign, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface AdminStats { totalUsers: number; premiumUsers: number; totalApplications: number; revenue: number; activeToday: number; }
interface AdminUser { id: string; name: string; email: string; plan: string; is_admin: boolean; app_count: string; created_at: string; }
interface ActivityLog { id: string; name: string; email: string; action: string; created_at: string; }

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/admin/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/api/admin/activity').then((r) => setActivity(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = search ? `?search=${search}` : '';
    api.get(`/api/admin/users${params}`).then((r) => setUsers(r.data)).catch(() => {});
  }, [search]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">System overview and user management</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Premium Users', value: stats.premiumUsers, icon: Users, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Applications', value: stats.totalApplications, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Active Today', value: stats.activeToday, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Users</CardTitle>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-40 h-8 text-sm" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.plan === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{u.plan}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{u.app_count} apps</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activity.slice(0, 20).map((a) => (
                  <div key={a.id} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-gray-700">{a.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{a.action}</p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap ml-2">{format(new Date(a.created_at), 'MMM d, HH:mm')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
