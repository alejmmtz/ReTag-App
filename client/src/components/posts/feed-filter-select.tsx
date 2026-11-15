'use client';

import { useState } from 'react';

import ChevronDownIcon from '../icons/chevron-down-icon';
import FeedStickers from './feed-stickers';
import type { FeedFilter } from './post-types';

type Option = {
  value: FeedFilter;
  label: string;
};

const options: Option[] = [
  { value: 'for_you', label: 'For You' },
  { value: 'following', label: 'Following' },
  { value: 'underground', label: 'Underground' },
];

type Props = {
  value: FeedFilter;
  onChange: (value: FeedFilter) => void;
};

export default function FeedFilterSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const current = options.find((option) => option.value === value);

  function select(next: FeedFilter) {
    setOpen(false);

    if (next !== value) {
      onChange(next);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-[50px] w-full items-center gap-2 rounded-[12px] bg-[#C8F66F] px-4 text-[16px] font-medium text-[#1A1A1A]"
      >
        {current?.label}
        <ChevronDownIcon />
      </button>

      <FeedStickers />

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[58px] z-30 overflow-hidden rounded-[12px] border border-[#303030] bg-[#171717]"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => select(option.value)}
                className={`w-full px-4 py-3 text-left text-[15px] ${
                  option.value === value
                    ? 'text-[#C8F66F]'
                    : 'text-white'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
