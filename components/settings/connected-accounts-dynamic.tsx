"use client";

import dynamic from "next/dynamic";

export const ConnectedAccountsDynamic = dynamic(
  () => import("./connected-accounts").then((m) => m.ConnectedAccounts),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5" />
        ))}
      </div>
    ),
  }
);
