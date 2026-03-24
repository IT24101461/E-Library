import { useEffect, useState } from "react";
import { reviewApi } from "../services/reviewApi";
import RatingStars from "../components/RatingStars";
import ReviewFilters from "../components/ReviewFilters";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";

export default function BookReviewsPage() {
  // ✅ demo values: replace with real selected book + logged user
  const bookId = 1;
  const userId = 101;

  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });

  const [sort, setSort] = useState("newest");
  const [ratingMin, setRatingMin] = useState("");
  const [ratingMax, setRatingMax] = useState("");

  const [page, setPage] = useState(0);
  const size = 6;

  const [pageData, setPageData] = useState(null);

  // create
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const reviews = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  // -------- Review Analytics (REAL DATA) --------
  const totalReviewsCount = reviews.length;

  const positiveCount = reviews.filter((r) => Number(r.rating) >= 4).length;
  const negativeCount = reviews.filter((r) => Number(r.rating) <= 2).length;

  const positivePercent = totalReviewsCount
    ? Math.round((positiveCount / totalReviewsCount) * 100)
    : 0;

  const negativePercent = totalReviewsCount
    ? Math.round((negativeCount / totalReviewsCount) * 100)
    : 0;

  // Most common rating (mode)
  const ratingFrequency = {};
  for (const r of reviews) {
    const rate = Math.round(Number(r.rating) || 0); // 1..5
    if (rate >= 1 && rate <= 5) {
      ratingFrequency[rate] = (ratingFrequency[rate] || 0) + 1;
    }
  }

  let mostCommonRating = 0;
  let highestCount = 0;

  for (const [rateStr, count] of Object.entries(ratingFrequency)) {
    const rate = Number(rateStr);
    if (count > highestCount) {
      highestCount = count;
      mostCommonRating = rate;
    }
  }

  const starsText =
    mostCommonRating > 0
      ? "★".repeat(mostCommonRating) + "☆".repeat(5 - mostCommonRating)
      : "No data";

  async function load() {
    const s = await reviewApi.getSummary(bookId);
    setSummary(s.data);

    const list = await reviewApi.list({
      bookId,
      sort,
      ratingMin: ratingMin || undefined,
      ratingMax: ratingMax || undefined,
      page,
      size,
    });
    setPageData(list.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [sort, ratingMin, ratingMax, page]);

  const onCreate = async () => {
    if (comment.trim().length < 20)
      return alert("Review must be at least 20 characters.");

    setCreateLoading(true);
    try {
      await reviewApi.create({
        bookId,
        userId,
        rating: Number(rating),
        comment: comment.trim(),
      });
      setComment("");
      setRating(5);
      setPage(0);
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Create failed";
      alert(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const onOpenEdit = (r) => {
    setEditReview(r);
    setEditRating(Number(r.rating));
    setEditComment(r.comment);
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editReview) return;
    if (editComment.trim().length < 20)
      return alert("Review must be at least 20 characters.");

    setEditLoading(true);
    try {
      await reviewApi.update(editReview.id, userId, {
        rating: Number(editRating),
        comment: editComment.trim(),
      });
      setEditOpen(false);
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Update failed (maybe 1 hour expired)";
      alert(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const onSoftDelete = async (r) => {
    const reason = prompt(
      "Reason for delete? (e.g., Moderation/Spam/Abuse)",
      "Moderation"
    );
    if (reason === null) return;

    try {
      await reviewApi.softDelete(r.id, "ADMIN", reason || "Moderation");
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Delete failed";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen w-screen relative">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 review-modern-card glow">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
            <div>
              <div className="text-xl font-semibold tracking-tight">
                E Library
              </div>
              <p className="text-lm text-[color:var(--text-secondary)]">
                Manage user feedback and monitor review quality.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-[color:var(--text-secondary)]">Book ID: {bookId}</div>
            <div className="text-sm text-[color:var(--text-secondary)]">User ID: {userId}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 py-8">
        {/* Hero */}
        <div className="review-modern-card glow shadow-sm rounded-3xl p-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Reviews & Ratings Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* Stats + Analytics */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
     {/* Average Rating */}
<div className="review-modern-card glow shadow-sm rounded-5xl p-68">

  <div className="text-sm tracking-wide uppercase text-[color:var(--text-secondary)]">
    Average Rating
  </div>

  <div className="mt-5 text-7xl font-extrabold text-[color:var(--accent)] glow-number">
    {Number(summary.averageRating || 0).toFixed(1)}
  </div>

  <div className="mt-4 flex justify-center">
    <RatingStars
      value={Number(summary.averageRating || 0)}
      onChange={null}
      size="text-2xl"
    />
  </div>

  <div className="mt-4 text-sm font-semibold">
    {Number(summary.averageRating || 0) >= 4.5 && (
      <span className="text-emerald-400">Excellent 🔥</span>
    )}
    {Number(summary.averageRating || 0) >= 4 &&
      Number(summary.averageRating || 0) < 4.5 && (
        <span className="text-green-400">Very Good 👍</span>
      )}
    {Number(summary.averageRating || 0) >= 3 &&
      Number(summary.averageRating || 0) < 4 && (
        <span className="text-yellow-400">Good 🙂</span>
      )}
    {Number(summary.averageRating || 0) < 3 && (
      <span className="text-rose-400">Needs Improvement ⚠️</span>
    )}
  </div>

  <div className="mt-3 text-xs text-[color:var(--text-secondary)]">
    Based on {summary.totalReviews ?? 0} reviews
  </div>

</div>

        {/* Total Reviews */}
<div className="review-modern-card glow shadow-sm rounded-5xl p-6">

  <div className="text-sm tracking-wide uppercase text-[color:var(--text-secondary)]">
    Total Reviews
  </div>

  <div className="mt-5 text-6xl font-extrabold text-indigo-400 - glow-total">
    {summary.totalReviews ?? 0}
  </div>

  <div className="mt-3 text-xs text-[color:var(--text-secondary)]">
    Active (non-deleted) reviews
  </div>

</div>
          {/* Review Analytics */}
          <div className="review-modern-card glow shadow-sm rounded-5xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-[color:var(--text-secondary)]">
                Review Analytics
              </h3>

    
            </div>

            {/* Positive */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-sm text-[color:var(--text-secondary)]">
                  Positive Reviews
                </span>
                <span className="text-emerald-600 font-semibold">
                  {positivePercent}%
                </span>
              </div>

              <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${positivePercent}%` }}
                />
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {positiveCount} / {totalReviewsCount} reviews (rating ≥ 4)
              </div>
            </div>

            {/* Negative */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-sm text-[color:var(--text-secondary)]">
                  Negative Reviews
                </span>
                <span className="text-rose-600 font-semibold">
                  {negativePercent}%
                </span>
              </div>

              <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${negativePercent}%` }}
                />
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {negativeCount} / {totalReviewsCount} reviews (rating ≤ 2)
              </div>
            </div>

            {/* Most Common Rating */}
            <div className="mt-6 flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
              <div>
                <div className="text-sm text-gray-600">Most Common Rating</div>

                <div className="text-xl font-bold text-gray-900 mt-1">
                  {mostCommonRating ? `${mostCommonRating} ★` : "—"}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {mostCommonRating
                    ? "Mode based on current page"
                    : "No reviews available"}
                </div>
              </div>

              <div className="text-yellow-500 text-lg">{starsText}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-10">
          <ReviewFilters
            sort={sort}
            setSort={(v) => {
              setSort(v);
              setPage(0);
            }}
            ratingMin={ratingMin}
            setRatingMin={(v) => {
              setRatingMin(v);
              setPage(0);
            }}
            ratingMax={ratingMax}
            setRatingMax={(v) => {
              setRatingMax(v);
              setPage(0);
            }}
          />
        </div>

        {/* Create + List */}
        <div className="grid gap-8 lg:grid-cols-2">
          <ReviewForm
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            onSubmit={onCreate}
            loading={createLoading}
          />

          <div className="review-modern-card glow shadow-sm rounded-3xl p-6">
            <h3 className="text-xl font-semibold">Latest Reviews</h3>

            <div className="mt-6">
              <ReviewList
                reviews={reviews}
                onEdit={onOpenEdit}
                onDelete={onSoftDelete}
                canEditUserId={userId}
              />
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={editOpen}
        title="Edit Review"
        onClose={() => setEditOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">Rating</div>
            <RatingStars value={editRating} onChange={setEditRating} />
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Comment</div>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-gray-200 p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onSaveEdit}
              disabled={editLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold disabled:opacity-50"
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}