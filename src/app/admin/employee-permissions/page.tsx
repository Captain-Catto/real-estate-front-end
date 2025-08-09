"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { permissionService } from "@/services/permissionService";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";

interface Employee {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  permissions: string[];
}

interface PermissionToggle {
  permission: string;
  enabled: boolean;
  description: string;
}

function EmployeePermissionManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [managablePermissions, setManagablePermissions] = useState<string[]>(
    []
  );
  const [permissionToggles, setPermissionToggles] = useState<
    PermissionToggle[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasFetchedData = useRef(false);

  // Permission descriptions for UI
  const permissionDescriptions: { [key: string]: string } = {
    // User management
    create_user: "Tạo người dùng mới",
    edit_user: "Chỉnh sửa thông tin người dùng",
    delete_user: "Xóa người dùng",
    change_user_status: "Thay đổi trạng thái người dùng",

    // Post management
    edit_post: "Chỉnh sửa tin đăng",
    delete_post: "Xóa tin đăng",
    approve_post: "Duyệt tin đăng",
    reject_post: "Từ chối tin đăng",

    // Project management
    create_project: "Tạo dự án mới",
    edit_project: "Chỉnh sửa dự án",
    delete_project: "Xóa dự án",

    // News management
    create_news: "Tạo tin tức mới",
    edit_news: "Chỉnh sửa tin tức",
    delete_news: "Xóa tin tức",
    feature_news: "Đánh dấu tin nổi bật",
    publish_news: "Xuất bản tin tức",
    manage_news_categories: "Quản lý danh mục tin tức",

    // Transaction management
    view_transactions: "Xem giao dịch",

    // Dashboard access
    view_dashboard: "Xem trang chính admin",

    // Statistics and reports
    view_statistics: "Xem trang thống kê",
    export_statistics: "Xuất báo cáo thống kê",
    generate_reports: "Tạo báo cáo",

    // Settings
    edit_settings: "Chỉnh sửa cài đặt",
    manage_categories: "Quản lý danh mục bất động sản",
    manage_locations: "Quản lý địa điểm",
    manage_areas: "Quản lý khu vực",
    manage_prices: "Quản lý giá cả",
  };

  // Group permissions by category
  const groupedPermissions = {
    "Quản lý người dùng": [
      "create_user",
      "edit_user",
      "delete_user",
      "change_user_status",
    ],
    "Quản lý tin đăng": [
      "edit_post",
      "delete_post",
      "approve_post",
      "reject_post",
    ],
    "Quản lý dự án": ["create_project", "edit_project", "delete_project"],
    "Quản lý tin tức": [
      "create_news",
      "edit_news",
      "delete_news",
      "feature_news",
      "publish_news",
      "manage_news_categories",
    ],
    "Quản lý giao dịch": ["view_transactions"],
    "Báo cáo & Thống kê": [
      "view_statistics",
      "export_statistics",
      "generate_reports",
    ],
    "Cài đặt hệ thống": [
      "edit_settings",
      "manage_categories",
      "manage_locations",
      "manage_areas",
      "manage_prices",
    ],
  };

  // Fetch data when component mounts and user is admin
  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedData.current) {
      return;
    }

    console.log("� Starting data fetch...");
    hasFetchedData.current = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const [permissionsResponse, usersResponse] = await Promise.all([
          permissionService.getAvailablePermissions(),
          permissionService.getUsersAndPermissions(),
        ]);

        if (permissionsResponse.success) {
          setManagablePermissions(
            permissionsResponse.data.manageableEmployeePermissions || []
          );
        }

        if (usersResponse.success && usersResponse.data.users) {
          const employeeUsers = usersResponse.data.users.filter(
            (u) => u.role === "employee"
          );
          setEmployees(employeeUsers);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        toast.error("Không thể tải dữ liệu");
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - only run once
  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);

    // Create permission toggles based on manageable permissions
    const toggles = managablePermissions.map((permission) => ({
      permission,
      enabled: employee.permissions.includes(permission),
      description: permissionDescriptions[permission] || permission,
    }));

    setPermissionToggles(toggles);
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission: string) => {
    setPermissionToggles((prev) =>
      prev.map((toggle) =>
        toggle.permission === permission
          ? { ...toggle, enabled: !toggle.enabled }
          : toggle
      )
    );
  };

  // Handle group toggle
  const handleGroupToggle = (groupPermissions: string[]) => {
    const allEnabled = groupPermissions.every(
      (perm) => permissionToggles.find((t) => t.permission === perm)?.enabled
    );

    setPermissionToggles((prev) =>
      prev.map((toggle) =>
        groupPermissions.includes(toggle.permission)
          ? { ...toggle, enabled: !allEnabled }
          : toggle
      )
    );
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!selectedEmployee) return;

    setIsSaving(true);
    try {
      const basePermissions = [
        "view_users",
        "view_posts",
        "view_projects",
        "view_news",
        "view_transactions",
        "view_support_requests",
        "view_reports",
        "view_dashboard", // Quyền cơ bản để xem trang chính admin
        "view_settings",
        "view_locations",
      ];

      // Add enabled additional permissions
      const enabledPermissions = permissionToggles
        .filter((toggle) => toggle.enabled)
        .map((toggle) => toggle.permission);

      const finalPermissions = [...basePermissions, ...enabledPermissions];

      const response = await permissionService.updateUserPermissions(
        selectedEmployee._id,
        finalPermissions
      );

      if (response.success) {
        // Update local state
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === selectedEmployee._id
              ? { ...emp, permissions: finalPermissions }
              : emp
          )
        );

        setSelectedEmployee((prev) =>
          prev ? { ...prev, permissions: finalPermissions } : null
        );

        toast.success(`Đã cập nhật quyền cho ${selectedEmployee.username}`);
      } else {
        toast.error("Lỗi khi cập nhật quyền: " + response.message);
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Không thể lưu thay đổi");
    } finally {
      setIsSaving(false);
    }
  };

  // Test toast function
  const testToast = () => {
    console.log("Testing toast notifications...");
    toast.success("Test Toast Success", {
      description: "This is a test success toast",
      duration: 3000,
      icon: "✅",
    });

    setTimeout(() => {
      toast.error("Test Toast Error", {
        description: "This is a test error toast",
        duration: 3000,
        icon: "❌",
      });
    }, 1000);
  };

  return (
    <AdminLayout
      title="Quản lý quyền Employee"
      description="Kích hoạt hoặc khóa các chức năng mà employee có thể thực hiện"
    >
      {/* Test Toast Button - Remove after testing */}
      <div className="mb-4">
        <button
          onClick={testToast}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Test Toast System
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Danh sách Employee ({employees.length})
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {employees.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Không có employee nào
                  </div>
                ) : (
                  employees.map((employee) => (
                    <div
                      key={employee._id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedEmployee?._id === employee._id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() => handleSelectEmployee(employee)}
                    >
                      <div className="font-medium text-gray-900">
                        {employee.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.email}
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {employee.role}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            employee.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {employee.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {employee.permissions.length} quyền
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Permission Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {selectedEmployee ? (
                <>
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Quản lý quyền: {selectedEmployee.username}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Kích hoạt các chức năng mà employee này có thể thực hiện
                      </p>
                    </div>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(
                        ([groupName, groupPerms]) => {
                          const groupToggles = groupPerms
                            .map((perm) =>
                              permissionToggles.find(
                                (t) => t.permission === perm
                              )
                            )
                            .filter(
                              (toggle): toggle is PermissionToggle =>
                                toggle !== undefined
                            );

                          const allEnabled = groupToggles.every(
                            (toggle) => toggle.enabled
                          );
                          const someEnabled = groupToggles.some(
                            (toggle) => toggle.enabled
                          );

                          return (
                            <div
                              key={groupName}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div
                                className="flex items-center mb-4 cursor-pointer"
                                onClick={() => handleGroupToggle(groupPerms)}
                              >
                                <div
                                  className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                                    allEnabled
                                      ? "bg-blue-600 border-blue-600"
                                      : someEnabled
                                      ? "bg-blue-200 border-blue-300"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {allEnabled && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                      ></path>
                                    </svg>
                                  )}
                                  {someEnabled && !allEnabled && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                                  )}
                                </div>
                                <h3 className="font-medium text-gray-900">
                                  {groupName}
                                </h3>
                              </div>

                              <div className="ml-8 space-y-3">
                                {groupPerms.map((permission) => {
                                  const toggle = permissionToggles.find(
                                    (t) => t.permission === permission
                                  );
                                  if (!toggle) return null;

                                  return (
                                    <div
                                      key={permission}
                                      className="flex items-center cursor-pointer"
                                      onClick={() =>
                                        handlePermissionToggle(permission)
                                      }
                                    >
                                      <div
                                        className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                                          toggle.enabled
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-gray-300 bg-white"
                                        }`}
                                      >
                                        {toggle.enabled && (
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M5 13l4 4L19 7"
                                            ></path>
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {toggle.description}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {permission}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Lưu ý:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Employee luôn có quyền xem danh sách cơ bản</li>
                        <li>
                          • Khi kích hoạt, employee có thể thực hiện các hành
                          động được chọn
                        </li>
                        <li>• Thay đổi có hiệu lực ngay sau khi lưu</li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chọn Employee
                  </h3>
                  <p>
                    Vui lòng chọn một employee từ danh sách để quản lý quyền
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Wrap component with AdminGuard
export default function ProtectedEmployeePermissionManagement() {
  return (
    <AdminGuard permissions={[PERMISSIONS.USER.CHANGE_ROLE]}>
      <EmployeePermissionManagement />
    </AdminGuard>
  );
}
