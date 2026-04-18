export const metadata = {
  title: "Settings",
  description:
    "Manage your account settings, including profile details, password, and preferences.",
};

export default function SettingsPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Update your account</h1>
      <p className="mt-2 text-slate-600">
        Manage your profile details, avatar, password, and account preferences.
      </p>
    </section>
  );
}
