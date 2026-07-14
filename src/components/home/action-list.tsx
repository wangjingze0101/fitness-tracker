"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ActionWithToday } from "@/types";
import { ActionCard } from "./action-card";

interface ActionListProps {
  actions: ActionWithToday[];
  onReorder: (orderedIds: string[]) => void;
  onEdit: (action: ActionWithToday) => void;
  onDelete: (id: string) => void;
  onQuickAdd: (action: ActionWithToday) => void;
}

function SortableItem({ action, index, children }: { action: ActionWithToday; index: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-50 opacity-80" : ""}`}
    >
      {/* 拖拽手柄（左侧小区域） */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-none"
        aria-label="拖拽排序"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
      </button>
      <div className="pl-6">
        {children}
      </div>
    </div>
  );
}

export function ActionList({ actions, onReorder, onEdit, onDelete, onQuickAdd }: ActionListProps) {
  const [items, setItems] = useState(actions);

  // 当外部 actions 变化时同步
  if (JSON.stringify(actions.map(a => a.id)) !== JSON.stringify(items.map(i => i.id))) {
    setItems(actions);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = [...items];
    const [removed] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, removed);

    setItems(reordered);
    onReorder(reordered.map((a) => a.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((action, i) => (
            <SortableItem key={action.id} action={action} index={i}>
              <ActionCard action={action} index={i} onEdit={onEdit} onDelete={onDelete} onQuickAdd={onQuickAdd} />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
