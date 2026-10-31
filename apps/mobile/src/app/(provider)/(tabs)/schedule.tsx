import { CalendarDays } from "lucide-react-native";
import { EmptyState, ErrorState, JobCard, Screen, Section, SkeletonCard } from "@/components";
import { errorMessage } from "@/lib/api";
import { dayLabel } from "@/lib/format";
import { useProviderVisits, usePullToRefresh, type ProviderJob } from "@/lib/queries";

export default function Schedule() {
  const q = useProviderVisits("upcoming");
  const { refreshing, onRefresh } = usePullToRefresh(q.refetch);
  const groups = new Map<string, ProviderJob[]>();
  for (const v of q.data ?? []) groups.set(v.date, [...(groups.get(v.date) ?? []), v]);

  return (
    <Screen title="Schedule" subtitle="Your visits for the next 14 days." refreshing={refreshing} onRefresh={onRefresh}>
      {q.isPending ? (
        <>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </>
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : groups.size ? (
        [...groups.entries()].map(([date, visits]) => (
          <Section key={date} title={dayLabel(date)}>
            {visits.map((v) => (
              <JobCard key={v.id} visit={v} />
            ))}
          </Section>
        ))
      ) : (
        <EmptyState icon={CalendarDays} tone="lilac" title="Nothing scheduled yet" text="New homes appear here as soon as your coordinator assigns them." />
      )}
    </Screen>
  );
}
