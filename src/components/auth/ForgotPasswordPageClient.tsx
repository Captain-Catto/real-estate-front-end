"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Forgot password clicked:", { email });
    // Simulate success for demo
    setSuccess(true);
    // TODO: Implement forgot password logic later
  };

  return (
    <>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Quên mật khẩu</h1>

          {success ? (
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
                  Gửi yêu cầu thành công!
                </h2>
                <p className="text-gray-600 mb-4">
                  Email hướng dẫn đặt lại mật khẩu đã được gửi đến{" "}
                  <span className="font-medium text-gray-800">{email}</span>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/dang-nhap"
                  className="block w-full py-3 text-white rounded-lg transition bg-[#e03c31] hover:bg-[#c8281e] text-center font-medium"
                >
                  Quay lại đăng nhập
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
                >
                  Gửi lại email
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              <p className="mb-6 text-gray-600 text-center">
                Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block mb-2 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 text-white rounded-lg transition bg-[#e03c31] hover:bg-[#c8281e] active:bg-[#b01f16] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgb(200, 40, 30)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgb(224, 60, 49)";
                  }}
                >
                  Gửi link đặt lại mật khẩu
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
