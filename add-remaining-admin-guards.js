const fs = require("fs");
const path = require("path");

// Danh sách các file còn lại cần thêm AdminRoleGuard
const remainingPages = [
  "src/app/admin/quan-ly-danh-muc/page.tsx",
  "src/app/admin/quan-ly-chu-dau-tu/page.tsx",
  "src/app/admin/quan-ly-chu-dau-tu/[id]/page.tsx",
  "src/app/admin/quan-ly-du-an/page.tsx",
  "src/app/admin/quan-ly-du-an/[id]/page.tsx",
  "src/app/admin/quan-ly-gia/page.tsx",
  "src/app/admin/quan-ly-gia-tin-dang/page.tsx",
  "src/app/admin/quan-ly-dia-chinh/page.tsx",
  "src/app/admin/quan-ly-dien-tich/page.tsx",
  "src/app/admin/quan-ly-lien-he/page.tsx",
];

function addAdminRoleGuardToRemainingPages(filePath) {
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

  // Thêm import AdminRoleGuard nếu chưa có
  if (
    content.includes("ProtectionGuard") &&
    !content.includes("AdminRoleGuard")
  ) {
    // Tìm dòng import của ProtectionGuard
    if (content.includes("import { PagePermissionGuard }")) {
      content = content.replace(
        /import { PagePermissionGuard } from "@\/components\/auth\/ProtectionGuard";/,
        'import { PagePermissionGuard } from "@/components/auth/ProtectionGuard";\nimport { AdminRoleGuard } from "@/components/auth/AdminRoleGuard";'
      );
      updated = true;
    } else if (content.includes("import { PagePermissionGuard,")) {
      // Trường hợp import nhiều thứ
      content = content.replace(
        /import {\s*PagePermissionGuard,([^}]*)} from "@\/components\/auth\/ProtectionGuard";/,
        'import { PagePermissionGuard,$1} from "@/components/auth/ProtectionGuard";\nimport { AdminRoleGuard } from "@/components/auth/AdminRoleGuard";'
      );
      updated = true;
    }
  }

  // Wrap PagePermissionGuard với AdminRoleGuard - pattern phức tạp hơn
  if (content.includes("<PagePermissionGuard") && updated) {
    // Tìm export default function và wrap
    const exportPattern =
      /export default function (\w+)\([^)]*\) \{[\s\S]*?return \(\s*<PagePermissionGuard([\s\S]*?)<\/PagePermissionGuard>\s*\);\s*\}/;

    if (exportPattern.test(content)) {
      content = content.replace(
        exportPattern,
        (match, functionName, guardContent) => {
          // Tách props và children
          const propsMatch = guardContent.match(/^([^>]*?>)([\s\S]*?)$/);
          if (propsMatch) {
            const props = propsMatch[1];
            const children = propsMatch[2];

            return `export default function ${functionName}() {
  return (
    <AdminRoleGuard>
      <PagePermissionGuard${props}
        ${children}
      </PagePermissionGuard>
    </AdminRoleGuard>
  );
}`;
          }
          return match;
        }
      );
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✅ Đã thêm AdminRoleGuard vào: ${filePath}`);
  } else {
    console.log(
      `⚠️  Không thể cập nhật hoặc đã có AdminRoleGuard: ${filePath}`
    );
  }
}

// Chạy update cho tất cả các file còn lại
console.log("🚀 Bắt đầu thêm AdminRoleGuard vào các trang admin còn lại...\n");

remainingPages.forEach((filePath) => {
  addAdminRoleGuardToRemainingPages(filePath);
});

console.log("\n✨ Hoàn thành việc thêm AdminRoleGuard cho tất cả trang!");
