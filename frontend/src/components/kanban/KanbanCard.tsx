'use client';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building2, MapPin, Calendar, ExternalLink, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { cn, PRIORITY_CONFIG } from '@/lib/utils';
import { Application, useAppStore } from '@/store/useAppStore';
import ApplicationForm from '@/components/applications/ApplicationForm';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Props { application: Application; isDragging?: boolean; }

export default function KanbanCard({ application, isDragging }: Props) {
  const { deleteApplication } = useAppStore();
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: application.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleDelete = async () => {
    if (!confirm('Delete this application?')) return;
    await deleteApplication(application.id);
    toast({ title: 'Application deleted' });
  };

  const priorityConfig = PRIORITY_CONFIG[application.priority as keyof typeof PRIORITY_CONFIG];

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}
        className={cn('bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing group',
          (isSortableDragging || isDragging) && 'opacity-50 rotate-2 scale-105 shadow-xl')}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{application.company_name}</p>
            <p className="text-xs text-gray-500 truncate">{application.role}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {application.location && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3" /><span className="truncate">{application.location}</span>
            </div>
          )}
          {application.applied_date && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(application.applied_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-wrap gap-1">
            {application.tags?.slice(0, 2).map((tag) => (
              <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: tag.color }}>{tag.name}</span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {application.priority === 'high' && <AlertCircle className={cn('w-3 h-3', priorityConfig.color)} />}
            {application.job_url && (
              <a href={application.job_url} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-indigo-500">
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {application.interview_rounds?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">{application.interview_rounds.length} interview round(s)</p>
          </div>
        )}
      </div>
      <ApplicationForm open={editing} onClose={() => setEditing(false)} application={application} />
    </>
  );
}
