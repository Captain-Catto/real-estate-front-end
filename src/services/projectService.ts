// Đây là mock, bạn thay thế bằng API thực tế nếu có

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Vinhomes Central Park",
    slug: "vinhomes-central-park",
    address: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM",
    fullLocation: "Bình Thạnh, TP.HCM",
    description: "<p>Dự án cao cấp ven sông Sài Gòn...</p>",
    developer: "Vingroup",
    status: "Đã bàn giao",
    totalUnits: 2800,
    area: "25.5 ha",
    priceRange: "50-120 triệu/m²",
    images: [
      "https://vinhomes.vn/images/vcp1.jpg",
      "https://vinhomes.vn/images/vcp2.jpg",
    ],
    map: {
      lat: 10.7942,
      lng: 106.7201,
    },
    contact: {
      hotline: "18001039",
      email: "info@vinhomes.vn",
    },
    faq: [
      {
        question: "Dự án có những loại căn hộ nào?",
        answer: "Căn hộ 1-4 phòng ngủ, penthouse, shophouse.",
      },
    ],
  },
  // ...thêm dự án khác nếu muốn
];

export const ProjectService = {
  getProjectById: async (id: string) => {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_PROJECTS.find((p) => p.id === id) || null;
  },
  updateProject: async (id: string, data: any) => {
    await new Promise((r) => setTimeout(r, 200));
    // Chỉ mock, không lưu thực tế
    return { success: true };
  },
};
