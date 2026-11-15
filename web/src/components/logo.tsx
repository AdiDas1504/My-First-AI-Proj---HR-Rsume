export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} aria-hidden="true" focusable="false">
      <rect x="40" y="40" width="944" height="944" rx="208" fill="#1F4D3A" />
      <path
        fill="#fff"
        d="M310 172H530V354C530 408 573 452 628 452H800V766C800 814 762 853 714 853H310C262 853 224 814 224 766V258C224 210 262 172 310 172Z"
      />
      <path fill="#fff" d="M560 172C601 172 651 215 706 271C762 327 800 374 800 422H628C590 422 560 392 560 354Z" />
      <path
        d="M606 341L635 372L699 307"
        fill="none"
        stroke="#E9A23B"
        strokeWidth="35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span dir="ltr" className="font-display text-[1.45rem] font-bold tracking-tight text-forest">
        JobFit
      </span>
    </span>
  );
}
