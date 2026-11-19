import AssetIcon from '../icons/asset-icon';

type Props = {
  role: 'user' | 'store';
  open: boolean;
  onClick: () => void;
};

export default function CreateAction({ role, open, onClick }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-40 mx-auto flex w-full max-w-lg justify-end px-8">
      <button
        type="button"
        onClick={onClick}
        aria-label="Create"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${role}-create-menu`}
        className={`floating-action ${role === 'store' ? 'bg-blue text-foreground' : 'bg-green text-background'}`}
      >
        <AssetIcon name="plus" />
      </button>
    </div>
  );
}
