"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileNav({
  initials,
  userName,
  userEmail,
}: {
  initials: string;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-[#18181b] border-b border-white/10 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-bold text-base bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Vibe Scheduler
        </span>
        <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {initials}
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#18181b] flex flex-col transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 h-14 flex items-center justify-between border-b border-white/10 shrink-0">
          <span className="font-bold text-base bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Vibe Scheduler
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <SidebarNav onNavigate={() => setOpen(false)} />

        <div className="border-t border-white/10 p-4 flex items-center gap-3 shrink-0">
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {userName && (
              <p className="text-xs font-medium text-white truncate">{userName}</p>
            )}
            <p className="text-xs text-white/40 truncate">{userEmail}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
