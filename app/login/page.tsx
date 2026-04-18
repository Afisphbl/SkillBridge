import Card from "@/components/UI/Card";
import LoginForm from "@/components/Auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-shell flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-center text-4xl font-extrabold tracking-tight text-cyan-900">
          The Curated Workspace
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to continue to your dashboard
        </p>
        <LoginForm />
      </Card>
    </main>
  );
}
