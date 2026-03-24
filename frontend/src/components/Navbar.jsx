export default function Navbar() {
    return (
        <header className="border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <div className="text-[30px] font-bold leading-none tracking-tight">
            <span className="text-white">e</span>
            <span style={{ color: "var(--accent)" }}>Library</span>
          </div>
  
          <div className="hidden md:block text-sm text-secondary">
            Reader Module
          </div>
  
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-semibold text-white ring-1 ring-cyan-400/20">
            U
          </div>
        </div>
      </header>
    );
  }