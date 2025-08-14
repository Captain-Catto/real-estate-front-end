// src/app/admin/quan-ly-tin-dang/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminPostDetail from "@/components/admin/AdminPostDetail";
import { adminPostsService, Post } from "@/services/postsService";
import EditPostModal from "@/components/modals/EditPostModal/EditPostModal";
import { useEditPostModal } from "@/hooks/useEditPostModal";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";
function AdminPostDetailPageInternalInternal() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editPostModal = useEditPostModal();

  console.log("AdminPostDetailPage params:", params);
  console.log("AdminPostDetailPage post:", post);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (postId: string) => {
    setLoading(true);
    try {
      const postData = await adminPostsService.getPostById(postId);
      if (postData) {
        console.log("Fetched post data:", postData);
        setPost(postData);
      } else {
        setError("Không tìm thấy bài viết");
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await adminPostsService.approvePost(postId);
      await fetchPost(postId);
      alert("Đã duyệt tin đăng thành công!");
    } catch (err) {
      console.error("Error approving post:", err);
      alert("Có lỗi xảy ra khi duyệt tin đăng!");
    }
  };

  const handleRejectPost = async (postId: string, reason: string) => {
    try {
      if (!postId || postId.trim() === "") {
        throw new Error("ID tin đăng không hợp lệ");
      }

      await adminPostsService.rejectPost(postId, reason);
      await fetchPost(postId);
      alert("Đã từ chối tin đăng!");
    } catch (err) {
      console.error("Error rejecting post:", err);
      alert(
        "Có lỗi xảy ra khi từ chối tin đăng: " +
          (err instanceof Error ? err.message : "Lỗi không xác định")
      );
    }
  };

  const handleEditPost = () => {
    if (!post) return;

    // Convert Post to format expected by EditPostModal
    const editPost = {
      _id: post._id,
      title: post.title,
      description: post.description,
      type: post.type,
      status: post.status,
      category: post.category,
      location: post.location,
      area: post.area,
      price: post.price.toString(),
      currency: post.currency || "VND",
      legalDocs: post.legalDocs,
      furniture: post.furniture,
      bedrooms: post.bedrooms,
      bathrooms: post.bathrooms,
      floors: post.floors,
      houseDirection: post.houseDirection,
      balconyDirection: post.balconyDirection,
      roadWidth: post.roadWidth,
      frontWidth: post.frontWidth,
      contactName: post.author?.username || "",
      email: post.author?.email || "",
      phone: "", // Post interface doesn't have phone field
      images: post.images || [],
      project: post.project || "",
    };

    editPostModal.open(editPost);
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      await adminPostsService.updatePostStatus(postId, newStatus);
      await fetchPost(postId);

      // Custom message based on status change
      let message = `Đã thay đổi trạng thái tin đăng thành công!`;
      if (newStatus === "pending") {
        message = `Đã khôi phục tin đăng và chuyển về trạng thái chờ duyệt!`;
      } else if (newStatus === "deleted") {
        message = `Đã chuyển tin đăng vào thùng rác!`;
      } else if (newStatus === "active") {
        message = `Đã duyệt tin đăng thành công!`;
      } else if (newStatus === "rejected") {
        message = `Đã từ chối tin đăng!`;
      }

      alert(message);
    } catch (err) {
      console.error("Error updating post status:", err);
      alert("Có lỗi xảy ra khi thay đổi trạng thái tin đăng!");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa vĩnh viễn tin đăng này? Hành động này không thể hoàn tác!"
      )
    ) {
      try {
        await adminPostsService.deletePost(postId);
        alert("Đã xóa vĩnh viễn tin đăng!");
        router.push("/admin/quan-ly-tin-dang");
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Có lỗi xảy ra khi xóa tin đăng!");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error || "Không tìm thấy bài viết"}
              </h2>
              <button
                onClick={() => router.push("/admin/quan-ly-tin-dang")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Quay lại danh sách
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <AdminPostDetail
            post={post}
            onApprove={handleApprovePost}
            onReject={handleRejectPost}
            onEdit={handleEditPost}
            onStatusChange={handleStatusChange}
            onDelete={handleDeletePost}
            onBack={() => router.push("/admin/quan-ly-tin-dang")}
          />
        </main>
      </div>

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={editPostModal.isOpen}
        onClose={editPostModal.close}
        currentStep={editPostModal.currentStep}
        editingPost={editPostModal.editingPost}
        formData={editPostModal.formData}
        selectedImages={editPostModal.selectedImages}
        selectedPackage={editPostModal.selectedPackage}
        nextStep={editPostModal.nextStep}
        prevStep={editPostModal.prevStep}
        updateFormData={
          editPostModal.updateFormData as (
            field: string | number | symbol,
            value: string | number | undefined
          ) => void
        }
        setSelectedImages={editPostModal.setSelectedImages}
        setSelectedPackage={editPostModal.setSelectedPackage}
        handleBasicSubmit={editPostModal.handleBasicSubmit}
        handleImageSubmit={editPostModal.handleImageSubmit}
        handlePackageSubmit={editPostModal.handlePackageSubmit}
        existingImages={editPostModal.existingImages}
        updateExistingImages={editPostModal.updateExistingImages}
        provinces={editPostModal.provinces}
        wards={editPostModal.wards}
        locationLoading={editPostModal.locationLoading}
      />
    </div>
  );
}

// Wrap component with AdminGuard
export default function AdminPostDetailPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.POST.VIEW]}>
      <AdminPostDetailPageInternalInternal />
    </AdminGuard>
  );
}
