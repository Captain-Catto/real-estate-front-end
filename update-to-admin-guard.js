const fs = require("fs");
const path = require("path");

// Danh sách các trang cần cập nhật
const adminPages = [
  "src/app/admin/cai-dat-header/page.tsx",
  "src/app/admin/cau-hinh-sidebar/page.tsx",
  "src/app/admin/employee-permissions/page.tsx",
  "src/app/admin/news/create/page.tsx",
  "src/app/admin/quan-ly-chu-dau-tu/[id]/page.tsx",
  "src/app/admin/quan-ly-chu-dau-tu/page.tsx",
  "src/app/admin/quan-ly-danh-muc/page.tsx",
  "src/app/admin/quan-ly-dia-chinh/page.tsx",
  "src/app/admin/quan-ly-dien-tich/page.tsx",
  "src/app/admin/quan-ly-du-an/[id]/page.tsx",
  "src/app/admin/quan-ly-du-an/page.tsx",
  "src/app/admin/quan-ly-gia-tin-dang/page.tsx",
  "src/app/admin/quan-ly-gia/page.tsx",
  "src/app/admin/quan-ly-giao-dich/page.tsx",
  "src/app/admin/quan-ly-lien-he/page.tsx",
  "src/app/admin/quan-ly-nguoi-dung/[userId]/page.tsx",
  "src/app/admin/quan-ly-nguoi-dung/page.tsx",
  "src/app/admin/quan-ly-tin-dang/[id]/page.tsx",
  "src/app/admin/quan-ly-tin-dang/page.tsx",
  "src/app/admin/quan-ly-tin-tuc/[id]/page.tsx",
  "src/app/admin/quan-ly-tin-tuc/page.tsx",
  "src/app/admin/quan-ly-tin-tuc/tao-moi/page.tsx",
  "src/app/admin/thong-ke/page.tsx",
];

// Mapping permissions cho từng trang
const pagePermissions = {
  "cai-dat-header": ["PERMISSIONS.SETTINGS.EDIT"],
  "cau-hinh-sidebar": ["PERMISSIONS.SETTINGS.EDIT"],
  "employee-permissions": ["PERMISSIONS.USER.CHANGE_ROLE"],
  "news/create": ["PERMISSIONS.NEWS.CREATE"],
  "quan-ly-chu-dau-tu": ["PERMISSIONS.PROJECT.VIEW"],
  "quan-ly-danh-muc": [
    "PERMISSIONS.SETTINGS.MANAGE_CATEGORIES",
    "PERMISSIONS.NEWS.MANAGE_CATEGORIES",
  ],
  "quan-ly-dia-chinh": ["PERMISSIONS.LOCATION.MANAGE"],
  "quan-ly-dien-tich": ["PERMISSIONS.LOCATION.MANAGE_AREAS"],
  "quan-ly-du-an": ["PERMISSIONS.PROJECT.VIEW"],
  "quan-ly-gia-tin-dang": ["PERMISSIONS.SETTINGS.VIEW"],
  "quan-ly-gia": ["PERMISSIONS.LOCATION.MANAGE_PRICES"],
  "quan-ly-giao-dich": ["PERMISSIONS.TRANSACTION.VIEW"],
  "quan-ly-lien-he": ["PERMISSIONS.USER.VIEW"],
  "quan-ly-nguoi-dung": ["PERMISSIONS.USER.VIEW"],
  "quan-ly-tin-dang": ["PERMISSIONS.POST.VIEW"],
  "quan-ly-tin-tuc": ["PERMISSIONS.NEWS.VIEW"],
  "thong-ke": ["PERMISSIONS.STATISTICS.VIEW"],
};

function getPageKey(filePath) {
  // Extract page key from file path
  const match = filePath.match(/admin\/([^\/\[\]]+)/);
  if (match) {
    return match[1];
  }
  return null;
}

function updateFile(filePath) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");

  // Nếu file đã sử dụng AdminGuard, bỏ qua
  if (content.includes("AdminGuard")) {
    console.log(`✅ Already using AdminGuard: ${filePath}`);
    return;
  }

  const pageKey = getPageKey(filePath);
  const permissions = pagePermissions[pageKey] || [
    "PERMISSIONS.DASHBOARD.VIEW",
  ];

  let hasChanges = false;

  // 1. Thay thế import PagePermissionGuard bằng AdminGuard
  if (content.includes("PagePermissionGuard")) {
    content = content.replace(
      /import\s*{\s*PagePermissionGuard[^}]*}\s*from\s*["'][^"']+["'];?\s*/g,
      'import AdminGuard from "@/components/auth/AdminGuard";'
    );
    hasChanges = true;
  }

  // 2. Loại bỏ AdminRoleGuard import nếu có
  if (content.includes("AdminRoleGuard")) {
    content = content.replace(
      /import\s*{\s*AdminRoleGuard[^}]*}\s*from\s*["'][^"']+["'];?\s*/g,
      ""
    );
    hasChanges = true;
  }

  // 3. Thay thế wrapper component
  // Pattern để tìm export default function
  const exportDefaultPattern =
    /export\s+default\s+function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?return\s*\([\s\S]*?<(PagePermissionGuard|AdminRoleGuard)[\s\S]*?<\/\2>[\s\S]*?\);?\s*}/;

  if (exportDefaultPattern.test(content)) {
    // Tìm function name
    const functionMatch = content.match(/export\s+default\s+function\s+(\w+)/);
    if (functionMatch) {
      const functionName = functionMatch[1];
      const internalFunctionName =
        functionName.replace("Protected", "") + "Internal";

      // Đổi tên function hiện tại thành Internal
      content = content.replace(
        new RegExp(`function\\s+${functionName}`, "g"),
        `function ${internalFunctionName}`
      );

      // Tạo wrapper mới với AdminGuard
      const permissionsArray =
        permissions.length === 1
          ? `[${permissions[0]}]`
          : `[${permissions.join(", ")}]`;

      const requireAll =
        permissions.length > 1 && !pageKey?.includes("danh-muc");

      const newWrapper = `
// Wrap component with AdminGuard
export default function ${functionName}() {
  return (
    <AdminGuard 
      permissions={${permissionsArray}}${
        requireAll ? "\n      requireAllPermissions={true}" : ""
      }
    >
      <${internalFunctionName} />
    </AdminGuard>
  );
}`;

      // Thay thế export default function cũ
      content = content.replace(exportDefaultPattern, newWrapper);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
}

console.log("🚀 Starting admin pages update to AdminGuard...\n");

adminPages.forEach(updateFile);

console.log("\n✅ Admin pages update completed!");
