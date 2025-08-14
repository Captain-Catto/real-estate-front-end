import { redirect } from "next/navigation";

export default function AreasPage() {
  // Redirect to admin dashboard since this page is empty
  redirect("/admin");
}
