import User from "@/components/user/User";

export default function TongQuanPage() {
  return (
    <main className="container mx-auto px-4 py-8 relative">
      {/* User Sidebar */}
      <User />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="col-span-3 bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold mb-4">Tổng Quan Tài Khoản</h1>
          <p>Chào mừng bạn đến với trang tổng quan tài khoản của bạn!</p>
          {/* Thêm nội dung khác tại đây */}
        </div>
      </div>
    </main>
  );
}
