import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | WashHouse Admin",
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile, user } = await requireAdmin();

  return (
    <AdminShell adminName={profile.full_name || "WashHouse Admin"} adminEmail={user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
