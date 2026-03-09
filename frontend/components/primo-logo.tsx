export function PrimoLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-9 w-9 items-center justify-center">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-20 blur-sm" />
        {/* Main logo container */}
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
          {/* P letter stylized */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 4v16" className="text-white" stroke="white" />
            <path
              d="M7 4h6a4 4 0 0 1 0 8H7"
              className="text-white"
              stroke="white"
              fill="none"
            />
            {/* Decorative dot */}
            <circle cx="17" cy="8" r="2" fill="white" stroke="none" opacity="0.6" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-foreground">
          Primo
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          CRM
        </span>
      </div>
    </div>
  );
}
