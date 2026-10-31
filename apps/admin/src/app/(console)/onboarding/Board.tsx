"use client";

import { useOptimistic, useState, useTransition } from "react";
import clsx from "clsx";
import { GripVertical, Loader2, MapPin, Phone } from "lucide-react";
import { APPLICATION_STAGES, STAGE_LABEL, serviceBySlug, type ApplicationDTO, type ApplicationStage } from "@lasan/shared";
import { updateApplication } from "@/lib/actions";
import { ErrorNote, fmtDate, fmtPhone } from "@/components/ui";

const TONE: Record<ApplicationStage, string> = {
  new: "bg-peach-100",
  screening: "bg-lilac-100",
  documents: "bg-blush-100",
  skills_test: "bg-plum-50",
  approved: "bg-sage-100",
  rejected: "bg-blush-50",
};

export default function Board({ applications }: { applications: ApplicationDTO[] }) {
  const [items, move] = useOptimistic(applications, (cur, { id, stage }: { id: string; stage: ApplicationStage }) =>
    cur.map((a) => (a.id === id ? { ...a, stage } : a)),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState<ApplicationStage | null>(null);
  const [, start] = useTransition();

  const setStage = (a: ApplicationDTO, stage: ApplicationStage) => {
    if (a.stage === stage) return;
    if (a.stage === "approved") {
      setError(`${a.name} is already approved and has a helper profile. Manage her on the Helpers page.`);
      return;
    }
    setError(null);
    setPendingId(a.id);
    start(async () => {
      move({ id: a.id, stage });
      const r = await updateApplication(a.id, stage);
      if (r.error) setError(`${a.name}: ${r.error}`);
      setPendingId(null);
    });
  };

  return (
    <div>
      {error && <ErrorNote className="mb-4">{error}</ErrorNote>}
      <div className="-mx-6 overflow-x-auto px-6 pb-4 lg:-mx-10 lg:px-10">
        <div className="flex min-w-max gap-4">
          {APPLICATION_STAGES.map((stage) => {
            const col = items.filter((a) => a.stage === stage);
            return (
              <section
                key={stage}
                aria-label={STAGE_LABEL[stage]}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(stage);
                }}
                onDragLeave={() => setOver((s) => (s === stage ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(null);
                  const a = items.find((x) => x.id === e.dataTransfer.getData("text/plain"));
                  if (a) setStage(a, stage);
                }}
                className={clsx("flex w-72 shrink-0 flex-col rounded-[24px] bg-ivory p-3 ring-1 transition", over === stage ? "ring-2 ring-blush-300" : "ring-blush-100")}
              >
                <header className="flex items-center justify-between px-2 pt-1 pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-plum-900">
                    <span className={clsx("size-2.5 rounded-full", TONE[stage])} aria-hidden />
                    {STAGE_LABEL[stage]}
                  </h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-plum-700/70 tabular-nums ring-1 ring-blush-100">{col.length}</span>
                </header>
                <div className="flex min-h-24 flex-col gap-2.5">
                  {col.length === 0 && <p className="rounded-2xl border border-dashed border-blush-200 px-3 py-6 text-center text-xs text-plum-700/50">No applications</p>}
                  {col.map((a) => (
                    <article
                      key={a.id}
                      draggable={a.stage !== "approved"}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", a.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className={clsx(
                        "rounded-2xl bg-white p-3.5 ring-1 ring-blush-100 transition",
                        a.stage !== "approved" && "cursor-grab active:cursor-grabbing hover:shadow-[0_10px_24px_-18px_rgb(42_20_40/0.45)]",
                        pendingId === a.id && "opacity-60",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-plum-900">{a.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-plum-700/65">
                            <MapPin className="size-3" /> {a.locality ? `${a.locality}, ` : ""}
                            {a.cityName}
                          </p>
                        </div>
                        {pendingId === a.id ? <Loader2 className="size-4 animate-spin text-plum-500" /> : a.stage !== "approved" && <GripVertical className="size-4 text-plum-300" aria-hidden />}
                      </div>
                      <a href={`tel:${a.phone}`} className="mt-1 flex items-center gap-1 text-xs text-blush-600 hover:underline">
                        <Phone className="size-3" /> {fmtPhone(a.phone)}
                      </a>
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {a.skills.map((s) => (
                          <span key={s} className="rounded-full bg-blush-50 px-2 py-0.5 text-[11px] font-medium text-plum-700">
                            {serviceBySlug(s)?.name ?? s}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-plum-700/55">
                        {a.experience === "0" ? "New to the work" : `${a.experience} years`} · {a.languages.join(", ")} · applied {fmtDate(a.createdAt)}
                      </p>
                      {a.notes && <p className="mt-2 rounded-xl bg-ivory px-2.5 py-1.5 text-xs text-plum-700/80">{a.notes}</p>}
                      {a.stage !== "approved" && (
                        <select
                          aria-label={`Move ${a.name} to stage`}
                          value={a.stage}
                          disabled={pendingId === a.id}
                          onChange={(e) => setStage(a, e.target.value as ApplicationStage)}
                          className="mt-3 w-full rounded-xl bg-ivory px-2.5 py-1.5 text-xs font-medium text-plum-700 ring-1 ring-blush-100 outline-none focus:ring-2 focus:ring-blush-300"
                        >
                          {APPLICATION_STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s === a.stage ? `Stage: ${STAGE_LABEL[s]}` : `Move to ${STAGE_LABEL[s]}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
