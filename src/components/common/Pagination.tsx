"use client";
import React, { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPages?: number;
  className?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPages = 5,
  className = "",
}: PaginationProps) {
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState(currentPage.toString());

  const getDesktopPages = () => {
    const pages = [];
    const half = Math.floor(showPages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const desktopPages = getDesktopPages();

  const handleMobilePageClick = () => {
    setIsInputMode(true);
    setInputValue(currentPage.toString());
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputValue);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
    setIsInputMode(false);
  };

  const handleInputBlur = () => {
    setIsInputMode(false);
    setInputValue(currentPage.toString());
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsInputMode(false);
      setInputValue(currentPage.toString());
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={classNames("flex items-center justify-center", className)}
      aria-label="Pagination"
    >
      <div className="flex items-center space-x-1">
        {/* Previous Page */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={classNames(
            "relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          )}
          aria-label="Trang trước"
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Mobile Version with Input */}
        <div className="flex sm:hidden">
          {isInputMode ? (
            <form onSubmit={handleInputSubmit} className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-1">
                Trang
              </span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-12 px-2 py-1 text-sm text-center border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <span className="text-sm font-medium text-gray-700 ml-1">
                / {totalPages}
              </span>
            </form>
          ) : (
            <button
              onClick={handleMobilePageClick}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <span>
                Trang {currentPage} / {totalPages}
              </span>
            </button>
          )}
        </div>

        {/* Desktop Version */}
        <div className="hidden sm:flex space-x-1">
          {/* First page */}
          {desktopPages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                1
              </button>
              {desktopPages[0] > 2 && (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
            </>
          )}

          {/* Page numbers */}
          {desktopPages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={classNames(
                "relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                page === currentPage
                  ? "z-10 bg-blue-600 border-blue-600 text-white"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              )}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {desktopPages[desktopPages.length - 1] < totalPages && (
            <>
              {desktopPages[desktopPages.length - 1] < totalPages - 1 && (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={classNames(
            "relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          )}
          aria-label="Trang sau"
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
