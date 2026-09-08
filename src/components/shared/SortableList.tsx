import { useState, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "../../utils/cn.util";

interface SortableItemProps {
  id: string;
  children: (dragHandle: ReactNode) => ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandle = (
    <span
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none active:cursor-grabbing"
      style={{ color: "rgba(0,0,0,0.35)" }}
    >
      <GripVertical size={16} />
    </span>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {children(dragHandle)}
    </div>
  );
};

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (newOrder: T[]) => void;
  renderItem: (item: T, dragHandle: ReactNode, index: number) => ReactNode;
  className?: string;
}

// Drag-and-drop only — the admin never sees or types a displayOrder number.
// Dropping an item recomputes a fresh sequential order from its new
// position; the caller is responsible for turning that into the
// {id, displayOrder}[] payload the reorder API expects.
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
}: SortableListProps<T>) {
  // Rendered order lives in local state, updated synchronously the instant
  // a drop happens — `items` itself only updates a tick or two later, once
  // the reorder mutation's optimistic cache write lands, and rendering
  // against that stale prop in the meantime is what caused tiles to snap
  // back to their pre-drag slot for a frame (the "comes from above" glitch).
  // Whenever the parent hands us a genuinely new `items` reference (React
  // Query's cache writes are always immutable, so this covers the reorder
  // confirmation as well as any unrelated upstream change — e.g. a nested
  // module's video order changing, which doesn't reorder the modules list
  // itself), we adopt it here during render rather than in an effect, so
  // there's no extra render's delay before it's reflected.
  const [localItems, setLocalItems] = useState(items);
  const [lastSeenItems, setLastSeenItems] = useState(items);

  if (items !== lastSeenItems) {
    setLastSeenItems(items);
    setLocalItems(items);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localItems.findIndex((i) => i.id === active.id);
    const newIndex = localItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(reordered);
    onReorder(reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={cn("flex flex-col gap-2", className)}>
          {localItems.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {(dragHandle) => renderItem(item, dragHandle, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
