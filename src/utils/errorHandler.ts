import { toast } from "sonner";

/**
 * Utility to extract proper error messages from various error types
 * and display them via toast notifications
 */

interface ApiError {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface ErrorResponse {
  data?: ApiError;
  message?: string;
}

/**
 * Extract the most relevant error message from different error formats
 */
export function extractErrorMessage(error: unknown, fallbackMessage?: string): string {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, use its message
  if (error instanceof Error) {
    return error.message;
  }

  // If it's an API error response with nested structure
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    
    // Check for nested response.data.message (axios style)
    if (errorObj.response?.data?.message) {
      return errorObj.response.data.message;
    }
    
    // Check for data.message (fetch style)
    if (errorObj.data?.message) {
      return errorObj.data.message;
    }
    
    // Check for direct message property
    if (errorObj.message) {
      return errorObj.message;
    }
    
    // Check for validation errors array and return first one
    if (errorObj.errors && Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
      return errorObj.errors[0].message;
    }
  }

  // Return fallback message or generic error
  return fallbackMessage || "Đã xảy ra lỗi không mong muốn";
}

/**
 * Display error toast with properly extracted message
 */
export function showErrorToast(error: unknown, fallbackMessage?: string): void {
  const message = extractErrorMessage(error, fallbackMessage);
  toast.error(message);
}

/**
 * Display success toast
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}

/**
 * Display info toast
 */
export function showInfoToast(message: string): void {
  toast.info(message);
}

/**
 * Display warning toast
 */
export function showWarningToast(message: string): void {
  toast.warning(message);
}