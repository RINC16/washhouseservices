import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AppFrame>
      <section className="page-shell py-14 sm:py-20">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-brand-deep">Welcome to WashHouse</h1>
            <p className="mt-3 text-sm text-brand-muted">Sign in to book, manage and track your laundry orders.</p>
          </div>
          <AuthForm nextPath={next} />
        </div>
      </section>
    </AppFrame>
  );
}
