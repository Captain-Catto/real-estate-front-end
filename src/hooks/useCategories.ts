"use client";

import { useState, useEffect, useCallback } from "react";
import { Category, categoryService } from "@/services/categoryService";
import { showErrorToast } from "@/utils/errorHandler";

interface UseCategoriesOptions {
  type?: "all" | "property" | "project";
  activeOnly?: boolean;
  sortByOrder?: boolean;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { type = "all", activeOnly = true, sortByOrder = true } = options;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result: Category[] = [];

      if (type === "all") {
        result = await categoryService.getAll();
      } else {
        result = await categoryService.getByProjectType(type === "project");
      }

      // Filter active categories if needed
      if (activeOnly) {
        result = result.filter((cat) => cat.isActive !== false);
      }

      // Sort by order if needed
      if (sortByOrder) {
        result = result.sort((a, b) => (a.order || 0) - (b.order || 0));
      }

      setCategories(result);
    } catch {
      showErrorToast("Không thể tải danh sách danh mục");
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [type, activeOnly, sortByOrder]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Helper functions
  const getCategoryBySlug = useCallback(
    (slug: string): Category | undefined => {
      return categories.find((cat) => cat.slug === slug);
    },
    [categories]
  );

  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((cat) => cat._id === id || cat.id === id);
    },
    [categories]
  );

  const getPropertyCategories = useCallback((): Category[] => {
    return categories.filter((cat) => !cat.isProject);
  }, [categories]);

  const getProjectCategories = useCallback((): Category[] => {
    return categories.filter((cat) => cat.isProject);
  }, [categories]);

  return {
    categories,
    loading,
    error,
    refresh,
    getCategoryBySlug,
    getCategoryById,
    getPropertyCategories,
    getProjectCategories,
  };
}
