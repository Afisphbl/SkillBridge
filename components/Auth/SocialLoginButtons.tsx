import { FaFacebookF, FaGithub, FaGoogle } from "react-icons/fa";

const socialButtons = [
  { label: "Google", icon: FaGoogle },
  { label: "GitHub", icon: FaGithub },
  { label: "Facebook", icon: FaFacebookF },
];

export default function SocialLoginButtons() {
  return (
    <div className="mt-5">
      <div className="relative text-center text-sm text-(--text-muted)">
        <span className="bg-transparent px-3">Or continue with</span>
        <div className="absolute left-0 top-1/2 -z-10 h-px w-full -translate-y-1/2 bg-(--border-color)" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {socialButtons.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="soft-field flex h-10 items-center justify-center rounded-md text-(--text-secondary) hover:bg-(--bg-card-hover)"
            aria-label={`Continue with ${label}`}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
