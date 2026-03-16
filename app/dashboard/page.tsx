import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TrendingUp, Clock, CheckCircle2, FileText, PenSquare, LayoutList } from "lucide-react";
import { PageWrapper, FadeIn } from "@/components/motion-wrapper";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  const [total, scheduled, published, drafts] = await Promise.all([
    prisma.post.count({ where: { userId: user!.id } }),
    prisma.post.count({ where: { userId: user!.id, status: "SCHEDULED" } }),
    prisma.post.count({ where: { userId: user!.id, status: "PUBLISHED" } }),
    prisma.post.count({ where: { userId: user!.id, status: "DRAFT" } }),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "Total Posts",
      value: total,
      icon: FileText,
      gradient: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
    },
    {
      label: "Scheduled",
      value: scheduled,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      label: "Published",
      value: published,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      label: "Drafts",
      value: drafts,
      icon: TrendingUp,
      gradient: "from-rose-500 to-pink-600",
      bg: "bg-rose-500/10",
      iconColor: "text-rose-500",
    },
  ];

  return (
    <PageWrapper>
      <div className="p-8 max-w-5xl space-y-10">
        {/* Header */}
        <FadeIn>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Good to see you back</p>
            <h1 className="text-3xl font-bold tracking-tight">
              Hey, {firstName} 👋
            </h1>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, bg, iconColor }, i) => (
            <FadeIn key={label} delay={i * 0.07}>
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className={`size-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`size-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold tabular-nums">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Quick actions */}
        <FadeIn delay={0.3}>
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/compose"
                className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 flex items-center justify-between hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                <div className="space-y-1">
                  <p className="font-bold text-white">Compose Post</p>
                  <p className="text-sm text-white/70">Create and schedule content</p>
                </div>
                <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
                  <PenSquare className="size-5 text-white" />
                </div>
              </Link>

              <Link
                href="/dashboard/queue"
                className="group bg-card border border-border rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="space-y-1">
                  <p className="font-bold">View Queue</p>
                  <p className="text-sm text-muted-foreground">Manage your posts</p>
                </div>
                <div className="size-10 rounded-xl bg-muted flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
                  <LayoutList className="size-5 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageWrapper>
  );
}
