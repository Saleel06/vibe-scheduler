import { PageWrapper, FadeIn } from "@/components/motion-wrapper";
import { PostComposerDynamic } from "@/components/compose/post-composer-dynamic";

export default function ComposePage() {
  return (
    <PageWrapper>
      <div className="p-4 sm:p-6 md:p-8 max-w-2xl space-y-8">
        <FadeIn>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Create content</p>
            <h1 className="text-3xl font-bold tracking-tight">Compose Post</h1>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <PostComposerDynamic />
        </FadeIn>
      </div>
    </PageWrapper>
  );
}
