// Cải thiện component hiện tại

"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
  useQueryParams?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const searchParams = useSearchParams();

  // Function to create URL with query params for location links (province, district, ward)
  const createUrlWithQueryParams = (baseHref: string, item: BreadcrumbItem) => {
    // Only modify links if specified to use query params
    if (!item.useQueryParams) {
      return item.href;
    }

    // For location links, we want to use query param format
    if (baseHref.includes("/mua-ban/") || baseHref.includes("/cho-thue/")) {
      const segments = baseHref.split("/").filter((segment) => segment); // Remove empty segments
      // Get the transaction type (mua-ban or cho-thue)
      const transactionType = segments[1]; // 'mua-ban' or 'cho-thue'

      // Build URL based on how many segments we have (province, ward or province, district, ward)
      if (segments.length >= 3) {
        const provinceSlug = segments[2]; // The province slug

        // Check if this is a province-ward structure (no district)
        if (segments.length === 4) {
          // This is likely a province-ward structure
          const wardSlug = segments[3]; // The ward slug
          return `/${transactionType}?province=${provinceSlug}&ward=${wardSlug}`;
        }

        // Handle province-district-ward structure
        if (segments.length >= 4) {
          const districtSlug = segments[3]; // The district slug

          if (segments.length >= 5) {
            const wardSlug = segments[4]; // The ward slug
            return `/${transactionType}?province=${provinceSlug}&district=${districtSlug}&ward=${wardSlug}`;
          }

          return `/${transactionType}?province=${provinceSlug}&district=${districtSlug}`;
        }

        // Just province
        return `/${transactionType}?province=${provinceSlug}`;
      }
    }

    return baseHref;
  };

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
  }, [validItems]); // Use validItems as dependency

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
                href={
                  item.useQueryParams
                    ? createUrlWithQueryParams(item.href, item)
                    : item.href
                }
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
