"use client";

import { useEffect, useState } from "react";

const AuthDebugger = () => {
  const [authStatus, setAuthStatus] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("=== AUTH DEBUGGER ===");
        console.log("Document cookies:", document.cookie);

        // Check auth status
        const response = await fetch("http://localhost:8080/api/auth/profile", {
          credentials: "include",
        });

        console.log("Auth response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Auth data:", data);
          setAuthStatus(data);
        } else {
          const errorText = await response.text();
          console.log("Auth error:", errorText);
          setAuthStatus({ error: errorText });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthStatus({ error: (error as Error).message || "Unknown error" });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <pre className="text-sm bg-white p-2 rounded overflow-auto">
        {JSON.stringify(authStatus, null, 2)}
      </pre>
      <div className="mt-2">
        <strong>Cookies:</strong>
        <pre className="text-sm bg-white p-2 rounded mt-1">
          {document.cookie || "No cookies"}
        </pre>
      </div>
    </div>
  );
};

export default AuthDebugger;
