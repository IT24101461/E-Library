import { useState, useEffect } from "react";

export default function ReviewFilters({
  sort,
  setSort,
  ratingMin,
  setRatingMin,
  ratingMax,
  setRatingMax,
}) {
  const [localSort, setLocalSort] = useState(sort);
  const [localMin, setLocalMin] = useState(ratingMin);
  const [localMax, setLocalMax] = useState(ratingMax);

  // Sync local state when parent props change (e.g. from Clear)
  useEffect(() => {
    setLocalSort(sort);
    setLocalMin(ratingMin);
    setLocalMax(ratingMax);
  }, [sort, ratingMin, ratingMax]);

  const applyFilters = () => {
    setSort(localSort);
    setRatingMin(localMin);
    setRatingMax(localMax);
  };

  const clearFilters = () => {
    setLocalSort("newest");
    setLocalMin("");
    setLocalMax("");
    setSort("newest");
    setRatingMin("");
    setRatingMax("");
  };

 return (
  <div className="review-filter-card glow overflow-hidden">

    {/* Header Bar */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)] bg-[color:var(--bg-card-soft)]">
      <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
        🔎 Filter Reviews
      </h3>

      <button
        onClick={clearFilters}
        className="text-xs px-3 py-1 rounded-full 
                   bg-rose-500/15 text-rose-400 
                   hover:bg-rose-500/25 
                   ring-1 ring-rose-500/30 
                   transition-all duration-200"
      >
        Clear
      </button>
    </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Sort */}
        <div>
          <label className="text-sm text-slate-300">Sort</label>
          <select
            value={localSort}
            onChange={(e) => setLocalSort(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-900/50 p-3 text-sm ring-1 ring-white/10 focus:ring-indigo-500"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        {/* Min Rating */}
        <div>
          <label className="text-sm text-slate-300">Minimum Rating</label>
          <select
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-900/50 p-3 text-sm ring-1 ring-white/10"
          >
            <option value="">Any</option>
            <option value="1">1 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="5">5 ⭐</option>
          </select>
        </div>

        {/* Max Rating */}
        <div>
          <label className="text-sm text-slate-300">Maximum Rating</label>
          <select
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-900/50 p-3 text-sm ring-1 ring-white/10"
          >
            <option value="">Any</option>
            <option value="1">1 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="5">5 ⭐</option>
          </select>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={applyFilters}
          className="rounded-xl px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
}