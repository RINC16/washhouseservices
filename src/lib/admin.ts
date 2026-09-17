import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  return {
    supabase,
    user: authData.user,
    profile,
  };
});
