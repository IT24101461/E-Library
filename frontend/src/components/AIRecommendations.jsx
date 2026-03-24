export default function AIRecommendations({ recommendations = [], onView }) {
  return (
    <div className="panel space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">
            AI Component
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Recommended for your vibe
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Based on mood, tone, and reading style
          </p>
        </div>

        <span className="badge">AI</span>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-black/20 p-8 text-center text-secondary">
          Recommendations will appear based on selected vibe.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((book, index) => (
            <div
              key={book.id ?? index}
              className="card card-hover flex min-h-[250px] flex-col justify-between p-5 transition hover:scale-[1.02]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{book.title}</h3>
                    <p className="text-sm text-secondary">{book.author}</p>
                  </div>

                  {book.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <span style={{ color: "var(--gold)" }}>★</span>
                      <span className="text-secondary">{book.rating}</span>
                    </div>
                  )}
                </div>

                {book.genre && <span className="badge">{book.genre}</span>}

                {book.vibes && (
                  <p className="text-sm text-secondary">
                    <span className="text-white/80">Vibes:</span> {book.vibes}
                  </p>
                )}

                {book.why && (
                  <p className="text-sm text-secondary">
                    <span className="text-white/80">Why:</span> {book.why}
                  </p>
                )}
              </div>

              <button
                className="btn btn-accent mt-5 w-full"
                onClick={() => onView?.(book)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}