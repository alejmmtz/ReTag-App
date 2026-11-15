type HeartIconProps = {
  filled?: boolean;
  size?: number;
};

export default function HeartIcon({
  filled = false,
  size = 24,
}: HeartIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden="true"
    >
      <path
        d="M12 20.5C12 20.5 3.5 15.2 3.5 9.1C3.5 6.5 5.5 4.5 8 4.5C9.6 4.5 11.1 5.3 12 6.7C12.9 5.3 14.4 4.5 16 4.5C18.5 4.5 20.5 6.5 20.5 9.1C20.5 15.2 12 20.5 12 20.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
