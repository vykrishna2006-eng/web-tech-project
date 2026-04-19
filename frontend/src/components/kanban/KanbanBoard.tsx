'use client';
import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppStore, Application } from '@/store/useAppStore';
import { STATUS_CONFIG } from '@/lib/utils';
import KanbanCard from './KanbanCard';
import KanbanColumn from './KanbanColumn';
import { getSocket } from '@/lib/socket';

const COLUMNS = ['applied', 'oa', 'interview', 'offer', 'rejected'] as const;

export default function KanbanBoard() {
  const { applications, fetchApplications, reorderApplications, setApplications } = useAppStore();
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    fetchApplications();
    const socket = getSocket();
    socket.on('application:created', (app: Application) => {
      setApplications([app, ...applications]);
    });
    socket.on('application:updated', (app: Application) => {
      setApplications(applications.map((a) => a.id === app.id ? { ...a, ...app } : a));
    });
    socket.on('application:deleted', ({ id }: { id: string }) => {
      setApplications(applications.filter((a) => a.id !== id));
    });
    return () => { socket.off('application:created'); socket.off('application:updated'); socket.off('application:deleted'); };
  }, []);

  const getColumnApps = (status: string) =>
    applications.filter((a) => a.status === status).sort((a, b) => a.position_order - b.position_order);

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    setActiveApp(app || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);
    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    const overId = over.id as string;
    const newStatus = COLUMNS.includes(overId as typeof COLUMNS[number]) ? overId : applications.find((a) => a.id === overId)?.status;
    if (!newStatus || newStatus === activeApp.status) return;

    const columnApps = getColumnApps(newStatus);
    const updates = [
      { id: activeApp.id, status: newStatus, position_order: columnApps.length },
      ...columnApps.map((a, i) => ({ id: a.id, status: newStatus, position_order: i })),
    ];

    setApplications(applications.map((a) => a.id === activeApp.id ? { ...a, status: newStatus } : a));
    await reorderApplications(updates);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
        {COLUMNS.map((status) => {
          const config = STATUS_CONFIG[status];
          const colApps = getColumnApps(status);
          return (
            <KanbanColumn key={status} id={status} title={config.label} count={colApps.length} dotColor={config.dot}>
              <SortableContext items={colApps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                {colApps.map((app) => <KanbanCard key={app.id} application={app} />)}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeApp && <KanbanCard application={activeApp} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
