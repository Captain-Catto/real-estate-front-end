"use client";
import React from "react";
import { toast } from "sonner";

export function ToastTest() {
  const testBasicToast = () => {
    console.log("Testing basic toast...");
    toast("Basic toast message");
  };

  const testSuccessToast = () => {
    console.log("Testing success toast...");
    toast.success("Success message");
  };

  const testErrorToast = () => {
    console.log("Testing error toast...");
    toast.error("Error message");
  };

  const testPromiseToast = () => {
    console.log("Testing promise toast...");
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "Loading...",
      success: "Success!",
      error: "Error!",
    });
  };

  const testCustomToast = () => {
    console.log("Testing custom toast...");
    toast.custom((t) => (
      <div
        style={{
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        Custom toast content! ID: {t}
      </div>
    ));
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-4">Toast Debug Panel</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={testBasicToast}
          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
        >
          Basic Toast
        </button>
        <button
          onClick={testSuccessToast}
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
        >
          Success Toast
        </button>
        <button
          onClick={testErrorToast}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
        >
          Error Toast
        </button>
        <button
          onClick={testPromiseToast}
          className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
        >
          Promise Toast
        </button>
        <button
          onClick={testCustomToast}
          className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600"
        >
          Custom Toast
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Check console for logs and look for toasts in top-right corner
      </div>
    </div>
  );
}
