export default function ReadingToolsPanel({
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
}) {
  const themes = ["Dark", "Sepia", "Light"];

  return (
    <div className="panel space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reading Tools</h2>
          <p className="text-sm text-secondary">Adjust reading comfort</p>
        </div>

        <span className="badge">Accessibility</span>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Font Size</h3>
            <p className="text-sm text-secondary">Adjust reading comfort</p>
          </div>
          <span className="badge">{fontSize}px</span>
        </div>

        <input
          type="range"
          min="14"
          max="28"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Line Height</h3>
            <p className="text-sm text-secondary">Improve readability</p>
          </div>
          <span className="badge">{lineHeight.toFixed(1)}</span>
        </div>

        <input
          type="range"
          min="1.4"
          max="2.4"
          step="0.1"
          value={lineHeight}
          onChange={(e) => setLineHeight(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <h3 className="font-medium">Theme</h3>
          <p className="text-sm text-secondary">Dark / Sepia / Light</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {themes.map((item) => {
            const active = theme === item.toLowerCase();

            return (
              <button
                key={item}
                onClick={() => setTheme(item.toLowerCase())}
                className={`rounded-xl border px-4 py-3 text-sm transition ${
                  active
                    ? "border-cyan-400/30 bg-cyan-500/10 text-white shadow-[0_0_12px_rgba(0,229,255,0.12)]"
                    : "border-white/10 bg-white/[0.03] text-secondary hover:border-cyan-400/20 hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card flex items-center justify-between gap-4 p-5">
        <div>
          <h3 className="font-medium">High Contrast</h3>
          <p className="text-sm text-secondary">Better readability</p>
        </div>

        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`btn ${highContrast ? "btn-accent" : ""}`}
        >
          {highContrast ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}