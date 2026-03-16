"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, PenSquare, Clock, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/compose", label: "Compose", icon: PenSquare },
  { href: "/dashboard/queue", label: "Queue", icon: Clock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

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
          onClick={() => setShowSignOutDialog(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-[#27272a] transition-all duration-200"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
