import { CheckCircle2, AlertCircle } from "lucide-react";
import { PageWrapper, FadeIn } from "@/components/motion-wrapper";
import { ConnectedAccountsDynamic } from "@/components/settings/connected-accounts-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  linkedin_denied: "LinkedIn connection was cancelled.",
  token_failed: "Failed to get LinkedIn access token. Please try again.",
  profile_failed: "Could not fetch LinkedIn profile. Please try again.",
  invalid_state: "Invalid OAuth state. Please try connecting again.",
  user_not_found: "Session error. Please log out and back in.",
};

export default function SettingsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const connected = searchParams.connected;
  const error = searchParams.error;

  return (
    <PageWrapper>
      <div className="p-4 sm:p-6 md:p-8 max-w-2xl space-y-8">
        <FadeIn>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Preferences</p>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          </div>
        </FadeIn>

        {connected === "linkedin" && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-500">
            <CheckCircle2 className="size-4 shrink-0" />
            LinkedIn account connected successfully!
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
            <AlertCircle className="size-4 shrink-0" />
            {ERROR_MESSAGES[error] ?? "Something went wrong. Please try again."}
          </div>
        )}

        <FadeIn delay={0.15}>
          <ConnectedAccountsDynamic />
        </FadeIn>
      </div>
    </PageWrapper>
  );
}
