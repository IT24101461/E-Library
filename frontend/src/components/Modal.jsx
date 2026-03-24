import { useEffect } from "react";

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl animate-[popIn_200ms_ease-out]">
        {/* Glow layer */}
        <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-indigo-500/35 via-fuchsia-500/35 to-cyan-400/25 blur-2xl opacity-60" />

        {/* Actual modal */}
        <div className="relative glass glow rounded-[28px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
            <div className="min-w-0">
              <div className="text-xs text-slate-400">Modal</div>
              <h3 className="text-base font-semibold tracking-tight truncate">
                {title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="btn-ghost px-3 py-2 text-sm"
              aria-label="Close modal"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>

      {/* Keyframes (Tailwind arbitrary animations rely on these names) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}