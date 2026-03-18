import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
    },
    update: {},
  });
  const userName = dbUser?.name ?? user.user_metadata?.full_name ?? user.email;
  const userEmail = dbUser?.email ?? user.email;

  const initials = userName
    ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.[0].toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-[#18181b] flex-col fixed inset-y-0 left-0 z-30">
        <div className="px-5 h-14 flex items-center justify-between border-b border-white/10">
          <span className="font-bold text-base bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Vibe Scheduler
          </span>
          <ThemeToggle />
        </div>

        <SidebarNav />

        <div className="border-t border-white/10 p-4 flex items-center gap-3">
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

      {/* Mobile Nav */}
      <MobileNav
        initials={initials}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
