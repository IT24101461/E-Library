export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <button
        disabled={page <= 0}
        onClick={() => onPage(page - 1)}
        className="rounded-xl px-4 py-2 text-sm bg-white/5 hover:bg-white/10 ring-1 ring-white/10 disabled:opacity-40"
      >
        Prev
      </button>

      <div className="text-sm text-slate-300">
        Page <span className="text-white font-semibold">{page + 1}</span> / {totalPages}
      </div>

      <button
        disabled={page >= totalPages - 1}
        onClick={() => onPage(page + 1)}
        className="rounded-xl px-4 py-2 text-sm bg-white/5 hover:bg-white/10 ring-1 ring-white/10 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}