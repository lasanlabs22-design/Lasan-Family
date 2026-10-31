"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { formatINR } from "@lasan/shared";

// Chart tokens shared with the website dashboard: one accent, quiet grid, muted ink for labels.
const ACCENT = "#b93d5f";
const GRID = "#f3e8ec";
const INK_MUTED = "rgb(77 38 73 / 0.55)";

type Day = { date: string; bookings: number; revenue: number };
type Metric = "bookings" | "revenue";

function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => Math.round(i * step));
}

const short = (n: number) => (n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
const label = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export default function TrendChart({ daily }: { daily: Day[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [metric, setMetric] = useState<Metric>("bookings");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const values = daily.map((d) => d[metric]);
  const ticks = niceTicks(Math.max(...values, 1));
  const max = ticks[ticks.length - 1];
  const H = 260;
  const m = { l: 44, r: 8, t: 20, b: 28 };
  const n = daily.length;
  const bandW = n ? (W - m.l - m.r) / n : 0;
  const barW = Math.max(2, Math.min(18, bandW * 0.6));
  const y = (v: number) => m.t + (1 - v / max) * (H - m.t - m.b);
  const fmt = (v: number) => (metric === "revenue" ? formatINR(v) : `${v} booking${v === 1 ? "" : "s"}`);
  const total = values.reduce((s, v) => s + v, 0);

  const bar = (cx: number, v: number) => {
    const top = y(v);
    const base = H - m.b;
    if (base - top < 0.5) return "";
    const r = Math.min(4, (base - top) / 2, barW / 2);
    const l = cx - barW / 2;
    const rt = cx + barW / 2;
    return `M${l},${base}V${top + r}Q${l},${top} ${l + r},${top}H${rt - r}Q${rt},${top} ${rt},${top + r}V${base}Z`;
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-plum-700/70">
          <span className="font-display text-2xl font-semibold text-plum-900 tabular-nums">{metric === "revenue" ? formatINR(total) : total}</span>{" "}
          {metric === "revenue" ? "booked revenue" : "bookings"} in the last 30 days
        </p>
        <div role="tablist" aria-label="Chart metric" className="inline-flex rounded-full bg-blush-50 p-1 ring-1 ring-blush-100">
          {(["bookings", "revenue"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={metric === k}
              onClick={() => setMetric(k)}
              className={clsx("rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition", metric === k ? "bg-white text-plum-900 shadow-sm" : "text-plum-700/70 hover:text-plum-900")}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} className="relative">
        {W > 0 && n > 0 && (
          <svg width={W} height={H} role="img" aria-label={`Daily ${metric} for the last 30 days`} className="block">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
                <text x={m.l - 8} y={y(t) + 3.5} fontSize={10} textAnchor="end" fill={INK_MUTED} className="tabular-nums">
                  {metric === "revenue" ? `₹${short(t)}` : t}
                </text>
              </g>
            ))}
            {daily.map((d, i) => {
              const cx = m.l + bandW * (i + 0.5);
              return (
                <g
                  key={d.date}
                  tabIndex={0}
                  aria-label={`${label(d.date)}: ${fmt(d[metric])}`}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="outline-none"
                >
                  <rect x={cx - bandW / 2} y={m.t} width={bandW} height={H - m.t - m.b} fill={hover === i ? "rgb(251 229 234 / 0.45)" : "transparent"} />
                  <path d={bar(cx, d[metric])} fill={ACCENT} opacity={hover === null || hover === i ? 1 : 0.45} className="transition-opacity" />
                  {(n - 1 - i) % 5 === 0 && (
                    <text x={cx} y={H - 8} fontSize={10} textAnchor="middle" fill={INK_MUTED}>
                      {label(d.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
        {hover !== null && W > 0 && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-white px-3 py-2 text-center whitespace-nowrap shadow-[0_8px_24px_-8px_rgb(42_20_40/0.3)] ring-1 ring-plum-100"
            style={{ left: Math.min(Math.max(m.l + bandW * (hover + 0.5), 70), W - 70), top: y(values[hover]) - 10 }}
          >
            <p className="text-sm font-semibold text-plum-900 tabular-nums">{fmt(values[hover])}</p>
            <p className="text-[11px] text-plum-700/60">{label(daily[hover].date)}</p>
          </div>
        )}
        {W === 0 && <div style={{ height: H }} />}
      </div>
    </div>
  );
}
