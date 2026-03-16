import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const initials = session.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session.user?.email?.[0].toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#18181b] flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-5 h-14 flex items-center justify-between border-b border-white/10">
          <span className="font-bold text-base bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Vibe Scheduler
          </span>
          <ThemeToggle />
        </div>

        {/* Nav */}
        <SidebarNav />

        {/* User */}
        <div className="border-t border-white/10 p-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {session.user?.name && (
              <p className="text-xs font-medium text-white truncate">{session.user.name}</p>
            )}
            <p className="text-xs text-white/40 truncate">{session.user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-60 overflow-auto min-h-screen">{children}</main>
    </div>
  );
}
