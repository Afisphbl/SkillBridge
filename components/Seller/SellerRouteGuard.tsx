"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/UI/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";

export default function SellerRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loadingSession } = useAuth();
  const { profile, loading } = useUser();

  useEffect(() => {
    if (!loadingSession && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!loading && profile?.role === "buyer") {
      router.replace("/home");
    }
  }, [isAuthenticated, loading, loadingSession, profile?.role, router]);

  if (loadingSession || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="border-cyan-800/50 border-t-cyan-800" />
      </div>
    );
  }

  if (!isAuthenticated || profile?.role === "buyer") {
    return null;
  }

  return <>{children}</>;
}
