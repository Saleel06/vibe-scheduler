import Link from "next/link";
import { PenSquare } from "lucide-react";
import { PageWrapper, FadeIn } from "@/components/motion-wrapper";
import { PostQueueDynamic } from "@/components/queue/post-queue-dynamic";

export default function QueuePage() {
  return (
    <PageWrapper>
      <div className="p-8 max-w-4xl space-y-8">
        <FadeIn>
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Manage content</p>
              <h1 className="text-3xl font-bold tracking-tight">Post Queue</h1>
            </div>
            <Link
              href="/dashboard/compose"
              className="flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              <PenSquare className="size-4" /> New Post
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <PostQueueDynamic />
        </FadeIn>
      </div>
    </PageWrapper>
  );
}
