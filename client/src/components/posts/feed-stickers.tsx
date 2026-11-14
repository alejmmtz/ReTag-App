// Decorative stickers that overlap the feed filter bar (visual only).
export default function FeedStickers() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-[10px] right-[6px] h-[70px] w-[110px]"
    >
      {/* Blue sunburst */}
      <svg
        className="absolute right-0 top-0"
        width="52"
        height="52"
        viewBox="0 0 52 52"
      >
        {Array.from({ length: 16 }).map((_, index) => (
          <line
            key={index}
            x1="26"
            y1="3"
            x2="26"
            y2="14"
            stroke="#1D5CEB"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${index * 22.5} 26 26)`}
          />
        ))}
      </svg>

      {/* Smiley */}
      <svg
        className="absolute right-[44px] top-0"
        width="26"
        height="26"
        viewBox="0 0 26 26"
      >
        <circle cx="13" cy="13" r="12" fill="white" />
        <circle cx="9" cy="10" r="1.6" fill="#1A1A1A" />
        <circle cx="17" cy="10" r="1.6" fill="#1A1A1A" />
        <path
          d="M7.5 15C9 18.5 17 18.5 18.5 15"
          stroke="#1A1A1A"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Barcode tag */}
      <svg
        className="absolute right-[34px] top-[30px] -rotate-6"
        width="40"
        height="36"
        viewBox="0 0 40 36"
      >
        <rect width="40" height="36" rx="3" fill="white" />
        {[6, 10, 13, 18, 21, 26, 29, 33].map((x, index) => (
          <rect
            key={x}
            x={x}
            y="7"
            width={index % 2 === 0 ? 2 : 1}
            height="22"
            fill="#1A1A1A"
          />
        ))}
      </svg>
    </div>
  );
}
