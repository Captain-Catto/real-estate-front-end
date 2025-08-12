import { Metadata } from "next";
import { Favorites } from "@/components/favorites/Favorites";
import UserSidebar from "@/components/user/UserSidebar";

export const metadata: Metadata = {
  title: "Danh sách yêu thích | Tài khoản",
  description: "Quản lý các bất động sản và dự án bạn quan tâm",
};

export default function UserFavoritesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sortBy =
    typeof searchParams.sort === "string" ? searchParams.sort : "newest";

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

      {/* Main content with sidebar padding */}
      <main className="lg:pl-24 pb-16 lg:pb-0">
        <div className="min-h-screen">
          <Favorites initialSort={sortBy} />
        </div>
      </main>
    </div>
  );
}
