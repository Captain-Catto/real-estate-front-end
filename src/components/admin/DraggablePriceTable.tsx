import React from "react";
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

interface Price {
  _id: string;
  id: string;
  name: string;
  slug: string;
  type: "ban" | "cho-thue" | "project";
  minValue?: number;
  maxValue?: number;
  order: number;
  isActive: boolean;
}

interface SortableRowProps {
  price: Price;
  onEdit: (price: Price) => void;
  onDelete: (price: Price) => void;
  onToggleStatus: (price: Price) => void;
  formatPrice: (min?: number, max?: number, type?: "ban" | "cho-thue" | "project") => string;
}

function SortableRow({
  price,
  onEdit,
  onDelete,
  onToggleStatus,
  formatPrice,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: price._id });

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
            <div className="text-sm font-medium text-gray-900">
              {price.name}
            </div>
            <div className="text-sm text-gray-500">{price.slug}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
            price.type === "ban"
              ? "bg-green-100 text-green-800"
              : price.type === "cho-thue"
              ? "bg-orange-100 text-orange-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {price.type === "ban" && "🏠"}
          {price.type === "cho-thue" && "🔑"}
          {price.type === "project" && "🏗️"}
          {price.type === "ban" ? "Mua bán" : price.type === "cho-thue" ? "Cho thuê" : "Dự án"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatPrice(price.minValue, price.maxValue, price.type)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {price.order}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleStatus(price)}
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
            price.isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {price.isActive ? "👁️" : "🙈"}
          {price.isActive ? "Hoạt động" : "Ẩn"}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(price)}
            className="text-blue-600 hover:text-blue-900"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(price)}
            className="text-red-600 hover:text-red-900"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}

interface DraggablePriceTableProps {
  prices: Price[];
  onEdit: (price: Price) => void;
  onDelete: (price: Price) => void;
  onToggleStatus: (price: Price) => void;
  onReorder: (newOrder: Price[]) => void;
  formatPrice: (min?: number, max?: number, type?: "ban" | "cho-thue" | "project") => string;
}

export default function DraggablePriceTable({
  prices,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  formatPrice,
}: DraggablePriceTableProps) {
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
      const oldIndex = prices.findIndex((item) => item._id === active.id);
      const newIndex = prices.findIndex((item) => item._id === over.id);

      const newOrder = arrayMove(prices, oldIndex, newIndex);
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
                Loại giao dịch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khoảng giá
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
            items={prices.map((p) => p._id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody className="bg-white divide-y divide-gray-200">
              {prices.map((price) => (
                <SortableRow
                  key={price._id}
                  price={price}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  formatPrice={formatPrice}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  );
}
