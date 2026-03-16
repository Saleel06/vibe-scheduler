"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, PenSquare, Clock, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/compose", label: "Compose", icon: PenSquare },
  { href: "/dashboard/queue", label: "Queue", icon: Clock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <nav className="flex-1 py-3 px-2 space-y-0.5">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active =
          pendingHref === href ||
          (!pendingHref && (exact ? pathname === href : pathname.startsWith(href)));
        return (
          <Link
            key={href}
            href={href}
            prefetch={true}
            onClick={() => { setPendingHref(href); onNavigate?.(); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-[#3f3f46] text-white"
                : "text-white/50 hover:text-white hover:bg-[#27272a]"
            }`}
          >
            <Icon className={`size-4 shrink-0 ${active ? "text-indigo-400" : ""}`} />
            {label}
          </Link>
        );
      })}

      <div className="pt-3 mt-3 border-t border-white/10">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-[#27272a] transition-all duration-200"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>

      {/* Sign out confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative z-10 bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Sign out?</h2>
              <p className="text-sm text-muted-foreground">You will be signed out of your account.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 h-9 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
