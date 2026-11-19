import AssetIcon from './asset-icon';

type HeartIconProps = { filled?: boolean; size?: number };

export default function HeartIcon({ filled = false, size = 24 }: HeartIconProps) {
  return <AssetIcon name="like" width={size} height={size} className={filled ? "text-orange" : ""} />;
}
