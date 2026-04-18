import Card from "@/components/UI/Card";
import SignupForm from "@/components/Auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="auth-shell flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-center text-4xl font-extrabold tracking-tight text-cyan-900">
          The Curated Workspace
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-slate-600">
          Join the marketplace and start offering or hiring services.
        </p>
        <SignupForm />
      </Card>
    </main>
  );
}
