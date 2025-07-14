"use client";
import { useState } from "react";
import { locationService, LocationNames } from "@/services/locationService";

export function LocationNamesTest() {
  const [result, setResult] = useState<
    LocationNames | { error: string } | null
  >(null);
  const [loading, setLoading] = useState(false);

  const testLocationNames = async () => {
    setLoading(true);
    try {
      // Test với data thực từ project Sunrise City View
      const result = await locationService.getLocationNames(
        "79",
        "778",
        "27475"
      );
      console.log("🧪 Test result:", result);
      setResult(result);
    } catch (error) {
      console.error("🚨 Test error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-4">🧪 Location Names API Test</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Test với location codes từ project &quot;Sunrise City View&quot;:
        </p>
        <ul className="text-sm text-gray-500">
          <li>Province Code: 79</li>
          <li>District Code: 778</li>
          <li>Ward Code: 27475</li>
        </ul>
      </div>

      <button
        onClick={testLocationNames}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test getLocationNames API"}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-white border rounded">
          <h4 className="font-medium text-gray-900 mb-2">Result:</h4>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
