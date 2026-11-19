import AssetIcon from './asset-icon';

export default function CalendarIcon({ active }: { active: boolean }) {
  return <AssetIcon name="event" className={active ? "text-foreground" : "text-grey"} />;
}
