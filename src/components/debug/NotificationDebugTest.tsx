// Test component để debug notification navigation
"use client";

import React from "react";
import { useRouter } from "next/navigation";

const NotificationDebugTest = () => {
  const router = useRouter();

  const testNotifications = [
    {
      _id: "1",
      title: "Test Navigation",
      message: "Click to test navigation",
      type: "SYSTEM" as const,
      read: false,
      createdAt: new Date().toISOString(),
      userId: "test",
      data: {
        actionButton: {
          text: "Xem chi tiết",
          link: "/bat-dong-san",
          style: "primary" as const,
        },
      },
    },
  ];

  const handleTestNavigation = (link: string) => {
    console.log("Testing navigation to:", link);
    router.push(link);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Notification Navigation Test</h3>
      {testNotifications.map((notification) => (
        <div key={notification._id} className="border p-2 mb-2">
          <p>
            <strong>{notification.title}</strong>
          </p>
          <p>{notification.message}</p>
          {notification.data?.actionButton?.link && (
            <button
              onClick={() =>
                handleTestNavigation(notification.data.actionButton!.link!)
              }
              className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
            >
              {notification.data.actionButton.text}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationDebugTest;
