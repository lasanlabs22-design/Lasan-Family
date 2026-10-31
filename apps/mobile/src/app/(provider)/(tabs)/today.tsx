import { Sun } from "lucide-react-native";
import { EmptyState, ErrorState, JobCard, Screen, SkeletonCard } from "@/components";
import { errorMessage } from "@/lib/api";
import { firstName, greeting } from "@/lib/format";
import { useProviderMe, useProviderVisits, usePullToRefresh } from "@/lib/queries";
import { useSession } from "@/lib/session";

export default function Today() {
  const { user } = useSession();
  const me = useProviderMe();
  const visits = useProviderVisits("today", true);
  const { refreshing, onRefresh } = usePullToRefresh(() => Promise.all([visits.refetch(), me.refetch()]));
  const list = visits.data ?? [];
  const left = list.filter((v) => v.status !== "done").length;
  const name = firstName(me.data?.name ?? user?.name);

  return (
    <Screen
      overline={greeting()}
      title={name ? `Hello, ${name}` : "Today"}
      subtitle={visits.data ? (list.length ? `${list.length} ${list.length === 1 ? "home" : "homes"} today${left ? `, ${left} to go` : ", all done"}.` : undefined) : "Loading today's homes…"}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {visits.isPending ? (
        <SkeletonCard lines={5} />
      ) : visits.isError ? (
        <ErrorState message={errorMessage(visits.error)} onRetry={() => visits.refetch()} />
      ) : list.length ? (
        list.map((v) => <JobCard key={v.id} visit={v} actions />)
      ) : (
        <EmptyState icon={Sun} tone="sage" title="No visits today" text="Enjoy your day off. Your coordinator will call if a new home needs you." />
      )}
    </Screen>
  );
}
