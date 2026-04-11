import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import AdminBadge from "@/components/cv/AdminBadge";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminOverlay() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cv-presenter-token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;

  return (
    <>
      <AdminBadge />
      <div className="fixed top-4 right-4 z-50">
        <LogoutButton />
      </div>
    </>
  );
}
