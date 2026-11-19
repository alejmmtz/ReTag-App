import AssetIcon from './asset-icon';

export default function HomeIcon({ active }: { active: boolean }) {
  return <AssetIcon name="home" className={active ? "text-foreground" : "text-grey"} />;
}
