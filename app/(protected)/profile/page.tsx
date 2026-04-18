"use client";

import Image from "next/image";
import { useUser } from "@/hooks/useUser";

export default function ProfilePage() {
  const { profile, loading } = useUser();

  if (loading) {
    return <p className="text-sm text-slate-600">Loading profile...</p>;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative size-14 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
          {profile?.avatar ? (
            <Image
              src={profile.avatar}
              alt="Avatar"
              fill
              className="object-cover"
              unoptimized
            />
          ) : null}
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            {profile?.full_name ?? "User"}
          </p>
          <p className="text-sm text-slate-600">{profile?.email ?? "-"}</p>
        </div>
      </div>
    </section>
  );
}
