"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  CogIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BellIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  MapIcon,
  UserIcon,
  PhotoIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Types
interface SystemSettings {
  // Cài đặt chung
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  adminEmail: string;
  supportEmail: string;
  supportPhone: string;
  contactAddress: string;

  // Cài đặt bất động sản
  defaultCurrency: string;
  priceDisplayFormat: string;
  areaUnit: string;
  autoApprovalEnabled: boolean;
  maxImagesPerPost: number;
  maxPostDuration: number;

  // Cài đặt thanh toán
  enablePaymentGateway: boolean;
  vipPostPrice: number;
  premiumPostPrice: number;
  featuredPostPrice: number;

  // Cài đặt email
  emailNotifications: boolean;
  smsNotifications: boolean;
  emailHost: string;
  emailPort: string;
  emailUsername: string;
  emailPassword: string;

  // Cài đặt bảo mật
  enableTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableCaptcha: boolean;

  // Cài đặt SEO
  enableSEO: boolean;
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleTagManagerId: string;

  // Cài đặt bản đồ
  mapProvider: string;
  googleMapApiKey: string;
  defaultMapZoom: number;
  defaultLatitude: number;
  defaultLongitude: number;
}

// Mock service
const SettingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    await new Promise((r) => setTimeout(r, 500));
    return {
      // Cài đặt chung
      siteName: "Bất Động Sản VN",
      siteDescription:
        "Website mua bán, cho thuê bất động sản hàng đầu Việt Nam",
      siteKeywords: "bất động sản, mua bán nhà đất, cho thuê",
      adminEmail: "admin@batdongsan.vn",
      supportEmail: "support@batdongsan.vn",
      supportPhone: "1900-1234",
      contactAddress: "123 Đường ABC, Quận 1, TP.HCM",

      // Cài đặt bất động sản
      defaultCurrency: "VND",
      priceDisplayFormat: "billion", // billion, million, thousand
      areaUnit: "m²",
      autoApprovalEnabled: false,
      maxImagesPerPost: 20,
      maxPostDuration: 90,

      // Cài đặt thanh toán
      enablePaymentGateway: true,
      vipPostPrice: 500000,
      premiumPostPrice: 300000,
      featuredPostPrice: 200000,

      // Cài đặt email
      emailNotifications: true,
      smsNotifications: false,
      emailHost: "smtp.gmail.com",
      emailPort: "587",
      emailUsername: "",
      emailPassword: "",

      // Cài đặt bảo mật
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableCaptcha: true,

      // Cài đặt SEO
      enableSEO: true,
      googleAnalyticsId: "",
      facebookPixelId: "",
      googleTagManagerId: "",

      // Cài đặt bản đồ
      mapProvider: "google",
      googleMapApiKey: "",
      defaultMapZoom: 10,
      defaultLatitude: 10.8231,
      defaultLongitude: 106.6297,
    };
  },

  updateSettings: async (settings: Partial<SystemSettings>) => {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, message: "Cài đặt đã được cập nhật thành công!" };
  },

  testEmailConnection: async (emailSettings: any) => {
    await new Promise((r) => setTimeout(r, 1000));
    return { success: true, message: "Kết nối email thành công!" };
  },
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const tabs = [
    { id: "general", label: "Cài đặt chung", icon: CogIcon },
    { id: "property", label: "Bất động sản", icon: MapIcon },
    { id: "payment", label: "Thanh toán", icon: CurrencyDollarIcon },
    { id: "email", label: "Email & SMS", icon: EnvelopeIcon },
    { id: "security", label: "Bảo mật", icon: ShieldCheckIcon },
    { id: "seo", label: "SEO & Analytics", icon: GlobeAltIcon },
    { id: "map", label: "Bản đồ", icon: MapIcon },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setNotification({
        type: "error",
        message: "Không thể tải cài đặt. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const result = await SettingsService.updateSettings(settings);

      if (result.success) {
        setNotification({
          type: "success",
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setNotification({
        type: "error",
        message: "Không thể lưu cài đặt. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings) return;

    try {
      const result = await SettingsService.testEmailConnection({
        host: settings.emailHost,
        port: settings.emailPort,
        username: settings.emailUsername,
        password: settings.emailPassword,
      });

      setNotification({
        type: result.success ? "success" : "error",
        message: result.message,
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: "Không thể kiểm tra kết nối email.",
      });
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Cài đặt hệ thống
                </h1>
                <p className="text-gray-600">
                  Quản lý cấu hình và tùy chỉnh hệ thống
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchSettings}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Làm mới
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                notification.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : notification.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {notification.type === "success" && (
                <CheckCircleIcon className="w-5 h-5" />
              )}
              {notification.type === "error" && (
                <ExclamationTriangleIcon className="w-5 h-5" />
              )}
              {notification.type === "info" && (
                <InformationCircleIcon className="w-5 h-5" />
              )}
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Tab: Cài đặt chung */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Thông tin chung
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên website
                      </label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) =>
                          updateSetting("siteName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email quản trị
                      </label>
                      <input
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) =>
                          updateSetting("adminEmail", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả website
                      </label>
                      <textarea
                        value={settings.siteDescription}
                        onChange={(e) =>
                          updateSetting("siteDescription", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Từ khóa SEO
                      </label>
                      <input
                        type="text"
                        value={settings.siteKeywords}
                        onChange={(e) =>
                          updateSetting("siteKeywords", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Từ khóa cách nhau bởi dấu phẩy"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email hỗ trợ
                      </label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) =>
                          updateSetting("supportEmail", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại hỗ trợ
                      </label>
                      <input
                        type="tel"
                        value={settings.supportPhone}
                        onChange={(e) =>
                          updateSetting("supportPhone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ liên hệ
                      </label>
                      <textarea
                        value={settings.contactAddress}
                        onChange={(e) =>
                          updateSetting("contactAddress", e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Bất động sản */}
              {activeTab === "property" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cài đặt bất động sản
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đơn vị tiền tệ mặc định
                      </label>
                      <select
                        value={settings.defaultCurrency}
                        onChange={(e) =>
                          updateSetting("defaultCurrency", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="VND">Việt Nam Đồng (VND)</option>
                        <option value="USD">US Dollar (USD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Định dạng hiển thị giá
                      </label>
                      <select
                        value={settings.priceDisplayFormat}
                        onChange={(e) =>
                          updateSetting("priceDisplayFormat", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="billion">Tỷ đồng</option>
                        <option value="million">Triệu đồng</option>
                        <option value="thousand">Nghìn đồng</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đơn vị diện tích
                      </label>
                      <select
                        value={settings.areaUnit}
                        onChange={(e) =>
                          updateSetting("areaUnit", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="m²">Mét vuông (m²)</option>
                        <option value="ha">Hecta (ha)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số ảnh tối đa mỗi tin đăng
                      </label>
                      <input
                        type="number"
                        value={settings.maxImagesPerPost}
                        onChange={(e) =>
                          updateSetting(
                            "maxImagesPerPost",
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian hiển thị tin đăng tối đa (ngày)
                      </label>
                      <input
                        type="number"
                        value={settings.maxPostDuration}
                        onChange={(e) =>
                          updateSetting(
                            "maxPostDuration",
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        max="365"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="autoApproval"
                          checked={settings.autoApprovalEnabled}
                          onChange={(e) =>
                            updateSetting(
                              "autoApprovalEnabled",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="autoApproval"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Tự động duyệt tin đăng mới
                        </label>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Tin đăng sẽ được hiển thị ngay lập tức mà không cần
                        duyệt thủ công
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Thanh toán */}
              {activeTab === "payment" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cài đặt thanh toán
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enablePayment"
                        checked={settings.enablePaymentGateway}
                        onChange={(e) =>
                          updateSetting(
                            "enablePaymentGateway",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="enablePayment"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Kích hoạt cổng thanh toán
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá tin VIP (VND)
                      </label>
                      <input
                        type="number"
                        value={settings.vipPostPrice}
                        onChange={(e) =>
                          updateSetting(
                            "vipPostPrice",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá tin Premium (VND)
                      </label>
                      <input
                        type="number"
                        value={settings.premiumPostPrice}
                        onChange={(e) =>
                          updateSetting(
                            "premiumPostPrice",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá tin nổi bật (VND)
                      </label>
                      <input
                        type="number"
                        value={settings.featuredPostPrice}
                        onChange={(e) =>
                          updateSetting(
                            "featuredPostPrice",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Email & SMS */}
              {activeTab === "email" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cài đặt Email & SMS
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          updateSetting("emailNotifications", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="emailNotifications"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Kích hoạt thông báo email
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={settings.smsNotifications}
                        onChange={(e) =>
                          updateSetting("smsNotifications", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="smsNotifications"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Kích hoạt thông báo SMS
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.emailHost}
                        onChange={(e) =>
                          updateSetting("emailHost", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        value={settings.emailPort}
                        onChange={(e) =>
                          updateSetting("emailPort", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="587"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Username
                      </label>
                      <input
                        type="email"
                        value={settings.emailUsername}
                        onChange={(e) =>
                          updateSetting("emailUsername", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Password
                      </label>
                      <input
                        type="password"
                        value={settings.emailPassword}
                        onChange={(e) =>
                          updateSetting("emailPassword", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleTestEmail}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Kiểm tra kết nối Email
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Bảo mật */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cài đặt bảo mật
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="twoFactor"
                        checked={settings.enableTwoFactor}
                        onChange={(e) =>
                          updateSetting("enableTwoFactor", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="twoFactor"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Kích hoạt xác thực 2 bước
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="captcha"
                        checked={settings.enableCaptcha}
                        onChange={(e) =>
                          updateSetting("enableCaptcha", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="captcha"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Kích hoạt Captcha
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian hết hạn phiên (phút)
                      </label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) =>
                          updateSetting(
                            "sessionTimeout",
                            parseInt(e.target.value)
                          )
                        }
                        min="5"
                        max="1440"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số lần đăng nhập sai tối đa
                      </label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) =>
                          updateSetting(
                            "maxLoginAttempts",
                            parseInt(e.target.value)
                          )
                        }
                        min="3"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: SEO & Analytics */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cài đặt SEO & Analytics
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableSEO"
                        checked={settings.enableSEO}
                        onChange={(e) =>
                          updateSetting("enableSEO", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="enableSEO"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Kích hoạt tối ưu SEO
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Analytics ID
                      </label>
                      <input
                        type="text"
                        value={settings.googleAnalyticsId}
                        onChange={(e) =>
                          updateSetting("googleAnalyticsId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="GA-XXXXXXXXX-X"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook Pixel ID
                      </label>
                      <input
                        type="text"
                        value={settings.facebookPixelId}
                        onChange={(e) =>
                          updateSetting("facebookPixelId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123456789012345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Tag Manager ID
                      </label>
                      <input
                        type="text"
                        value={settings.googleTagManagerId}
                        onChange={(e) =>
                          updateSetting("googleTagManagerId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Bản đồ */}
              {activeTab === "map" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cài đặt bản đồ
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhà cung cấp bản đồ
                      </label>
                      <select
                        value={settings.mapProvider}
                        onChange={(e) =>
                          updateSetting("mapProvider", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="google">Google Maps</option>
                        <option value="openstreet">OpenStreetMap</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mức zoom mặc định
                      </label>
                      <input
                        type="number"
                        value={settings.defaultMapZoom}
                        onChange={(e) =>
                          updateSetting(
                            "defaultMapZoom",
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Maps API Key
                      </label>
                      <input
                        type="text"
                        value={settings.googleMapApiKey}
                        onChange={(e) =>
                          updateSetting("googleMapApiKey", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vĩ độ mặc định
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={settings.defaultLatitude}
                        onChange={(e) =>
                          updateSetting(
                            "defaultLatitude",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10.8231"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kinh độ mặc định
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={settings.defaultLongitude}
                        onChange={(e) =>
                          updateSetting(
                            "defaultLongitude",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="106.6297"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Lưu ý về Google Maps API
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Để sử dụng Google Maps, bạn cần có API Key hợp lệ.
                            Vui lòng truy cập Google Cloud Console để tạo và cấu
                            hình API Key.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
