"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/authService";

interface ResetPasswordPageClientProps {
  token: string;
}

export default function ResetPasswordPageClient({
  token,
}: ResetPasswordPageClientProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.resetPassword(
        token,
        password,
        confirmPassword
      );

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Đặt lại mật khẩu
          </h1>

          {!token ? (
            /* Invalid Token State */
            <div className="text-center">
              <div className="mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Link không hợp lệ
                </h2>
                <p className="text-gray-600 mb-6">
                  Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="block w-full py-3 text-white rounded-lg transition bg-[#e03c31] hover:bg-[#c8281e] text-center font-medium"
                >
                  Yêu cầu link mới
                </Link>
                <Link
                  href="/dang-nhap"
                  className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : success ? (
            /* Success State */
            <div className="text-center">
              <div className="mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-green-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Đặt lại mật khẩu thành công!
                </h2>
                <p className="text-gray-600 mb-6">
                  Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng
                  nhập bằng mật khẩu mới.
                </p>
              </div>

              <Link
                href="/dang-nhap"
                className="block w-full py-3 text-white rounded-lg transition bg-[#e03c31] hover:bg-[#c8281e] text-center font-medium"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <p className="mb-6 text-gray-600 text-center">
                Nhập mật khẩu mới cho tài khoản của bạn.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block mb-2 font-medium">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
                      placeholder="Nhập mật khẩu mới"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                          <path
                            fillRule="evenodd"
                            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                          <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                          <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 font-medium"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                          <path
                            fillRule="evenodd"
                            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                          <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                          <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white rounded-lg transition bg-[#e03c31] hover:bg-[#c8281e] active:bg-[#b01f16] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </button>

                {/* Back to login link */}
                <div className="text-center">
                  <Link
                    href="/dang-nhap"
                    className="text-[#e03c31] hover:underline font-medium"
                  >
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}
