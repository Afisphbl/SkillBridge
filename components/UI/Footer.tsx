import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-(--border-color) bg-(--bg-card) py-12">
      <div className="grid grid-cols-1 gap-8 px-8 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-(--color-primary)">
              <div className="h-3 w-3 rotate-45 rounded-sm border-2 border-(--text-inverse)" />
            </div>
            <span className="text-lg font-bold tracking-tight text-(--text-primary)">
              SkillBridge
            </span>
          </div>
          <p className="text-sm text-(--text-muted)">
            The premier marketplace for top-tier digital talent and services.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-(--text-primary)">Categories</h4>
          <ul className="space-y-2 text-sm font-medium text-(--text-muted)">
            <li>
              <Link
                href="/services?category=Development"
                className="hover:text-(--color-primary)"
              >
                Development
              </Link>
            </li>
            <li>
              <Link
                href="/services?category=Design"
                className="hover:text-(--color-primary)"
              >
                Design
              </Link>
            </li>
            <li>
              <Link
                href="/services?category=Marketing"
                className="hover:text-(--color-primary)"
              >
                Marketing
              </Link>
            </li>
            <li>
              <Link
                href="/services?category=Writing"
                className="hover:text-(--color-primary)"
              >
                Writing
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-(--text-primary)">
            For Freelancers
          </h4>
          <ul className="space-y-2 text-sm font-medium text-(--text-muted)">
            <li>
              <Link href="/services" className="hover:text-(--color-primary)">
                Create a Service
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-(--color-primary)">
                Seller Dashboard
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-(--color-primary)">
                Settings
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-(--text-primary)">Support</h4>
          <ul className="space-y-2 text-sm font-medium text-(--text-muted)">
            <li>
              <a href="#" className="hover:text-(--color-primary)">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-(--color-primary)">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-(--color-primary)">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-(--border-color) px-8 pt-8 text-sm font-medium text-(--text-muted)">
        <p>© 2026 SkillBridge.</p>
      </div>
    </footer>
  );
}
