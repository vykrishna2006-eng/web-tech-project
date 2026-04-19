'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Plus, BookOpen, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewLog {
  id: string; application_id: string; round_name: string; interview_date: string;
  interviewer_name?: string; format: string; questions?: string; feedback?: string;
  outcome: string; company_name: string; role: string;
}

interface Application { id: string; company_name: string; role: string; }

const OUTCOME_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500' },
  passed: { label: 'Passed', icon: CheckCircle, color: 'text-green-500' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-500' },
  no_show: { label: 'No Show', icon: XCircle, color: 'text-gray-400' },
};

export default function InterviewsPage() {
  const [logs, setLogs] = useState<InterviewLog[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InterviewLog | null>(null);
  const [form, setForm] = useState({ application_id: '', round_name: '', interview_date: '', interviewer_name: '', format: 'video', questions: '', feedback: '', outcome: 'pending' });

  const fetchLogs = () => api.get('/api/interviews').then((r) => setLogs(r.data));
  useEffect(() => {
    fetchLogs();
    api.get('/api/applications').then((r) => setApps(r.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/interviews/${editing.id}`, form);
        toast({ title: 'Interview log updated' });
      } else {
        await api.post('/api/interviews', form);
        toast({ title: 'Interview log added!' });
      }
      setShowForm(false); setEditing(null);
      setForm({ application_id: '', round_name: '', interview_date: '', interviewer_name: '', format: 'video', questions: '', feedback: '', outcome: 'pending' });
      fetchLogs();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as { response?: { data?: { error?: string } } })?.response?.data?.error, variant: 'destructive' });
    }
  };

  const openEdit = (log: InterviewLog) => {
    setEditing(log);
    setForm({ application_id: log.application_id, round_name: log.round_name, interview_date: log.interview_date?.split('T')[0] || '', interviewer_name: log.interviewer_name || '', format: log.format, questions: log.questions || '', feedback: log.feedback || '', outcome: log.outcome });
    setShowForm(true);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Logs</h1>
            <p className="text-gray-500 mt-1">Track every interview round and outcome</p>
          </div>
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Log Interview
          </Button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No interview logs yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const outcomeConfig = OUTCOME_CONFIG[log.outcome as keyof typeof OUTCOME_CONFIG];
              const OutcomeIcon = outcomeConfig?.icon || Clock;
              return (
                <Card key={log.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(log)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{log.round_name}</p>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{log.format}</span>
                        </div>
                        <p className="text-sm text-gray-500">{log.company_name} — {log.role}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          {log.interview_date && (
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(log.interview_date), 'MMM d, yyyy')}</span>
                          )}
                          {log.interviewer_name && (
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.interviewer_name}</span>
                          )}
                        </div>
                        {log.feedback && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{log.feedback}</p>}
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${outcomeConfig?.color}`}>
                        <OutcomeIcon className="w-4 h-4" />
                        <span>{outcomeConfig?.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Interview Log' : 'Log Interview'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Application *</label>
              <Select value={form.application_id} onValueChange={(v) => setForm({ ...form, application_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select application" /></SelectTrigger>
                <SelectContent>
                  {apps.map((a) => <SelectItem key={a.id} value={a.id}>{a.company_name} — {a.role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Round Name *</label>
                <Input required value={form.round_name} onChange={(e) => setForm({ ...form, round_name: e.target.value })} placeholder="Technical Round 1" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Format</label>
                <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['phone', 'video', 'onsite', 'technical', 'hr', 'other'].map((f) => <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input type="date" value={form.interview_date} onChange={(e) => setForm({ ...form, interview_date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Outcome</label>
                <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['pending', 'passed', 'failed', 'no_show'].map((o) => <SelectItem key={o} value={o}>{o.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Interviewer Name</label>
              <Input value={form.interviewer_name} onChange={(e) => setForm({ ...form, interviewer_name: e.target.value })} placeholder="John Smith" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Questions Asked</label>
              <textarea value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="What questions were asked?" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Feedback / Notes</label>
              <textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="How did it go?" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Save Log'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </DashboardLayout>
  );
}
