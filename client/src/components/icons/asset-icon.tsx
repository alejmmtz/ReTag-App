import type { CSSProperties } from 'react';

type Props = {
  name: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
};

// Use the original monochrome asset as a mask so its color follows the text.
export default function AssetIcon({
  name,
  width = 20,
  height = 20,
  className = '',
  style,
}: Props) {
  const source = `url("/icons/${encodeURIComponent(name)}.svg")`;

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block shrink-0 select-none align-middle transition-colors duration-200 motion-reduce:transition-none ${className}`}
      style={{
        width,
        height,
        maxWidth: '100%',
        maxHeight: '100%',
        backgroundColor: 'currentColor',
        maskImage: source,
        WebkitMaskImage: source,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        ...style,
      }}
    />
  );
}
