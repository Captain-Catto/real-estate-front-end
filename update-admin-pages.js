const fs = require("fs");
const path = require("path");

// Danh sách các file cần cập nhật
const adminPages = [
  "src/app/admin/page.tsx",
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

function updatePageFile(filePath) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File không tồn tại: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");

  // Kiểm tra xem file đã được cập nhật chưa
  if (content.includes('redirectTo="/admin/unauthorized"')) {
    console.log(`✅ File đã được cập nhật: ${filePath}`);
    return;
  }

  // Tìm và thay thế các pattern khác nhau
  let updated = false;

  // Pattern 1: redirectTo="/admin"
  if (content.includes('redirectTo="/admin"')) {
    content = content.replace(
      /redirectTo="\/admin"/g,
      'redirectTo="/admin/unauthorized"'
    );
    updated = true;
  }

  // Pattern 2: redirectTo="/"
  if (content.includes('redirectTo="/"')) {
    content = content.replace(
      /redirectTo="\/"(?!\w)/g,
      'redirectTo="/admin/unauthorized"'
    );
    updated = true;
  }

  // Pattern 3: Không có redirectTo -> thêm vào
  if (
    content.includes("PagePermissionGuard") &&
    !content.includes("redirectTo=")
  ) {
    // Tìm PagePermissionGuard và thêm redirectTo
    content = content.replace(
      /<PagePermissionGuard([^>]*)>/g,
      (match, attributes) => {
        if (!attributes.includes("redirectTo")) {
          return `<PagePermissionGuard${attributes}\n      redirectTo="/admin/unauthorized">`;
        }
        return match;
      }
    );
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✅ Đã cập nhật: ${filePath}`);
  } else {
    console.log(`⚠️  Không cần cập nhật: ${filePath}`);
  }
}

// Chạy update cho tất cả các file
console.log("🚀 Bắt đầu cập nhật các trang admin...\n");

adminPages.forEach((filePath) => {
  updatePageFile(filePath);
});

console.log("\n✨ Hoàn thành cập nhật tất cả các trang admin!");
