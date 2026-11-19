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
  width = 24,
  height = 24,
  className = '',
  style,
}: Props) {
  const source = `url("/icons/${name}.svg")`;

  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 align-middle transition-colors duration-200 motion-reduce:transition-none ${className}`}
      style={{
        width,
        height,
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
