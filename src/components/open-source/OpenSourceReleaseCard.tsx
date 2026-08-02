// src/components/open-source/OpenSourceReleaseCard.tsx
"use client";
import Link from "next/link";
import { TierBadge } from "@/components/TierBadge";
import { Tag } from "@/components/Tag";

export interface OpenSourceReleaseCardProps {
  release: {
    id: string;
    title: string;
    license: string;
    originalSource: string;
    originalAuthor: string;
    requiredPlan: string;
    isFeatured: boolean;
    downloadCount: number;
    viewCount: number;
    tier: string | null;
  };
}

const LICENSE_BADGE: Record<string, string> = {
  GPL_3: "bg-red-500/15 text-red-700 border-red-500/30",
  GPL_2: "bg-red-500/15 text-red-700 border-red-500/30",
  APACHE_2_0: "bg-green-500/15 text-green-700 border-green-500/30",
  MIT: "bg-green-500/15 text-green-700 border-green-500/30",
  BSD_3: "bg-green-500/15 text-green-700 border-green-500/30",
  LGPL: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  MPL_2_0: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  PROPRIETARY: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  NO_LICENSE: "bg-red-500/15 text-red-700 border-red-500/30",
  UNKNOWN: "bg-red-500/15 text-red-700 border-red-500/30",
};

export function OpenSourceReleaseCard({ release }: OpenSourceReleaseCardProps) {
  const licenseBadge = LICENSE_BADGE[release.license] ?? "bg-muted text-foreground";
  return (
    <Link
      href={`/open-source/${release.id}`}
      className="group block rounded-lg border border-border bg-card p-4 hover:border-primary hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition">
          {release.title}
        </h3>
        {release.isFeatured && <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">精选</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded border ${licenseBadge}`}>{release.license}</span>
        <Tag label={`来源: ${release.originalSource}`} />
        {release.tier && <TierBadge tier={release.tier} />}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        <span>👁 {release.viewCount.toLocaleString()}</span>
        <span className="mx-2">·</span>
        <span>⬇ {release.downloadCount.toLocaleString()}</span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {release.requiredPlan === "FREE_TRIAL" ? "免费" : "付费会员"}
      </div>
    </Link>
  );
}