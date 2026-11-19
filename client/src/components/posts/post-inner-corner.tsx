import AssetIcon from '../icons/asset-icon';

type PostInnerCornerProps = {
  corner: 'left-top' | 'right-top' | 'right-bottom' | 'left-bottom';
  width?: number;
  height?: number;
  className?: string;
};

export default function PostInnerCorner({
  corner,
  width = 16,
  height = 16,
  className = '',
}: PostInnerCornerProps) {
  return (
    <AssetIcon
      name={`inner-corner-${corner}`}
      width={width}
      height={height}
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
