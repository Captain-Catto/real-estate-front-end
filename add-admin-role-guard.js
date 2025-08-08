const fs = require("fs");
const path = require("path");

// Danh sách các file cần thêm AdminRoleGuard
const importantAdminPages = [
  "src/app/admin/employee-permissions/page.tsx",
  "src/app/admin/quan-ly-nguoi-dung/page.tsx",
  "src/app/admin/quan-ly-nguoi-dung/[userId]/page.tsx",
  "src/app/admin/quan-ly-tin-dang/page.tsx",
  "src/app/admin/quan-ly-tin-dang/[id]/page.tsx",
  "src/app/admin/quan-ly-tin-tuc/page.tsx",
  "src/app/admin/quan-ly-tin-tuc/[id]/page.tsx",
  "src/app/admin/quan-ly-tin-tuc/tao-moi/page.tsx",
  "src/app/admin/quan-ly-giao-dich/page.tsx",
  "src/app/admin/thong-ke/page.tsx",
];

function addAdminRoleGuard(filePath) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File không tồn tại: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");

  // Kiểm tra xem đã có AdminRoleGuard chưa
  if (content.includes("AdminRoleGuard")) {
    console.log(`✅ File đã có AdminRoleGuard: ${filePath}`);
    return;
  }

  let updated = false;

  // Thêm import AdminRoleGuard
  if (
    content.includes("import { PagePermissionGuard }") &&
    !content.includes("AdminRoleGuard")
  ) {
    content = content.replace(
      /import { PagePermissionGuard } from "@\/components\/auth\/ProtectionGuard";/,
      'import { PagePermissionGuard } from "@/components/auth/ProtectionGuard";\nimport { AdminRoleGuard } from "@/components/auth/AdminRoleGuard";'
    );
    updated = true;
  }

  // Wrap PagePermissionGuard với AdminRoleGuard
  if (content.includes("<PagePermissionGuard")) {
    // Tìm pattern export default function và wrap nó
    const exportPattern =
      /export default function (\w+)\(\) \{\s*return \(\s*<PagePermissionGuard([^>]*(?:\n[^>]*)*?)>\s*(.*?)\s*<\/PagePermissionGuard>\s*\);\s*\}/s;

    if (exportPattern.test(content)) {
      content = content.replace(
        exportPattern,
        (match, functionName, guardProps, innerContent) => {
          return `export default function ${functionName}() {
  return (
    <AdminRoleGuard>
      <PagePermissionGuard${guardProps}>
        ${innerContent}
      </PagePermissionGuard>
    </AdminRoleGuard>
  );
}`;
        }
      );
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✅ Đã thêm AdminRoleGuard vào: ${filePath}`);
  } else {
    console.log(`⚠️  Không thể cập nhật: ${filePath}`);
  }
}

// Chạy update cho tất cả các file quan trọng
console.log(
  "🚀 Bắt đầu thêm AdminRoleGuard vào các trang admin quan trọng...\n"
);

importantAdminPages.forEach((filePath) => {
  addAdminRoleGuard(filePath);
});

console.log("\n✨ Hoàn thành việc thêm AdminRoleGuard!");
