"use client";

import dynamic from "next/dynamic";

export const PostQueueDynamic = dynamic(
  () => import("./post-queue").then((m) => m.PostQueue),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5" />
        ))}
      </div>
    ),
  }
);
