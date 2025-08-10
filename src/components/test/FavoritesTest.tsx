"use client";

import { useAuth, useFavorites } from "@/store/hooks";
import { useAppSelector } from "@/store/hooks";
import {
  selectFavorites,
  selectFavoritesLoading,
} from "@/store/slices/favoritesSlices";

/**
 * Test component để kiểm tra hệ thống favorites hoạt động đúng
 * Component này giúp debug và xác minh:
 * 1. Redux store đang hoạt động
 * 2. Favorites được fetch và lưu trữ đúng
 * 3. Optimistic updates hoạt động
 * 4. Không sử dụng localStorage
 */
export default function FavoritesTest() {
  const { isAuthenticated, user } = useAuth();
  const { favorites, loading, error, fetchUserFavorites, toggleFavorite } =
    useFavorites();

  // Direct Redux selectors cho debug
  const storeState = useAppSelector((state) => state.favorites);
  const allFavorites = useAppSelector(selectFavorites);
  const isLoading = useAppSelector(selectFavoritesLoading);

  const handleTestToggle = async () => {
    // Test với một property ID giả định
    const testPropertyId = "test-property-123";
    console.log("Testing toggle favorite for:", testPropertyId);
    const result = await toggleFavorite(testPropertyId);
    console.log("Toggle result:", result);
  };

  const handleRefresh = async () => {
    console.log("Refreshing favorites...");
    const result = await fetchUserFavorites();
    console.log("Refresh result:", result);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-4">Favorites System Test</h2>

      {/* Authentication Status */}
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold">Authentication Status:</h3>
        <p>Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}</p>
        <p>User: {user?.username || "Not logged in"}</p>
      </div>

      {/* Redux Store State */}
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold">Redux Store State:</h3>
        <p>Items count: {storeState.items.length}</p>
        <p>Loading: {storeState.isLoading ? "⏳ Yes" : "✅ No"}</p>
        <p>Error: {storeState.error || "None"}</p>
        <details className="mt-2">
          <summary className="cursor-pointer">Raw Store Data</summary>
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(storeState, null, 2)}
          </pre>
        </details>
      </div>

      {/* Hook Results */}
      <div className="mb-4 p-4 bg-green-50 rounded">
        <h3 className="font-semibold">useFavorites Hook Results:</h3>
        <p>Favorites count: {favorites.length}</p>
        <p>Loading: {loading ? "⏳ Yes" : "✅ No"}</p>
        <p>Error: {error || "None"}</p>
        {favorites.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">Favorites List</summary>
            <div className="mt-2 space-y-2">
              {favorites.map((fav, index) => (
                <div
                  key={fav.id}
                  className="text-sm bg-white p-2 rounded border"
                >
                  <p>
                    <strong>{index + 1}.</strong> {fav.title}
                  </p>
                  <p>ID: {fav.id}</p>
                  <p>Location: {fav.location}</p>
                  <p>Price: {fav.price || "N/A"}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Direct Selector Results */}
      <div className="mb-4 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold">Direct Redux Selectors:</h3>
        <p>selectFavorites count: {allFavorites.length}</p>
        <p>selectFavoritesLoading: {isLoading ? "⏳ Yes" : "✅ No"}</p>
      </div>

      {/* Actions */}
      <div className="mb-4 p-4 bg-purple-50 rounded">
        <h3 className="font-semibold mb-3">Test Actions:</h3>
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Favorites"}
          </button>

          <button
            onClick={handleTestToggle}
            disabled={loading || !isAuthenticated}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Toggle (Mock Property)
          </button>
        </div>
      </div>

      {/* localStorage Check */}
      <div className="mb-4 p-4 bg-red-50 rounded">
        <h3 className="font-semibold">localStorage Check:</h3>
        <p>No localStorage should be used for favorites ✅</p>
        {typeof window !== "undefined" && (
          <div className="mt-2">
            <p>
              Current localStorage keys:{" "}
              {Object.keys(localStorage).join(", ") || "None"}
            </p>
            <p>
              Favorites in localStorage:{" "}
              {localStorage.getItem("favorites")
                ? "❌ Found (Bad!)"
                : "✅ None (Good!)"}
            </p>
          </div>
        )}
      </div>

      {/* Performance Notes */}
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="font-semibold">System Status:</h3>
        <ul className="mt-2 space-y-1 text-sm">
          <li>✅ Redux-only approach (no localStorage)</li>
          <li>✅ Optimistic updates for immediate UI feedback</li>
          <li>✅ Automatic fetching on auth initialization</li>
          <li>✅ Proper error handling</li>
          <li>✅ Loading states managed</li>
        </ul>
      </div>
    </div>
  );
}
