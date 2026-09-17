"use client";

import { LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export function AuthForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setErrorMessage("");

    try {
      const supabase = createClient();

      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setMessage("Account created. Check your email if confirmation is enabled in Supabase.");
        return;
      }

      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const safeNextPath =
        nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/dashboard";
      const isAdmin = profile?.role === "admin";
      const destination = isAdmin
        ? safeNextPath.startsWith("/admin")
          ? safeNextPath
          : "/admin"
        : safeNextPath.startsWith("/admin")
          ? "/dashboard"
          : safeNextPath;

      router.push(destination);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-6 card-shadow sm:p-8">
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        {(["login", "register"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-lg px-4 py-2.5 text-sm font-bold capitalize transition ${mode === item ? "bg-white text-brand-deep shadow-sm" : "text-brand-muted"}`}>
            {item === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        {mode === "register" ? (
          <label className="block text-sm font-bold text-brand-deep">Full name<div className="relative mt-2"><UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={17} /><input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-brand-border py-3 pl-11 pr-4 font-normal" /></div></label>
        ) : null}
        <label className="block text-sm font-bold text-brand-deep">Email address<div className="relative mt-2"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={17} /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-brand-border py-3 pl-11 pr-4 font-normal" /></div></label>
        <label className="block text-sm font-bold text-brand-deep">Password<div className="relative mt-2"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={17} /><input required minLength={8} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-brand-border py-3 pl-11 pr-4 font-normal" /></div></label>
        {message ? <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}
        {errorMessage ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}
        <button disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-blue-dark disabled:opacity-60">
          {submitting ? <LoaderCircle size={17} className="animate-spin" /> : null}
          {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
