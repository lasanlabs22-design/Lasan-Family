"use client";

import { useEffect, useRef, useState } from "react";

// Chart tokens. Single-series charts share one accent (validated ≥3:1 on white); text never wears it.
const ACCENT = "#b93d5f";
const GRID = "#f3e8ec";
const INK_MUTED = "rgb(77 38 73 / 0.55)";
const SURFACE = "#ffffff";

export type Point = { label: string; value: number };

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function Tooltip({ x, y, value, label, width }: { x: number; y: number; value: string; label: string; width: number }) {
  const left = Math.min(Math.max(x, 60), width - 60);
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-white px-3 py-2 text-center whitespace-nowrap shadow-[0_8px_24px_-8px_rgb(42_20_40/0.3)] ring-1 ring-plum-100"
      style={{ left, top: y - 12 }}
    >
      <p className="text-sm font-semibold text-plum-900">{value}</p>
      <p className="text-[11px] text-plum-700/60">{label}</p>
    </div>
  );
}

export function LineChart({
  data,
  domain,
  ticks,
  unit,
  band,
  bandLabel = "Target range",
}: {
  data: Point[];
  domain: [number, number];
  ticks: number[];
  unit: string;
  band?: [number, number];
  bandLabel?: string;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 240;
  const m = { l: 36, r: 44, t: 16, b: 28 };
  const n = data.length;
  const x = (i: number) => m.l + (i * (W - m.l - m.r)) / Math.max(1, n - 1);
  const y = (v: number) => m.t + (1 - (v - domain[0]) / (domain[1] - domain[0])) * (H - m.t - m.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join("");
  const area = `${line}L${x(n - 1)},${H - m.b}L${x(0)},${H - m.b}Z`;
  const every = Math.ceil(n / 7);
  const last = data[n - 1];

  const pick = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left;
    const i = Math.round(((px - m.l) / (W - m.l - m.r)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div ref={ref} className="relative">
      {W > 0 && (
        <svg
          width={W}
          height={H}
          tabIndex={0}
          role="img"
          aria-label={`Line chart, ${n} days. Latest ${last.value} ${unit}. Use arrow keys to read values.`}
          className="block touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-blush-300 rounded-xl"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setHover(null)}
          onBlur={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
            if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? n) - 1));
          }}
        >
          {band && (
            <>
              <rect x={m.l} width={W - m.l - m.r} y={y(band[1])} height={y(band[0]) - y(band[1])} fill="#5f7d57" opacity={0.07} />
              <text x={m.l + 6} y={y(band[1]) + 13} fontSize={10} fill={INK_MUTED}>
                {bandLabel}
              </text>
            </>
          )}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={m.l - 8} y={y(t) + 3.5} fontSize={10} textAnchor="end" fill={INK_MUTED} className="tabular-nums">
                {t}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            (n - 1 - i) % every === 0 ? (
              <text key={i} x={x(i)} y={H - 8} fontSize={10} textAnchor="middle" fill={INK_MUTED}>
                {d.label}
              </text>
            ) : null,
          )}
          <path d={area} fill={ACCENT} opacity={0.1} />
          <path d={line} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(n - 1)} cy={y(last.value)} r={4} fill={ACCENT} stroke={SURFACE} strokeWidth={2} />
          <text x={x(n - 1) + 8} y={y(last.value) + 4} fontSize={11} fontWeight={600} fill="#2a1428">
            {last.value}
          </text>
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={H - m.b} stroke="rgb(77 38 73 / 0.25)" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(data[hover].value)} r={5} fill={ACCENT} stroke={SURFACE} strokeWidth={2} />
            </g>
          )}
        </svg>
      )}
      {hover !== null && W > 0 && (
        <Tooltip x={x(hover)} y={y(data[hover].value)} value={`${data[hover].value} ${unit}`} label={data[hover].label} width={W} />
      )}
    </div>
  );
}

export function ColumnChart({ data, unit, ticks }: { data: Point[]; unit: string; ticks: number[] }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 220;
  const m = { l: 28, r: 8, t: 22, b: 28 };
  const max = ticks[ticks.length - 1];
  const n = data.length;
  const bandW = (W - m.l - m.r) / n;
  const barW = Math.min(24, bandW * 0.62);
  const y = (v: number) => m.t + (1 - v / max) * (H - m.t - m.b);
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const every = Math.ceil(n / 7);

  // Rounded 4px data-end, square at the baseline.
  const bar = (cx: number, v: number) => {
    const top = y(v);
    const base = H - m.b;
    const r = Math.min(4, (base - top) / 2, barW / 2);
    const l = cx - barW / 2;
    const rt = cx + barW / 2;
    return `M${l},${base}V${top + r}Q${l},${top} ${l + r},${top}H${rt - r}Q${rt},${top} ${rt},${top + r}V${base}Z`;
  };

  return (
    <div ref={ref} className="relative">
      {W > 0 && (
        <svg width={W} height={H} role="img" aria-label={`Column chart of ${unit} per day`} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={m.l - 8} y={y(t) + 3.5} fontSize={10} textAnchor="end" fill={INK_MUTED} className="tabular-nums">
                {t}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = m.l + bandW * (i + 0.5);
            return (
              <g
                key={i}
                tabIndex={0}
                aria-label={`${d.label}: ${d.value} ${unit}`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="cursor-default outline-none"
              >
                <rect x={cx - bandW / 2} y={m.t} width={bandW} height={H - m.t - m.b} fill="transparent" />
                <path d={bar(cx, d.value)} fill={ACCENT} opacity={hover === null || hover === i ? 1 : 0.45} className="transition-opacity" />
                {i === peak && hover === null && (
                  <text x={cx} y={y(d.value) - 6} fontSize={11} fontWeight={600} textAnchor="middle" fill="#2a1428">
                    {d.value}
                  </text>
                )}
                {(n - 1 - i) % every === 0 && (
                  <text x={cx} y={H - 8} fontSize={10} textAnchor="middle" fill={INK_MUTED}>
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && W > 0 && (
        <Tooltip x={m.l + bandW * (hover + 0.5)} y={y(data[hover].value)} value={`${data[hover].value} ${unit}`} label={data[hover].label} width={W} />
      )}
    </div>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  const w = 96;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 4) + 2, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)]);
  return (
    <svg width={w} height={h} aria-hidden>
      <path d={pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("")} fill="none" stroke="rgb(77 38 73 / 0.3)" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} fill={ACCENT} stroke={SURFACE} strokeWidth={1.5} />
    </svg>
  );
}
