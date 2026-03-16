import Link from "next/link";
import { ArrowRight, Zap, Clock, BarChart3, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 h-16 flex items-center justify-between max-w-7xl mx-auto w-full">
        <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Vibe Scheduler
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-8">
          <Zap className="size-3" />
          Social media scheduling, reinvented
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6">
          Schedule content{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            that hits different
          </span>
        </h1>

        <p className="text-lg text-white/50 max-w-xl mb-10 leading-relaxed">
          Create, schedule, and publish posts across LinkedIn, Twitter, and Instagram — all from one sleek dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-xl shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            Start for free <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl font-medium text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-200"
          >
            Sign in
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Clock, title: "Smart Scheduling", desc: "Queue posts at the perfect time for your audience", color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { icon: Globe, title: "Multi-Platform", desc: "LinkedIn, Twitter, and Instagram in one place", color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: BarChart3, title: "Analytics", desc: "Track what resonates with your audience", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: Zap, title: "Post Now", desc: "Publish instantly or save as draft anytime", color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200"
            >
              <div className={`size-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`size-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/30">
        © 2025 Vibe Scheduler. Built for creators.
      </footer>
    </div>
  );
}
