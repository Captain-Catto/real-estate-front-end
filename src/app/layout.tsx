"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { usePathname, useSearchParams } from "next/navigation";

import { ReduxProvider } from "@/store/provider";
import { trackPageView } from "@/services/trackingService";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata moved to a separate metadata.ts file due to "use client" directive
const metadata = {
  title: "Bất Động Sản - Tìm Nhà Mơ Ước",
  description: "Website bán và cho thuê bất động sản hàng đầu Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    // Get full path including query parameters
    const fullPath =
      searchParams.size > 0
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

    // Track the page view
    trackPageView(fullPath);
  }, [pathname, searchParams]);

  return (
    <html lang="vi">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
