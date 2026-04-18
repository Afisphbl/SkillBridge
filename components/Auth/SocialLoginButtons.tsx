import { FaFacebookF, FaGithub, FaGoogle } from "react-icons/fa";

const socialButtons = [
  { provider: "google", label: "Google", icon: FaGoogle },
  { provider: "github", label: "GitHub", icon: FaGithub },
  { provider: "facebook", label: "Facebook", icon: FaFacebookF },
] as const;

type SocialProvider = (typeof socialButtons)[number]["provider"];

export default function SocialLoginButtons({
  onProviderClick,
  disabled = false,
}: {
  onProviderClick: (provider: SocialProvider) => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <div className="mt-5">
      <div className="relative text-center text-sm text-slate-500">
        <span className="bg-transparent px-3">Or continue with</span>
        <div className="absolute left-0 top-1/2 -z-10 h-px w-full -translate-y-1/2 bg-slate-200" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {socialButtons.map(({ provider, label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => void onProviderClick(provider)}
            className="soft-field flex h-10 items-center justify-center rounded-md text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Continue with ${label}`}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
