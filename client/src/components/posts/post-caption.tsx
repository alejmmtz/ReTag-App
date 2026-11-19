import type { ReactNode } from 'react';

type Props = {
  caption: string;
  store: boolean;
};

export default function PostCaption({ caption, store }: Props) {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of caption.matchAll(/(^|[^\w@.])(@[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)/g)) {
    const start = match.index + match[1].length;
    const mention = match[2];

    parts.push(caption.slice(cursor, start));
    parts.push(
      <span
        key={start}
        className={store ? 'text-foreground underline underline-offset-2' : 'text-blue'}
      >
        {mention}
      </span>,
    );
    cursor = start + mention.length;
  }

  parts.push(caption.slice(cursor));

  return (
    <p className="text-sm font-medium leading-5 break-words whitespace-pre-wrap">
      {parts}
    </p>
  );
}
