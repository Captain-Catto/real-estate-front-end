import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Area {
  _id: string;
  id: string;
  name: string;
  slug: string;
  type: "property" | "project";
  minValue: number;
  maxValue: number;
  order: number;
  isActive: boolean;
}

interface SortableRowProps {
  area: Area;
  onEdit: (area: Area) => void;
  onDelete: (area: Area) => void;
  onToggleStatus: (area: Area) => void;
  formatArea: (min: number, max: number) => string;
}

function SortableRow({
  area,
  onEdit,
  onDelete,
  onToggleStatus,
  formatArea,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "bg-gray-50" : "bg-white"}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              className="fill-current"
            >
              <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{area.name}</div>
            <div className="text-sm text-gray-500">{area.slug}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            area.type === "property"
              ? "bg-purple-100 text-purple-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {area.type === "property" ? "Nhà đất" : "Dự án"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatArea(area.minValue, area.maxValue)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {area.order}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleStatus(area)}
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
            area.isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {area.isActive ? "Hoạt động" : "Ẩn"}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(area)}
            className="p-1 text-blue-600 hover:text-blue-900"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(area)}
            className="p-1 text-red-600 hover:text-red-900"
            title="Xóa"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface DraggableAreaTableProps {
  areas: Area[];
  onEdit: (area: Area) => void;
  onDelete: (area: Area) => void;
  onToggleStatus: (area: Area) => void;
  onReorder: (newOrder: Area[]) => void;
  formatArea: (min: number, max: number) => string;
}

export default function DraggableAreaTable({
  areas,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  formatArea,
}: DraggableAreaTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = areas.findIndex((item) => item._id === active.id);
      const newIndex = areas.findIndex((item) => item._id === over.id);

      const newOrder = arrayMove(areas, oldIndex, newIndex);
      onReorder(newOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khoảng diện tích
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thứ tự
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <SortableContext
            items={areas.map((a) => a._id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody className="bg-white divide-y divide-gray-200">
              {areas.map((area) => (
                <SortableRow
                  key={area._id}
                  area={area}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  formatArea={formatArea}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  );
}
