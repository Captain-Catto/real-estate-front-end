const fs = require("fs");
const path = require("path");

// Danh sách các trang cần cleanup
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

function cleanupFile(filePath) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  let hasChanges = false;

  // 1. Sửa import AdminGuard (remove extra characters)
  if (
    content.includes('AdminGuard from "@/components/auth/AdminGuard";import')
  ) {
    content = content.replace(
      /AdminGuard from "@\/components\/auth\/AdminGuard";import/g,
      'AdminGuard from "@/components/auth/AdminGuard";\nimport'
    );
    hasChanges = true;
  }

  // 2. Loại bỏ comment cũ về PagePermissionGuard
  content = content.replace(
    /\/\/ Wrap component with PagePermissionGuard\s*/g,
    ""
  );
  hasChanges = true;

  // 3. Loại bỏ các dòng trống thừa
  content = content.replace(/\n\n\n+/g, "\n\n");
  hasChanges = true;

  // 4. Đảm bảo có newline ở cuối file
  if (!content.endsWith("\n")) {
    content += "\n";
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✅ Cleaned: ${filePath}`);
  } else {
    console.log(`ℹ️  No cleanup needed: ${filePath}`);
  }
}

console.log("🧹 Starting cleanup of admin pages...\n");

adminPages.forEach(cleanupFile);

console.log("\n✅ Cleanup completed!");
