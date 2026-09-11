import { DatabaseZap } from "lucide-react";

export function ConfigurationNotice() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-brand-blue-soft p-6 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-brand-blue"><DatabaseZap size={22} /></span>
      <h2 className="mt-4 text-lg font-extrabold text-brand-deep">Connect the Supabase project</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-brand-muted">
        Copy <code>.env.example</code> to <code>.env.local</code>, add the project URL and publishable key, then run the included SQL migration.
      </p>
    </div>
  );
}
