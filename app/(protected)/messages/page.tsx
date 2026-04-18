export const metadata = {
  title: "Messages",
  description:
    "View and respond to conversations with clients and freelancers on SkillBridge.",
};

export default function MessagesPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Messages</h1>
      <p className="mt-2 text-slate-600">
        View and respond to conversations with clients and freelancers.
      </p>
    </section>
  );
}
