import { UserSidebar } from "./UserSidebar";

export default function User() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
      <div className="flex">
        <UserSidebar />
        <div className="flex-1 ml-4">
          {/* Main content will go here */}
          <p className="text-gray-700">Welcome to your dashboard!</p>
        </div>
      </div>
    </>
  );
}
