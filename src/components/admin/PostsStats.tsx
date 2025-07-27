import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface PostsStatsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    expired: number;
    deleted: number; // Add deleted count
  };
  onFilterChange: (filters: { status?: string }) => void;
}

export default function PostsStats({ stats, onFilterChange }: PostsStatsProps) {
  const handleStatClick = (status: string) => {
    onFilterChange({ status });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* Total Posts */}
      <div
        onClick={() => handleStatClick("all")}
        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-100">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">Tổng tin đăng</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Active Posts */}
      <div
        onClick={() => handleStatClick("active")}
        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-green-100">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">Đang hiển thị</p>
            <p className="text-xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Pending Posts */}
      <div
        onClick={() => handleStatClick("pending")}
        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-yellow-100">
            <ClockIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">Chờ duyệt</p>
            <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Rejected Posts */}
      <div
        onClick={() => handleStatClick("rejected")}
        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-red-100">
            <XCircleIcon className="w-5 h-5 text-red-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">Bị từ chối</p>
            <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Expired Posts */}
      <div
        onClick={() => handleStatClick("expired")}
        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-gray-100">
            <ClockIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">Đã hết hạn</p>
            <p className="text-xl font-bold text-gray-900">{stats.expired}</p>
          </div>
        </div>
      </div>

      {/* Deleted Posts */}
      <div
        onClick={() => handleStatClick("deleted")}
        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-orange-100">
            <TrashIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">Đã xoá mềm</p>
            <p className="text-xl font-bold text-gray-900">{stats.deleted}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
