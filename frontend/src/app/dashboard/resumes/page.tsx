'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { FileText, Upload, Trash2, Star, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Resume { id: string; name: string; file_url: string; file_size: number; is_default: boolean; usage_count: string; created_at: string; }

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');

  const fetchResumes = () => api.get('/api/resumes').then((r) => setResumes(r.data));
  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', name || file.name);
    try {
      await api.post('/api/resumes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast({ title: 'Resume uploaded!' });
      setName('');
      fetchResumes();
    } catch (err: unknown) {
      toast({ title: 'Upload failed', description: (err as { response?: { data?: { error?: string } } })?.response?.data?.error, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    await api.delete(`/api/resumes/${id}`);
    toast({ title: 'Resume deleted' });
    fetchResumes();
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Resume Manager</h1>
          <p className="text-gray-500 mt-1">Upload and manage your resumes</p>
        </div>

        {/* Upload */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Upload New Resume</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Resume Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SWE Resume v2" />
              </div>
              <label className={`flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer font-medium text-sm transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload PDF/Word'}
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">Max 5MB. PDF or Word documents only.</p>
          </CardContent>
        </Card>

        {/* List */}
        {resumes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No resumes uploaded yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((r) => (
              <Card key={r.id} className={r.is_default ? 'border-indigo-300 ring-1 ring-indigo-200' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-gray-400">{(r.file_size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    {r.is_default && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    <p>Used in {r.usage_count} applications</p>
                    <p>Uploaded {format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}${r.file_url}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 border border-gray-200 hover:bg-gray-50 text-gray-600 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      <Download className="w-3 h-3" /> View
                    </a>
                    <button onClick={() => handleDelete(r.id)}
                      className="flex items-center justify-center gap-1 border border-red-200 hover:bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Toaster />
    </DashboardLayout>
  );
}
