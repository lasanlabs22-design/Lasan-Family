import Link from "next/link";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "light";

const styles: Record<Variant, string> = {
  primary:
    "bg-plum-900 text-white shadow-[0_10px_30px_-10px_rgb(42_20_40/0.6)] hover:bg-plum-700 hover:shadow-[0_14px_40px_-12px_rgb(212_86_119/0.7)]",
  secondary: "bg-white text-plum-900 ring-1 ring-plum-100 hover:ring-blush-300 hover:bg-blush-50",
  ghost: "text-plum-900 hover:bg-plum-50",
  light: "bg-white text-plum-900 hover:bg-blush-50",
};

type Props = {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export default function Button({ href, variant = "primary", className, children }: Props) {
  return (
    <Link
      href={href}
      className={clsx(
        "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-500 active:scale-[0.98]",
        styles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
