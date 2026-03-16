import Link from "next/link";

const ERROR_MAP: Record<string, string> = {
  OAuthCallback: "OAuth callback failed — redirect URI may not be registered in Google/LinkedIn.",
  OAuthCreateAccount: "Could not create account — database connection issue.",
  OAuthAccountNotLinked: "This email is already registered with a different sign-in method.",
  OAuthSignin: "Could not start OAuth sign-in. Check provider credentials.",
  Callback: "An error occurred in the authentication callback.",
  AccessDenied: "Access was denied.",
  Configuration: "Server configuration error — check NEXTAUTH_SECRET and provider credentials.",
  Default: "An unexpected authentication error occurred.",
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error ?? "Default";
  const message = ERROR_MAP[error] ?? ERROR_MAP.Default;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <Link
          href="/"
          className="inline-block font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
        >
          Vibe Scheduler
        </Link>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-3">
          <p className="text-sm font-semibold text-red-500">
            Auth Error: <span className="font-mono">{error}</span>
          </p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <Link
          href="/auth/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
