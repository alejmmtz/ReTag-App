import AssetIcon from './asset-icon';

export default function StoreIcon({ active }: { active: boolean }) {
  return <AssetIcon name="store" className={active ? "text-foreground" : "text-grey"} />;
}
