import Card from "@/components/UI/Card";
import LoginForm from "@/components/Auth/LoginForm";

import Image from "next/image";

export const metadata = {
  title: "Login",
  description: "Sign in to your SkillBridge account and access your dashboard.",
};

export default function LoginPage() {
  return (
    <main className="auth-shell flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-2 flex flex-col items-center justify-center">
          <h1 className="mt-2 text-center text-4xl font-extrabold tracking-tight text-cyan-900">
            SkillBridge
          </h1>
          <Image
            src="/SkillBridge.png"
            alt="SkillBridge"
            width={96}
            height={96}
            priority
            className="h-24 w-24 rounded-full object-cover"
          />
        </div>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to continue to your dashboard
        </p>
        <LoginForm />
      </Card>
    </main>
  );
}
