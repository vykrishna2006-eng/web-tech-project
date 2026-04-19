'use client';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface Props {
  id: string;
  title: string;
  count: number;
  dotColor: string;
  children: React.ReactNode;
}

export default function KanbanColumn({ id, title, count, dotColor, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn('w-2.5 h-2.5 rounded-full', dotColor)} />
        <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
        <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div ref={setNodeRef} className={cn('min-h-[200px] rounded-xl p-2 space-y-2 transition-colors', isOver ? 'bg-indigo-50 border-2 border-dashed border-indigo-300' : 'bg-gray-100')}>
        {children}
        {count === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
