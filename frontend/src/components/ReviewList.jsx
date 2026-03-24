import { timeAgo, isWithinOneHour } from "../utils/dateUtils";

function badge(status) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1";
  if (status === "APPROVED")
    return `${base} bg-emerald-500/15 text-emerald-200 ring-emerald-500/20`;
  if (status === "SUSPICIOUS")
    return `${base} bg-amber-500/15 text-amber-200 ring-amber-500/20`;
  if (status === "SPAM")
    return `${base} bg-rose-500/15 text-rose-200 ring-rose-500/20`;
  return `${base} bg-slate-500/15 text-slate-200 ring-slate-500/20`;
}

function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.floor(v);
  const empty = 5 - full;

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <span className="text-yellow-300">{Array(full).fill("★").join("")}</span>
        <span className="text-white/20">{Array(empty).fill("★").join("")}</span>
      </div>
      <span className="text-xs text-slate-400">{v.toFixed(1)}</span>
    </div>
  );
}

export default function ReviewList({ reviews, onEdit, onDelete, canEditUserId }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-modern-card glow">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/35 to-fuchsia-500/35 ring-1 ring-white/10" />
          <div>
            <div className="text-base font-semibold tracking-tight">
              No reviews yet
            </div>
            <div className="text-sm text-[color:var(--text-secondary)] mt-1">
              Be the first one ⭐ Write a helpful review to support other readers.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const editable =
          r.userId === canEditUserId && isWithinOneHour(r.createdAt);

        return (
          <div
            key={r.id}
            className="glass glow p-6 transition-all duration-200 hover:bg-white/[0.07] hover:-translate-y-[1px]"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold tracking-tight">
                    User <span className="text-white/90">{r.userId}</span>
                  </div>
                  {r.spamStatus ? (
                    <span className={badge(r.spamStatus)}>{r.spamStatus}</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] bg-white/5 text-slate-200 ring-1 ring-white/10">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <Stars value={r.rating} />
                </div>
              </div>

              {/* Date */}
              <div className="shrink-0 text-right">
                <div className="text-xs text-slate-300">{timeAgo(r.createdAt)}</div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                </div>
              </div>
            </div>

            {/* Comment */}
            <p className="mt-4 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {r.comment}
            </p>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
  onClick={() => onEdit(r)}
  disabled={!editable}
  className="px-4 py-2 rounded-2xl px-4 py-2 text-sm font-semibold 
             bg-emerald-500/15 text-emerald-400 
             hover:bg-emerald-500/25 
             ring-1 ring-emerald-500/30 
             transition-all duration-200 
             active:scale-[0.98]
             disabled:opacity-40 disabled:cursor-not-allowed"
  title={
    !editable
      ? "Edit allowed only within 1 hour"
      : "Edit review"
  }
>
  ✏️ Edit
</button>

              <button
                onClick={() => onDelete(r)}
                className="rounded-2xl px-4 py-2 text-sm font-semibold bg-rose-500/15 text-rose-200 hover:bg-rose-500/20 ring-1 ring-rose-500/20 transition-all duration-200 active:scale-[0.98]"
              >
                 🗑️ Delete
              </button>

             
            </div>
          </div>
        );
      })}
    </div>
  );
}