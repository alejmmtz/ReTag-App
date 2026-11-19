import AssetIcon from './asset-icon';

export default function ActivityIcon({ active }: { active: boolean }) {
  return <AssetIcon name="activity" className={active ? "text-foreground" : "text-grey"} />;
}
