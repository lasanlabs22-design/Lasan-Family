import clsx from "clsx";
import Reveal from "./Reveal";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({ eyebrow, title, text, align = "center", className }: Props) {
  return (
    <Reveal className={clsx("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <span className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white/70 px-3.5 py-1 text-xs font-semibold tracking-[0.14em] text-blush-600 uppercase">
        <span className="size-1.5 rounded-full bg-blush-500" />
        {eyebrow}
      </span>
      <h2 className="mt-5 font-display text-4xl leading-[1.05] font-medium tracking-tight text-plum-900 sm:text-5xl">
        {title}
      </h2>
      {text && <p className="mt-5 text-lg leading-relaxed text-plum-700/75">{text}</p>}
    </Reveal>
  );
}
