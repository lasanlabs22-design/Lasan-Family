import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Languages, Star } from "lucide-react";
import { formatINR, unsplash, type Caregiver } from "@/lib/data";

export default function CaregiverCard({ c }: { c: Caregiver }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-blush-100 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgb(77_38_73/0.45)]">
      <div className="relative aspect-[4/4.2] overflow-hidden">
        <Image
          src={unsplash(c.image, 600, 640)}
          alt={`${c.name}, ${c.role}`}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-plum-900/70 via-transparent to-transparent" />
        <span className="glass absolute top-4 left-4 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-plum-900">
          <Star className="size-3.5 fill-gold-400 text-gold-400" />
          {c.rating.toFixed(1)}
          <span className="font-normal text-plum-700/60">({c.reviews})</span>
        </span>
        <div className="absolute inset-x-4 bottom-4 text-white">
          <p className="flex items-center gap-1.5 text-lg font-semibold">
            {c.name}
            <BadgeCheck className="size-4.5 fill-sage-600 text-white" aria-label="Verified" />
          </p>
          <p className="text-sm text-white/80">{c.role}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm leading-relaxed text-plum-700/75">{c.bio}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-blush-50 px-2.5 py-1 text-xs font-medium text-blush-600">{c.years} yrs exp.</span>
          <span className="flex items-center gap-1 rounded-full bg-lilac-100 px-2.5 py-1 text-xs font-medium text-plum-500">
            <Languages className="size-3" />
            {c.languages.slice(0, 2).join(", ")}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <p className="text-sm text-plum-700/60">
            <span className="text-base font-semibold text-plum-900">{formatINR(c.rate)}</span> / {c.unit}
          </p>
          <Link
            href={`/book?caregiver=${c.id}&service=${c.serviceId}`}
            className="rounded-full bg-plum-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blush-600"
          >
            Book
          </Link>
        </div>
      </div>
    </article>
  );
}
