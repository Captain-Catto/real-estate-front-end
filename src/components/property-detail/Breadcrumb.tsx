import React from "react";
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
