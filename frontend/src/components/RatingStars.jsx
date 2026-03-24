export default function RatingStars({ value = 0, onChange, size = "text-2xl" }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className="p-1 rounded-lg hover:bg-white/5"
          aria-label={`${s} star`}
        >
          <span className={`${size} ${s <= value ? "text-yellow-300" : "text-slate-700"}`}>★</span>
        </button>
      ))}
      <span className="ml-2 text-sm text-slate-300">{Number(value).toFixed(1)}</span>
    </div>
  );
}