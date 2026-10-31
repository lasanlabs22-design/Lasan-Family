"use client";

import { RotateCcw } from "lucide-react";
import { buttonClass, ErrorNote } from "@/components/ui";

export default function ConsoleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Production hides server error messages; ours are friendly API messages, shown when available.
  const message = error.digest && error.message.startsWith("An error occurred") ? "We couldn't load this page. Please try again." : error.message;
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="font-display text-2xl font-semibold text-plum-900">Something went wrong</h1>
      <ErrorNote className="mt-6 text-left">{message || "We couldn't load this page. Please try again."}</ErrorNote>
      <button type="button" onClick={reset} className={`${buttonClass.secondary} mt-6`}>
        <RotateCcw className="size-4" /> Try again
      </button>
    </div>
  );
}
