import Image from 'next/image';
import { useRef } from 'react';
import AssetIcon from '../icons/asset-icon';
import type { StoreFields } from './store-fields';

type Props = {
  fields: StoreFields;
  profile: string;
  cover: string;
  hasSelectedProfile: boolean;
  onSelect: (kind: 'profile' | 'cover', file: File | null) => void;
  onClear: (kind: 'profile' | 'cover') => void;
};

const accept = 'image/jpeg,image/png,image/webp,image/gif';

export default function StoreIdentity({ fields, profile, cover, hasSelectedProfile, onSelect, onClear }: Props) {
  const profileInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  return (
    <section aria-label="Store visual identity">
      <div className="relative">
        <button type="button" onClick={() => coverInput.current?.click()} aria-label={cover ? 'Change cover photo' : 'Add a cover photo'} className="relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-blue/40 bg-blue/10 text-grey active:border-blue">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="Store cover preview" className="size-full object-cover" />
          ) : <><AssetIcon name="image" width={28} height={28} /><span className="text-xs">Your store, at first glance</span></>}
        </button>
        {cover && <button type="button" onClick={() => onClear('cover')} aria-label="Remove cover photo" className="button-icon image-overlay absolute right-3 top-3"><AssetIcon name="x icon" width={16} height={16} /></button>}
        <div className="absolute -bottom-8 left-4">
          <button type="button" onClick={() => profileInput.current?.click()} aria-label="Change store profile photo" className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-blue shadow-lg shadow-background/30">
            {profile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile} alt="Store profile preview" className="size-full object-cover" />
            ) : <Image src="/illustrations/store-placeholder.png" alt="Store profile placeholder" width={120} height={120} className="size-full object-cover" />}
          </button>
          {hasSelectedProfile && <button type="button" onClick={() => onClear('profile')} aria-label="Remove selected profile photo" className="button-icon image-overlay absolute -right-3 -top-2"><AssetIcon name="x icon" width={16} height={16} /></button>}
        </div>
      </div>
      <div className="mt-12">
        <h3 className="break-words text-base font-semibold">{fields.storeName.trim()}</h3>
        {fields.socialmedia.trim() && <p className="mt-1 text-xs text-grey">@{fields.socialmedia.trim().replace(/^@/, '')}</p>}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {(['profile', 'cover'] as const).map((kind) => (
          <label key={kind} className="flex min-w-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-grey/40 bg-surface/60 px-3 py-4 text-center text-sm focus-within:border-blue active:border-blue">
            <AssetIcon name="plus" />
            <span>{kind === 'profile' ? 'Profile photo' : 'Cover photo'}</span>
            <input
              ref={kind === 'profile' ? profileInput : coverInput}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(event) => { onSelect(kind, event.target.files?.[0] ?? null); event.target.value = ''; }}
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-grey">Photos are optional. JPG, PNG, WebP or GIF, up to 5 MB each. You can change them later.</p>
    </section>
  );
}
