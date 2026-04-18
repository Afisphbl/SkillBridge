"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/UI/Loader";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loadingSession } = useAuth();

  useEffect(() => {
    if (!loadingSession && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loadingSession, router]);

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="border-cyan-800/50 border-t-cyan-800" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
