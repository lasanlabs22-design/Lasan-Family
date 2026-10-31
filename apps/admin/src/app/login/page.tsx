import { Suspense } from "react";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(ellipse_at_top,var(--color-blush-50),transparent_60%)] px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-10 rounded-[32px] bg-white p-8 shadow-[0_24px_60px_-30px_rgb(42_20_40/0.25)] ring-1 ring-blush-100">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-plum-900">Admin sign in</h1>
          <p className="mt-1.5 text-sm text-plum-700/70">For the Lasan Family operations team.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
