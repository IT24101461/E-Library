import RatingStars from "./RatingStars";

export default function ReviewForm({
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  loading,
}) {
  const minChars = 20;
  const charCount = comment?.length || 0;
  const ok = charCount >= minChars;

  return (
    <div className="review-modern-card glow shadow-sm rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">Write a Review</h3>
            
          </div>
        </div>
      </div>

     {/* Rating */}
<div className="mt-6 review-modern-card glow p-6">
  
  {/* Title at TOP */}
  <div className="mb-5">
    <div className="text-sm font-semibold text-[color:var(--text-primary)]">
      Your Rating
    </div>
    <div className="text-xs text-[color:var(--text-secondary)] mt-1">
      Select a rating between 1 and 5 stars
    </div>
  </div>

  {/* Stars + Score */}
  <div className="flex items-center justify-between">
    <RatingStars value={rating} onChange={setRating} />

    <div className="text-sm font-semibold px-4 py-2 rounded-full 
      bg-[color:var(--accent-dim)] 
      text-[color:var(--accent)] 
      ring-1 ring-[color:var(--border-hover)]">
      {Number(rating || 0).toFixed(1)} / 5
    </div>
  </div>

</div>

      {/* Comment */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[color:var(--text-primary)]">Your feedback</div>
          <div
            className={`text-xs ${
              ok ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {charCount}/{minChars} {ok ? "✓" : ""}
          </div>
        </div>
        


        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="Share your feedback... What did you like or dislike?"
          className="input mt-2 min-h-[120px] resize-none"
        />
        <div className="mt-2 text-xs text-gray-500">
          Tip: mention content quality, writing style, and what kind of readers will enjoy it.
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRating(5);
              setComment("");
            }}
            disabled={loading}
            className="btn-ghost disabled:opacity-50"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !ok}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            title={!ok ? "Write at least 20 characters" : "Submit review"}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}