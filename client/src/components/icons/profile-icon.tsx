import AssetIcon from './asset-icon';

export default function ProfileIcon({ active }: { active: boolean }) {
  return <AssetIcon name="user" className={active ? "text-foreground" : "text-grey"} />;
}
