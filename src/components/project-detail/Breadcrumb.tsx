// Updated breadcrumb component following new URL structure: /type/province/ward/postid-title

"use client";
import React, { useEffect } from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // Filter out any items with empty labels and fix any double slashes in URLs
  const validItems = items
    .filter((item) => item.label.trim() !== "")
    .map((item) => ({
      ...item,
      href: item.href.replace(/\/\//g, "/"), // Fix any double slashes in URLs
    }));

  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: validItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: item.href ? `${window.location.origin}${item.href}` : undefined,
      })),
    };

    // Create and inject schema script
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  }, [validItems]);

  return (
    <nav className="flex items-start text-sm" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {validItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <i
                className="fas fa-chevron-right text-gray-400 text-xs mx-2 flex-shrink-0"
                aria-hidden="true"
              ></i>
            )}
            {item.isActive ? (
              <span
                className="text-gray-900 font-medium leading-tight"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors leading-tight"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
