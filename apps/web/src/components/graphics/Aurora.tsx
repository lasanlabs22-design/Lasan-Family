import clsx from "clsx";

/** Soft drifting colour fields used behind hero and CTA sections. Pure CSS, no JS. */
export default function Aurora({ className, variant = "warm" }: { className?: string; variant?: "warm" | "dusk" }) {
  const blobs =
    variant === "warm"
      ? ["bg-blush-200", "bg-peach-300/70", "bg-lilac-300/60", "bg-sage-300/50"]
      : ["bg-blush-500/50", "bg-plum-500/60", "bg-lilac-300/40", "bg-peach-300/40"];
  return (
    <div aria-hidden className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className={clsx("aurora-blob top-[-10%] left-[-10%] size-[46vw] max-w-[620px]", blobs[0])} />
      <div className={clsx("aurora-blob top-[10%] right-[-12%] size-[40vw] max-w-[560px] [animation-delay:-6s]", blobs[1])} />
      <div className={clsx("aurora-blob bottom-[-18%] left-[20%] size-[38vw] max-w-[520px] [animation-delay:-12s]", blobs[2])} />
      <div className={clsx("aurora-blob right-[25%] bottom-[5%] size-[22vw] max-w-[320px] [animation-delay:-3s]", blobs[3])} />
    </div>
  );
}
