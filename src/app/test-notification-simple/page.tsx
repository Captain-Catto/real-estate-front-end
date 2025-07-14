"use client";

import React from "react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export default function TestNotificationSimple() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Test Notification Dropdown</h1>

        {/* Original component */}
        <div className="bg-white p-8 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Original NotificationDropdown
          </h2>
          <div className="flex justify-end">
            <NotificationDropdown />
          </div>
        </div>

        {/* Simple component for debugging */}
        <div className="bg-white p-8 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Simple NotificationDropdown (Debug) - Removed
          </h2>
          <div className="flex justify-end">
            <p className="text-gray-500">
              SimpleNotificationDropdown has been removed
            </p>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h2 className="font-semibold mb-2">Debug Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click the bell icon above</li>
            <li>Open browser console (F12)</li>
            <li>
              Check for &quot;Fetching notifications...&quot; and response logs
            </li>
            <li>
              If you see data logged but no UI, there&apos;s a rendering issue
            </li>
            <li>If no token found, you need to login first</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
