import Card from "@/components/UI/Card";
import SignupForm from "@/components/Auth/SignupForm";
import Image from "next/image";

export default function SignupPage() {
  return (
    <main className="auth-shell flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-2 flex flex-col items-center justify-center">
          <h1 className="mt-2 text-center text-4xl font-extrabold tracking-tight text-(--text-primary)">
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
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-(--text-secondary)">
          Join the marketplace and start offering or hiring services.
        </p>
        <SignupForm />
      </Card>
    </main>
  );
}
