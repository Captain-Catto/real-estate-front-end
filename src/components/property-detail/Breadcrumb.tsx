"use client";
import React, { useEffect } from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item:
          item.href !== "#"
            ? `${window.location.origin}${item.href}`
            : undefined,
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
  }, [items]);

  return (
    <nav className="flex overflow-hidden" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 whitespace-nowrap overflow-x-auto scrollbar-hide">
        {items.map((item, index) => (
          <li key={index} className="flex items-center flex-shrink-0">
            {index > 0 && (
              <span className="mx-1.5 text-gray-400 flex-shrink-0">/</span>
            )}
            {item.isActive ? (
              <span className="text-gray-600 text-sm">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-800 text-sm flex-shrink-0 hover:underline"
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
