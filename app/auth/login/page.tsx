import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Vibe Scheduler
          </Link>
          <p className="text-sm text-muted-foreground">Welcome back — sign in to continue</p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          No account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
