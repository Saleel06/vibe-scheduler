"use client";

import dynamic from "next/dynamic";

export const PostComposerDynamic = dynamic(
  () => import("./post-composer").then((m) => m.PostComposer),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 rounded-xl bg-white/5 w-1/3" />
        <div className="h-40 rounded-xl bg-white/5" />
        <div className="flex gap-3">
          <div className="h-10 rounded-xl bg-white/5 w-24" />
          <div className="h-10 rounded-xl bg-white/5 w-24" />
        </div>
      </div>
    ),
  }
);
