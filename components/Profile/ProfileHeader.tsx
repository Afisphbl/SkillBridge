import Image from "next/image";
import { FiCamera, FiUser } from "react-icons/fi";

type ProfileHeaderProps = {
  fullName: string;
  roleLabel: string;
  email: string;
  memberSince: string;
  avatarUrl: string | null;
  onEditAvatar: () => void;
};

export default function ProfileHeader({
  fullName,
  roleLabel,
  email,
  memberSince,
  avatarUrl,
  onEditAvatar,
}: ProfileHeaderProps) {
  return (
    <section className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-(--card-shadow) sm:p-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="relative">
            <div className="relative size-24 overflow-hidden rounded-full border-2 border-(--border-color) bg-(--bg-secondary) shadow-sm">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile avatar"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-(--text-muted)">
                  <FiUser className="size-10" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onEditAvatar}
              className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border border-(--border-color) bg-(--bg-card) text-(--color-primary) shadow-sm hover:scale-105 hover:bg-(--hover-bg) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)"
              aria-label="Edit avatar"
            >
              <FiCamera className="size-4" />
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              {fullName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {roleLabel}
              </span>
              <span className="text-xs text-(--text-muted)">{memberSince}</span>
            </div>
            <p className="mt-2 text-sm text-(--text-secondary)">{email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
