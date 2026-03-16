"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { CheckCircle2, Link2Off, ExternalLink, Loader2 } from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  createdAt: string;
}

const PLATFORM_META: Record<string, {
  label: string;
  icon: React.ReactNode;
  bg: string;
}> = {
  LINKEDIN: {
    label: "LinkedIn",
    icon: (
      <span className="text-white text-xs font-bold">in</span>
    ),
    bg: "bg-[#0077b5]",
  },
  TWITTER: {
    label: "Twitter / X",
    icon: <span className="text-white text-xs font-bold">𝕏</span>,
    bg: "bg-black",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: <span className="text-white text-sm">📷</span>,
    bg: "bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]",
  },
};

export function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const res = await fetch("/api/social-accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function disconnect(platform: string) {
    setDisconnecting(platform);
    try {
      const res = await fetch(`/api/social-accounts/${platform.toLowerCase()}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.platform !== platform));
      }
    } finally {
      setDisconnecting(null);
    }
  }

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-sm">Connected Accounts</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Connect your social accounts to enable publishing.
        </p>
      </div>

      {loading ? (
        <div className="px-6 py-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading accounts…
        </div>
      ) : (
        <div className="divide-y divide-border">
          {(["LINKEDIN", "TWITTER", "INSTAGRAM"] as const).map((platform) => {
            const meta = PLATFORM_META[platform];
            const connected = connectedPlatforms.has(platform);
            const account = accounts.find((a) => a.platform === platform);
            const isDisc = disconnecting === platform;
            const comingSoon = platform !== "LINKEDIN" && !connected;

            return (
              <div key={platform} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {connected && account
                        ? account.accountName
                        : comingSoon
                        ? "Coming soon"
                        : "Not connected"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {connected ? (
                    <>
                      <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="size-3" /> Connected
                      </span>
                      <button
                        onClick={() => disconnect(platform)}
                        disabled={isDisc}
                        className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-200 disabled:opacity-50"
                      >
                        {isDisc ? <Loader2 className="size-3 animate-spin" /> : <Link2Off className="size-3" />}
                        {isDisc ? "Removing…" : "Disconnect"}
                      </button>
                    </>
                  ) : comingSoon ? (
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg font-medium">
                      Coming soon
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        signIn(platform.toLowerCase(), {
                          callbackUrl: "/dashboard/settings?connected=linkedin",
                        })
                      }
                      className="flex items-center gap-1.5 px-4 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-all duration-200 shadow-sm shadow-indigo-500/20"
                    >
                      <ExternalLink className="size-3" /> Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
