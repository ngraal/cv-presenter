import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("cv-presenter-token")?.value;

  if (!token) redirect("/");

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen section-gradient-1">
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
