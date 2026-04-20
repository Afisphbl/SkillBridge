export default function OrdersLoadingState() {
  return (
    <div className="space-y-3 rounded-3xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
      {Array.from({ length: 6 }).map((_value, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-xl bg-(--bg-secondary)"
        />
      ))}
    </div>
  );
}
