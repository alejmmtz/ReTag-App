'use client';

import { useState } from 'react';

import ChevronDownIcon from '../icons/chevron-down-icon';
import type { FeedFilter } from './post-types';

type Option = {
  value: FeedFilter;
  label: string;
};

const options: Option[] = [
  { value: 'for_you', label: 'For You' },
  { value: 'following', label: 'Following' },
];

type Props = {
  value: FeedFilter;
  onChange: (value: FeedFilter) => void;
  accent?: string;
  accentText?: string;
};

export default function FeedFilterSelect({
  value,
  onChange,
  accent = '#C8F66F',
  accentText = '#1A1A1A',
}: Props) {
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
        className="flex h-12 w-full items-center gap-2 rounded-[12px] px-4 text-sm font-medium min-h-11 min-w-11"
        style={{ backgroundColor: accent, color: accentText }}
      >
        {current?.label}
        <ChevronDownIcon />
      </button>

      {open && (
        <ul
          role="listbox"
          className="page-enter absolute left-0 right-0 top-[58px] z-30 overflow-hidden rounded-[12px] border border-line bg-[#171717]"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => select(option.value)}
                className="w-full px-4 py-3 text-left text-sm min-h-11 min-w-11"
                style={{
                  color: option.value === value ? accent : '#FFFFFF',
                }}
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
