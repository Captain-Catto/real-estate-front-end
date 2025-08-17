"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  headerSettingsService,
  HeaderMenu,
} from "@/services/headerSettingsService";
import { toast } from "sonner";
// import { newsService, NewsCategory } from "@/services/newsService";

export const Navbar = React.memo(() => {
  const [headerMenus, setHeaderMenus] = useState<HeaderMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  // const updateNewsMenuInHeaderMenus = useCallback(
  //   (categories: NewsCategory[]) => {
  //     setHeaderMenus((prevMenus) => {
  //       return prevMenus.map((menu) => {
  //         if (menu.id === "5" || menu.label === "Tin tức") {
  //           return {
  //             ...menu,
  //             hasDropdown: categories.length > 0,
  //             dropdownItems: categories.map((category) => ({
  //               id: `news-${category.slug}`,
  //               label: category.name,
  //               href: `/tin-tuc/${category.slug}`,
  //               order: 1,
  //               isActive: true,
  //             })),
  //           };
  //         }
  //         return menu;
  //       });
  //     });
  //   },
  //   []
  // );

  // Load data on component mount
  useEffect(() => {
    // const loadNewsCategories = async () => {
    //   try {
    //     const response = await newsService.getNewsCategories();
    //     if (response.success && response.data) {
    //       // Cập nhật menu tin tức trong headerMenus
    //       updateNewsMenuInHeaderMenus(response.data);
    //     }
    //   } catch (error) {
    //     console.error("Failed to load news categories:", error);
    //     // Fallback to empty array - navbar will work without categories
    //   }
    // };

    const loadHeaderMenus = async () => {
      try {
        setLoading(true);
        const response = await headerSettingsService.getPublicHeaderMenus();
        if (response.success) {
          console.log("Raw API response:", response.data);
          // Only show active menus, sorted by order
          const activeMenus = response.data
            .filter((menu) => menu.isActive)
            .sort((a, b) => a.order - b.order)
            .map((menu: HeaderMenu, index) => ({
              ...menu,
              id: menu.id || `menu-${index}`,
            }));
          console.log("Processed activeMenus:", activeMenus);
          setHeaderMenus(activeMenus);
        }
      } catch {
        toast.error("Không thể tải menu header");
        // Fallback to default menus - categories will be updated separately
        const fallbackMenus = [
          {
            id: "1",
            label: "Trang chủ",
            href: "/",
            order: 1,
            isActive: true,
            hasDropdown: false,
            dropdownItems: [],
          },
          {
            id: "2",
            label: "Mua bán",
            href: "/mua-ban",
            order: 2,
            isActive: true,
            hasDropdown: true,
            dropdownItems: [
              {
                id: "2-1",
                label: "Nhà riêng",
                href: "/mua-ban/nha-rieng",
                order: 1,
                isActive: true,
              },
              {
                id: "2-2",
                label: "Chung cư",
                href: "/mua-ban/chung-cu",
                order: 2,
                isActive: true,
              },
            ],
          },
          {
            id: "3",
            label: "Cho thuê",
            href: "/cho-thue",
            order: 3,
            isActive: true,
            hasDropdown: false,
            dropdownItems: [],
          },
          {
            id: "4",
            label: "Dự án",
            href: "/du-an",
            order: 4,
            isActive: true,
            hasDropdown: false,
            dropdownItems: [],
          },
          {
            id: "5",
            label: "Tin tức",
            href: "/tin-tuc",
            order: 5,
            isActive: true,
            hasDropdown: false, // Will be updated when categories load
            dropdownItems: [], // Will be updated when categories load
          },
          {
            id: "6",
            label: "Liên hệ",
            href: "/lien-he",
            order: 6,
            isActive: true,
            hasDropdown: false,
            dropdownItems: [],
          },
        ];
        console.log("Using fallback menus:", fallbackMenus);
        setHeaderMenus(fallbackMenus);
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      // Load header menus first
      await loadHeaderMenus();
      // Disable auto-loading news categories to use header settings dropdown
      // await loadNewsCategories();
    };

    loadData();
  }, []); // No dependencies needed

  // Store timeout references
  const timeoutRefs = React.useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Handle mouse enter on menu item
  const handleMenuMouseEnter = (menuId: string, hasDropdown: boolean) => {
    if (hasDropdown) {
      console.log("Mouse enter:", menuId);
      // Clear all timeouts
      Object.keys(timeoutRefs.current).forEach((key) => {
        if (timeoutRefs.current[key]) {
          clearTimeout(timeoutRefs.current[key]);
          delete timeoutRefs.current[key];
        }
      });

      // Close all menus and only open this one
      setOpenMenus({ [menuId]: true });
      console.log("Set openMenus to:", { [menuId]: true });
    }
  };

  // Handle mouse leave on menu item
  const handleMenuMouseLeave = (menuId: string, hasDropdown: boolean) => {
    if (hasDropdown) {
      console.log("Mouse leave:", menuId);
      // Store timeout reference so we can cancel it if needed
      timeoutRefs.current[menuId] = setTimeout(() => {
        console.log("Closing menu:", menuId);
        setOpenMenus((prev) => {
          const newState = { ...prev };
          delete newState[menuId];
          console.log("New openMenus state:", newState);
          return newState;
        });
      }, 300);
    }
  };

  if (loading) {
    return (
      <ul className="flex list-none gap-4 md:gap-6 lg:gap-8 xl:gap-10 items-center">
        <li
          key="skeleton-1"
          className="animate-pulse bg-gray-200 h-6 w-20 rounded"
        ></li>
        <li
          key="skeleton-2"
          className="animate-pulse bg-gray-200 h-6 w-16 rounded"
        ></li>
        <li
          key="skeleton-3"
          className="animate-pulse bg-gray-200 h-6 w-18 rounded"
        ></li>
        <li
          key="skeleton-4"
          className="animate-pulse bg-gray-200 h-6 w-14 rounded"
        ></li>
        <li
          key="skeleton-5"
          className="animate-pulse bg-gray-200 h-6 w-16 rounded"
        ></li>
        <li
          key="skeleton-6"
          className="animate-pulse bg-gray-200 h-6 w-12 rounded"
        ></li>
      </ul>
    );
  }

  return (
    <ul className="flex list-none gap-4 md:gap-6 lg:gap-8 xl:gap-10 items-center">
      {headerMenus.map((menu, index) => (
        <li
          key={menu.id || `menu-${index}`}
          className="relative"
          onMouseEnter={() => handleMenuMouseEnter(menu.id, menu.hasDropdown)}
          onMouseLeave={() => handleMenuMouseLeave(menu.id, menu.hasDropdown)}
        >
          {menu.hasDropdown && menu.dropdownItems.length > 0 ? (
            <div className="relative inline-block text-left">
              <div className="no-underline text-black hover:text-[#e03c31] transition-colors duration-200 font-medium flex items-center gap-1 cursor-pointer">
                <Link href={menu.href} className="no-underline text-inherit">
                  {menu.label}
                </Link>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    openMenus[menu.id] ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </div>

              {openMenus[menu.id] && (
                <div
                  className="absolute left-0 mt-2 w-64 origin-top-left rounded-md bg-white shadow-lg focus:outline-none z-50 border border-gray-100 overflow-hidden scrollbar-stable"
                  onMouseEnter={() => handleMenuMouseEnter(menu.id, true)}
                  onMouseLeave={() => handleMenuMouseLeave(menu.id, true)}
                >
                  <div className="py-1">
                    {menu.dropdownItems
                      .filter((item) => item.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map((item, itemIndex) => (
                        <div
                          key={item.id || `dropdown-${menu.id}-${itemIndex}`}
                          className="block px-4 py-3 text-sm hover:bg-gray-50 border-l-2 border-transparent hover:border-l-2 hover:border-[#e03c31] transition-all duration-150"
                        >
                          <Link
                            href={item.href}
                            className="no-underline text-gray-900 hover:text-[#e03c31] block"
                          >
                            {item.label}
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={menu.href}
              className="no-underline text-black hover:text-[#e03c31] transition-colors duration-200 font-medium"
            >
              {menu.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
});

Navbar.displayName = "Navbar";
