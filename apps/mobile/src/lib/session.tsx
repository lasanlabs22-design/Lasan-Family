import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import type { AuthResponse, SessionUser } from "@lasan/shared";
import { useQueryClient } from "@tanstack/react-query";
import { api, isUnauthorized, setApiToken, setUnauthorizedHandler } from "./api";

const KEY = "lasan.session.v1";

/** Secure storage that never throws (e.g. on web, where SecureStore isn't available). */
const store = {
  get: () => SecureStore.getItemAsync(KEY).catch(() => null),
  set: (v: string) => SecureStore.setItemAsync(KEY, v).catch(() => {}),
  clear: () => SecureStore.deleteItemAsync(KEY).catch(() => {}),
};

type Session = { token: string; user: SessionUser };
type State = { status: "loading" } | { status: "signedOut" } | ({ status: "signedIn" } & Session);

type SessionContext = {
  state: State;
  user: SessionUser | null;
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
};

const Ctx = createContext<SessionContext | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const queryClient = useQueryClient();

  // Restore the saved session on launch, then confirm it is still valid.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await store.get();
      let saved: Session | null = null;
      try {
        saved = raw ? (JSON.parse(raw) as Session) : null;
      } catch {
        saved = null;
      }
      if (!saved?.token) {
        if (!cancelled) setState({ status: "signedOut" });
        return;
      }
      setApiToken(saved.token);
      if (!cancelled) setState({ status: "signedIn", ...saved });
      try {
        await api.get("/auth/me");
      } catch (err) {
        if (isUnauthorized(err) && !cancelled) {
          setApiToken(null);
          await store.clear();
          setState({ status: "signedOut" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async ({ token, user }: AuthResponse) => {
    queryClient.clear();
    setApiToken(token);
    await store.set(JSON.stringify({ token, user }));
    setState({ status: "signedIn", token, user });
  }, [queryClient]);

  const signOut = useCallback(async () => {
    setApiToken(null);
    await store.clear();
    setState({ status: "signedOut" });
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setState((s) => {
      if (s.status !== "signedIn") return s;
      const next = { token: s.token, user: { ...s.user, ...patch } };
      void store.set(JSON.stringify(next));
      return { status: "signedIn", ...next };
    });
  }, []);

  const value = useMemo(
    () => ({ state, user: state.status === "signedIn" ? state.user : null, signIn, signOut, updateUser }),
    [state, signIn, signOut, updateUser],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
