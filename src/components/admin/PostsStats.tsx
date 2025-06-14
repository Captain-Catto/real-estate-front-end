import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  StarIcon,
  TrophyIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

interface PostsStatsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    expired: number;
    vip: number;
    premium: number;
    normal: number;
  };
  onFilterChange: (filters: any) => void;
}

export default function PostsStats({ stats, onFilterChange }: PostsStatsProps) {
  const handleStatClick = (status: string) => {
    onFilterChange({ status });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Posts */}
      <div
        onClick={() => handleStatClick("all")}
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-blue-100">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tổng tin đăng</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Active Posts */}
      <div
        onClick={() => handleStatClick("active")}
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-green-100">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Đang hiển thị</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Pending Posts */}
      <div
        onClick={() => handleStatClick("pending")}
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-yellow-100">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Rejected Posts */}
      <div
        onClick={() => handleStatClick("rejected")}
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-red-100">
            <XCircleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Bị từ chối</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Priority Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-purple-100">
            <TrophyIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tin VIP</p>
            <p className="text-2xl font-bold text-gray-900">{stats.vip}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-orange-100">
            <StarIcon className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tin Premium</p>
            <p className="text-2xl font-bold text-gray-900">{stats.premium}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-gray-100">
            <DocumentIcon className="w-6 h-6 text-gray-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tin thường</p>
            <p className="text-2xl font-bold text-gray-900">{stats.normal}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-gray-100">
            <ClockIcon className="w-6 h-6 text-gray-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
            <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
