'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore, Application } from '@/store/useAppStore';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  application?: Application | null;
}

export default function ApplicationForm({ open, onClose, application }: Props) {
  const { addApplication, updateApplication } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [resumes, setResumes] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<{
  company_name: string;
  role: string;
  job_url: string;
  location: string;
  salary_range: string;
  status: string;
  priority: string;
  applied_date: string;
  deadline: string;
  resume_id: string;
  notes: string;
  tags: string[];
}>({
  company_name: '',
  role: '',
  job_url: '',
  location: '',
  salary_range: '',
  status: 'applied',
  priority: 'medium',
  applied_date: new Date().toISOString().split('T')[0],
  deadline: '',
  resume_id: '',
  notes: '',
  tags: [],
});

  useEffect(() => {
    if (application) {
      setForm({
        company_name: application.company_name || '',
        role: application.role || '',
        job_url: application.job_url || '',
        location: application.location || '',
        salary_range: application.salary_range || '',
        status: application.status || 'applied',
        priority: application.priority || 'medium',
        applied_date: application.applied_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        deadline: application.deadline?.split('T')[0] || '',
        resume_id: application.resume_id || '',
        notes: application.notes || '',
        tags: application.tags?.map((t) => t.id) || [],
      });
    } else {
      setForm({ company_name: '', role: '', job_url: '', location: '', salary_range: '', status: 'applied', priority: 'medium', applied_date: new Date().toISOString().split('T')[0], deadline: '', resume_id: '', notes: '', tags: [] });
    }
  }, [application, open]);

  useEffect(() => {
    api.get('/api/tags').then((r) => setTags(r.data)).catch(() => {});
    api.get('/api/resumes').then((r) => setResumes(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fixedForm = {
  ...form,
  tags: (form.tags as string[]).map((tag) => ({
    id: tag,
    name: tag,
    color: "#10b981"
  }))
};

if (application) {
  await updateApplication(application.id, fixedForm);
  toast({ title: 'Application updated' });
} else {
  await addApplication(fixedForm);
  toast({ title: 'Application added!' });
}
      
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Something went wrong';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (id: string) => {
    setForm((f) => ({ ...f, tags: f.tags.includes(id) ? f.tags.filter((t) => t !== id) : [...f.tags, id] }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application ? 'Edit Application' : 'Add New Application'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Company Name *</label>
              <Input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Google, Meta, etc." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Role *</label>
              <Input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Software Engineer Intern" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['applied', 'oa', 'interview', 'offer', 'rejected', 'withdrawn'].map((s) => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Applied Date</label>
              <Input type="date" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Deadline</label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / NYC" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Salary Range</label>
              <Input value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} placeholder="$80k - $120k" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Job URL</label>
            <Input type="url" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} placeholder="https://..." />
          </div>
          {resumes.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1 block">Resume Used</label>
              <Select value={form.resume_id} onValueChange={(v) => setForm({ ...form, resume_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select resume" /></SelectTrigger>
                <SelectContent>
                  {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${form.tags.includes(tag.id) ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600'}`}
                    style={form.tags.includes(tag.id) ? { backgroundColor: tag.color, borderColor: tag.color } : {}}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Any notes about this application..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : application ? 'Update' : 'Add Application'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
