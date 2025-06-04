import React from "react";
import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/images/logo.svg";

export default function Footer() {
  return (
    <footer className="bg-[#f2f2f2] text-white">
      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Image
                  src={logoWhite}
                  alt="Real Estate Logo"
                  width={140}
                  height={45}
                  className="mb-4"
                />
                <p className="text-black text-sm leading-relaxed">
                  Chuyên trang bất động sản hàng đầu Việt Nam. Chúng tôi cung
                  cấp dịch vụ mua bán, cho thuê nhà đất uy tín và chuyên nghiệp.
                </p>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-black font-semibold mb-4">
                  Kết nối với chúng tôi
                </h4>
                <div className="flex gap-3">
                  <Link
                    href="#"
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <i className="fab fa-facebook-f text-sm"></i>
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <i className="fab fa-instagram text-sm"></i>
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <i className="fab fa-linkedin-in text-sm"></i>
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <i className="fab fa-youtube text-sm"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-black font-semibold mb-6 text-lg">
                Liên kết nhanh
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Bất động sản
                  </Link>
                </li>
                <li>
                  <Link
                    href="/news"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Tin tức
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-black font-semibold mb-6 text-lg">Dịch vụ</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/buy"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Mua bán nhà đất
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rent"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Cho thuê
                  </Link>
                </li>
                <li>
                  <Link
                    href="/valuation"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Định giá BĐS
                  </Link>
                </li>
                <li>
                  <Link
                    href="/consultation"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Tư vấn đầu tư
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal"
                    className="text-black hover:text-black hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-blue-500"></i>
                    Hỗ trợ pháp lý
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-black font-semibold mb-6 text-lg">
                Thông tin liên hệ
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-map-marker-alt text-xs text-white"></i>
                  </div>
                  <div>
                    <p className="text-black text-sm leading-relaxed">
                      123 Nguyễn Huệ, Quận 1,
                      <br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-phone text-xs text-white"></i>
                  </div>
                  <Link
                    href="tel:+84901234567"
                    className="text-black hover:text-black transition-colors text-sm"
                  >
                    +84 90 123 4567
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-envelope text-xs text-white"></i>
                  </div>
                  <Link
                    href="mailto:info@batdongsan.com"
                    className="text-black hover:text-black transition-colors text-sm"
                  >
                    info@batdongsan.com
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-clock text-xs text-white"></i>
                  </div>
                  <div>
                    <p className="text-black text-sm">
                      Thứ 2 - Thứ 7: 8:00 - 18:00
                      <br />
                      Chủ nhật: 9:00 - 17:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-700 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-black font-semibold text-lg mb-2">
                Đăng ký nhận tin
              </h4>
              <p className="text-black text-sm">
                Nhận thông tin mới nhất về bất động sản và các ưu đãi hấp dẫn
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-600 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-2 text-white rounded-lg transition-colors font-medium bg-[#e03c31] hover:bg-[#c32b24] active:bg-[#a22a23] shadow-sm hover:shadow-md">
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Bất Động Sản. Bảo lưu mọi quyền.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-gray-400 hover:text-black transition-colors text-sm"
              >
                Điều khoản sử dụng
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-black transition-colors text-sm"
              >
                Chính sách bảo mật
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="/sitemap"
                className="text-gray-400 hover:text-black transition-colors text-sm"
              >
                Sơ đồ trang web
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
