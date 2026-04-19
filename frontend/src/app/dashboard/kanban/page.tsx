'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import ApplicationForm from '@/components/applications/ApplicationForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function KanbanPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const { fetchApplications } = useAppStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications(search ? { search } : {});
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Pipeline</h1>
            <p className="text-gray-500 mt-1">Drag and drop to update status</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Application
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-sm">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company or role..." />
          <Button type="submit" variant="outline" size="icon"><Search className="w-4 h-4" /></Button>
        </form>
        <KanbanBoard />
      </div>
      <ApplicationForm open={showForm} onClose={() => setShowForm(false)} />
    </DashboardLayout>
  );
}
