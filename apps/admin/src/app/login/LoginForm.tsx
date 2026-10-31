"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { login, type LoginState } from "@/lib/actions";
import { buttonClass, ErrorNote } from "@/components/ui";

const field =
  "mt-1.5 w-full rounded-2xl bg-ivory px-4 py-3 text-sm text-plum-900 ring-1 ring-blush-200 outline-none transition placeholder:text-plum-700/40 focus:bg-white focus:ring-2 focus:ring-blush-300";

export default function LoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={params.get("next") ?? "/"} />
      {params.has("expired") && !state.error && <p className="rounded-2xl bg-lilac-100 px-3.5 py-2.5 text-sm text-plum-700">Your session ended. Please sign in again.</p>}
      <label className="block text-sm font-medium text-plum-700">
        Email
        <input key={state.email ?? ""} defaultValue={state.email} name="email" type="email" autoComplete="username" required className={field} placeholder="admin@lasanfamily.in" />
      </label>
      <label className="block text-sm font-medium text-plum-700">
        Password
        <input name="password" type="password" autoFocus={!!state.error} autoComplete="current-password" required minLength={6} className={field} />
      </label>
      {state.error && <ErrorNote>{state.error}</ErrorNote>}
      <button type="submit" disabled={pending} className={`${buttonClass.primary} w-full py-3`}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
