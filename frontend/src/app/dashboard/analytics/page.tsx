'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

const COLORS = ['#6366f1', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#6b7280'];

interface Analytics {
  total: number;
  byStatus: { status: string; count: string }[];
  byMonth: { month: string; count: string }[];
  conversion: { applicationToInterview: string; applicationToOffer: string; interviewToOffer: string };
  topCompanies: { company_name: string; count: string }[];
  responseRate: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/api/analytics/overview').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="p-8 text-gray-500">Loading analytics...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Track your application performance</p>
          </div>
          {user?.plan === 'free' && (
            <Link href="/dashboard/billing" className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors">
              Upgrade for Advanced Analytics
            </Link>
          )}
        </div>

        {/* Conversion rates */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'App → Interview', value: `${data?.conversion.applicationToInterview}%`, color: 'text-purple-600' },
            { label: 'App → Offer', value: `${data?.conversion.applicationToOffer}%`, color: 'text-green-600' },
            { label: 'Interview → Offer', value: `${data?.conversion.interviewToOffer}%`, color: 'text-indigo-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-6 text-center">
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Applications by month */}
          <Card>
            <CardHeader><CardTitle className="text-base">Applications Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.byMonth.map((d) => ({ month: d.month, Applications: parseInt(d.count) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status distribution */}
          <Card>
            <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={data?.byStatus.map((d) => ({ name: d.status, value: parseInt(d.count) }))}
                    cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {data?.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top companies */}
        {data?.topCompanies && data.topCompanies.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Top Companies Applied To</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topCompanies.map((c, i) => (
                  <div key={c.company_name} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{c.company_name}</span>
                        <span className="text-gray-500">{c.count} applications</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(parseInt(c.count) / parseInt(data.topCompanies[0].count)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
