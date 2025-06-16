// src/services/postsService.ts
export const PostsService = {
  async getPostById(id: string) {
    // Mock data với trạng thái rejected để test
    const mockPost = {
      id: id,
      title: "Bán căn hộ 2PN Vinhomes Central Park Q.Bình Thạnh",
      type: "sale" as const,
      category: "apartment",
      location: "Quận Bình Thạnh, TP.HCM",
      price: "3500000000",
      area: "75",
      author: "Nguyễn Văn A",
      authorPhone: "0901234567",
      authorEmail: "nguyenvana@email.com",
      status: "rejected" as const, // Để test rejection display
      priority: "vip" as const,
      views: 1245,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",

      // Rejection info
      rejectedAt: "2024-01-15T16:45:00Z",
      rejectedBy: "Admin Nguyễn Thị B",
      rejectedReason:
        "Hình ảnh không phù hợp hoặc chất lượng kém. Một số hình ảnh bị mờ và không thể hiện rõ chi tiết của căn hộ.",

      images: [
        "/images/property1.jpg",
        "/images/property2.jpg",
        "/images/property3.jpg",
      ],
      description: `Căn hộ cao cấp tại Vinhomes Central Park với view sông tuyệt đẹp.

Thông tin chi tiết:
- 2 phòng ngủ, 2 phòng tắm
- Tầng cao, view sông Sài Gòn
- Đầy đủ nội thất cao cấp
- Bàn giao ngay`,
    };

    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockPost;
  },

  async approvePost(postId: string) {
    console.log(`Approving post: ${postId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  async rejectPost(postId: string, reason: string) {
    console.log(`Rejecting post: ${postId} with reason: ${reason}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  },
};
