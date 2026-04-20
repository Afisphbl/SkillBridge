export default function OrdersHeader() {
  return (
    <header className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
      <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
        Orders
      </h1>
      <p className="mt-2 text-sm text-(--text-secondary)">
        Manage and track all your orders
      </p>
    </header>
  );
}
