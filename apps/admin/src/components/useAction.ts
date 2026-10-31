"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions";

/** Runs a Server Action in a transition and keeps its friendly error for inline display. */
export function useAction() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<ActionResult>, onOk?: () => void) => {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r.error) setError(r.error);
      else onOk?.();
    });
  };
  return { pending, error, setError, run };
}
