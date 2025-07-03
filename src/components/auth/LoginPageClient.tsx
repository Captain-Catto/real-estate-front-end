"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPageClient() {
  const router = useRouter();
  const { login, loading, error, isAuthenticated, clearError } = useAuth();

  // State cho form đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Clear error khi component unmount hoặc form thay đổi
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Xử lý đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear previous errors

    const result = await login({ email, password });

    if (result.success) {
      console.log("Login successful");
      // Redux sẽ tự động redirect thông qua useEffect ở trên
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Đăng nhập</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e03c31] focus:border-transparent"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="font-medium">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#e03c31] hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e03c31] focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {/* Icon SVG code như cũ */}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 border-gray-300 rounded focus:ring-[#e03c31]"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-lg transition bg-[#e03c31] hover:bg-[#c8281e] active:bg-[#b01f16] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Register link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Bạn chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="text-[#e03c31] hover:underline font-bold"
                >
                  Đăng ký
                </Link>
              </span>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
