/**
 * Các hằng số cho phép hạn trong hệ thống
 * Sử dụng để tạo tính nhất quán trong mã nguồn
 */

export const PERMISSIONS = {
  // Quản lý người dùng
  USER: {
    VIEW: "view_users",
    CREATE: "create_user",
    EDIT: "edit_user",
    DELETE: "delete_user",
    CHANGE_STATUS: "change_user_status",
    CHANGE_ROLE: "change_user_role",
    RESET_PASSWORD: "reset_user_password",
    APPROVE: "approve_user",
  },

  // Quản lý bài đăng
  POST: {
    VIEW: "view_posts",
    EDIT: "edit_post",
    DELETE: "delete_post",
    APPROVE: "approve_post",
    REJECT: "reject_post",
    VIEW_DELETED: "view_deleted_posts",
    RESTORE: "restore_post",
  },

  // Quản lý dự án
  PROJECT: {
    VIEW: "view_projects",
    CREATE: "create_project",
    EDIT: "edit_project",
    DELETE: "delete_project",
  },

  // Quản lý tin tức
  NEWS: {
    VIEW: "view_news",
    CREATE: "create_news",
    EDIT: "edit_news",
    DELETE: "delete_news",
    FEATURE: "feature_news",
    PUBLISH: "publish_news",
    MANAGE_CATEGORIES: "manage_news_categories",
  },

  // Quản lý giao dịch
  TRANSACTION: {
    VIEW: "view_transactions",
  },

  // Thống kê
  STATISTICS: {
    VIEW: "view_statistics",
    EXPORT: "export_statistics",
    GENERATE_REPORTS: "generate_reports",
    VIEW_FINANCIAL: "view_financial_stats",
  },

  // Dashboard - Trang chính admin
  DASHBOARD: {
    VIEW: "view_dashboard",
  },

  // Cài đặt
  SETTINGS: {
    VIEW: "view_settings",
    EDIT: "edit_settings",
    MANAGE_SIDEBAR: "manage_sidebar",
    MANAGE_HEADER: "manage_header",
    MANAGE_CATEGORIES: "manage_categories",
  },

  // Quản lý địa điểm
  LOCATION: {
    VIEW: "view_locations",
    MANAGE: "manage_locations",
    MANAGE_AREAS: "manage_areas",
    MANAGE_PRICES: "manage_prices",
  },

  // Quản lý liên hệ khách hàng
  CONTACT: {
    VIEW: "view_contacts",
    EDIT: "edit_contacts",
    DELETE: "delete_contacts",
    VIEW_ALL: "view_all_contacts", // Admin có thể xem tất cả contacts
    HARD_DELETE: "hard_delete_contacts", // Admin có thể xóa vĩnh viễn
  },
};

/**
 * Nhóm các quyền theo chức năng - phân loại
 * Sử dụng trong giao diện quản lý quyền
 */
export const PERMISSION_GROUPS = {
  users: Object.values(PERMISSIONS.USER),
  posts: Object.values(PERMISSIONS.POST),
  projects: Object.values(PERMISSIONS.PROJECT),
  news: Object.values(PERMISSIONS.NEWS),
  transactions: Object.values(PERMISSIONS.TRANSACTION),
  statistics: Object.values(PERMISSIONS.STATISTICS),
  dashboard: Object.values(PERMISSIONS.DASHBOARD),
  settings: Object.values(PERMISSIONS.SETTINGS),
  locations: Object.values(PERMISSIONS.LOCATION),
  contacts: Object.values(PERMISSIONS.CONTACT),
};

/**
 * Map quyền cho từng vai trò trong hệ thống
 * Sử dụng để cấu hình quyền mặc định khi tạo tài khoản mới
 */
export const ROLE_PERMISSIONS = {
  admin: [
    // Admin có tất cả quyền, không cần định nghĩa
  ],
  employee: [
    // USER MANAGEMENT - Full permissions for user management
    PERMISSIONS.USER.VIEW,
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.EDIT,
    PERMISSIONS.USER.DELETE,
    PERMISSIONS.USER.CHANGE_STATUS,
    PERMISSIONS.USER.RESET_PASSWORD,

    // POST MANAGEMENT
    PERMISSIONS.POST.VIEW,
    PERMISSIONS.POST.EDIT,
    PERMISSIONS.POST.APPROVE,
    PERMISSIONS.POST.REJECT,

    // PROJECT MANAGEMENT
    PERMISSIONS.PROJECT.VIEW,
    PERMISSIONS.PROJECT.EDIT,

    // NEWS MANAGEMENT
    PERMISSIONS.NEWS.VIEW,
    PERMISSIONS.NEWS.CREATE,
    PERMISSIONS.NEWS.EDIT,
    PERMISSIONS.NEWS.FEATURE,
    PERMISSIONS.NEWS.PUBLISH,

    // DASHBOARD - Trang chính admin
    PERMISSIONS.DASHBOARD.VIEW,

    // SETTINGS - View access for employees
    PERMISSIONS.SETTINGS.VIEW,

    // LOCATION MANAGEMENT
    PERMISSIONS.LOCATION.VIEW,
  ],
};

/**
 * Map các quyền cần thiết để truy cập trang admin
 */
export const PAGE_REQUIRED_PERMISSIONS = {
  // Dashboard
  "/admin": [PERMISSIONS.DASHBOARD.VIEW],

  // User Management
  "/admin/quan-ly-nguoi-dung": [PERMISSIONS.USER.VIEW],
  "/admin/quan-ly-nguoi-dung/create": [PERMISSIONS.USER.CREATE],
  "/admin/quan-ly-nguoi-dung/edit": [PERMISSIONS.USER.EDIT],

  // Post Management
  "/admin/quan-ly-tin-dang": [PERMISSIONS.POST.VIEW],
  "/admin/quan-ly-tin-dang/edit": [PERMISSIONS.POST.EDIT],

  // Project Management
  "/admin/quan-ly-du-an": [PERMISSIONS.PROJECT.VIEW],
  "/admin/quan-ly-du-an/create": [PERMISSIONS.PROJECT.CREATE],
  "/admin/quan-ly-du-an/edit": [PERMISSIONS.PROJECT.EDIT],

  // News Management
  "/admin/quan-ly-tin-tuc": [PERMISSIONS.NEWS.VIEW],
  "/admin/quan-ly-tin-tuc/create": [PERMISSIONS.NEWS.CREATE],
  "/admin/quan-ly-tin-tuc/edit": [PERMISSIONS.NEWS.EDIT],

  // Transaction Management
  "/admin/quan-ly-giao-dich": [PERMISSIONS.TRANSACTION.VIEW],

  // Statistics
  "/admin/thong-ke": [PERMISSIONS.STATISTICS.VIEW],

  // Settings & Permissions
  "/admin/quan-ly-quyen": [PERMISSIONS.SETTINGS.VIEW],
  "/admin/quan-ly-danh-muc": [PERMISSIONS.SETTINGS.MANAGE_CATEGORIES],
  "/admin/employee-permissions": [
    PERMISSIONS.SETTINGS.VIEW,
    PERMISSIONS.USER.VIEW,
  ],
  "/admin/permissions": [PERMISSIONS.SETTINGS.VIEW],

  // Location & Price Management
  "/admin/quan-ly-vi-tri": [PERMISSIONS.LOCATION.VIEW],
  "/admin/quan-ly-dien-tich": [PERMISSIONS.LOCATION.MANAGE_AREAS],
  "/admin/quan-ly-gia": [PERMISSIONS.LOCATION.MANAGE_PRICES],
  "/admin/quan-ly-gia-tin-dang": [PERMISSIONS.SETTINGS.VIEW],

  // Contact Management
  "/admin/quan-ly-lien-he": [PERMISSIONS.SETTINGS.VIEW],
};

export default PERMISSIONS;
