import { Suspense } from "react";
import { LogOut } from "lucide-react";
import type { SessionUser } from "@lasan/shared";
import Sidebar, { MobileNav } from "@/components/Sidebar";
import SearchBox from "@/components/SearchBox";
import { Skeleton } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { logout } from "@/lib/actions";

async function AdminBadge() {
  const me = await apiGet<SessionUser>("/auth/me");
  const name = me.name || me.email || "Admin";
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-plum-900">{name}</p>
        {me.email && me.email !== name && <p className="text-xs text-plum-700/60">{me.email}</p>}
      </div>
      <span className="grid size-9 place-items-center rounded-full bg-blush-100 font-display text-sm font-semibold text-plum-700" aria-hidden>
        {name.slice(0, 1).toUpperCase()}
      </span>
      <form action={logout}>
        <button type="submit" className="grid size-9 place-items-center rounded-full text-plum-700 transition hover:bg-blush-50" aria-label="Sign out" title="Sign out">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

export default function ConsoleLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-blush-100 bg-cream/85 px-6 py-3 backdrop-blur-md lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <Suspense fallback={<Skeleton className="h-10 w-full max-w-md rounded-full" />}>
              <SearchBox />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-9 w-40 rounded-full" />}>
              <AdminBadge />
            </Suspense>
          </div>
          <div className="mt-3 md:hidden">
            <MobileNav />
          </div>
        </header>
        <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
