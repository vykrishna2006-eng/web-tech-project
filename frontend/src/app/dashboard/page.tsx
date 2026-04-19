'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { STATUS_CONFIG } from '@/lib/utils';
import { Briefcase, TrendingUp, Award, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationForm from '@/components/applications/ApplicationForm';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { applications, fetchApplications } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchApplications(); }, []);

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !['rejected', 'withdrawn'].includes(a.status)).length,
    offers: applications.filter((a) => a.status === 'offer').length,
    interviews: applications.filter((a) => a.status === 'interview').length,
  };

  const recent = [...applications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 mt-1">Here&apos;s your application overview</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Application
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: stats.total, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Pipeline', value: stats.active, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Interviews', value: stats.interviews, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Offers', value: stats.offers, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  </div>
                  <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Status breakdown */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-base">By Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                const count = applications.filter((a) => a.status === status).length;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{config.label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${config.dot} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent applications */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <Link href="/dashboard/kanban" className="text-sm text-indigo-600 hover:underline">View all →</Link>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No applications yet. Add your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((app) => {
                    const config = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG];
                    return (
                      <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{app.company_name}</p>
                          <p className="text-xs text-gray-500">{app.role}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${config?.color}`}>{config?.label}</span>
                          <span className="text-xs text-gray-400">{format(new Date(app.created_at), 'MMM d')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {user?.plan === 'free' && (
          <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">Upgrade to Premium</p>
              <p className="text-indigo-100 text-sm mt-1">Unlock unlimited applications, advanced analytics, and more.</p>
            </div>
            <Link href="/dashboard/billing" className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap">
              Upgrade Now
            </Link>
          </div>
        )}
      </div>
      <ApplicationForm open={showForm} onClose={() => setShowForm(false)} />
    </DashboardLayout>
  );
}
