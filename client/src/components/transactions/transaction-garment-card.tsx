import Image from 'next/image';

type GarmentImage = {
  id: number;
  url: string;
  isCover: boolean;
};

type Garment = {
  id: string;
  name: string;
  images?: GarmentImage[];
};

type Props = {
  garment: Garment;
  label: string;
  variant?: 'green' | 'white';
  showCheck?: boolean;
};

function getGarmentImage(garment: Garment) {
  const cover = garment.images?.find(
    (image) => image.isCover,
  );

  return cover?.url ?? garment.images?.[0]?.url ?? '';
}

export default function TransactionGarmentCard({
  garment,
  label,
  variant = 'green',
  showCheck = false,
}: Props) {
  const isGreen = variant === 'green';
  const image = getGarmentImage(garment);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border-4
        ${
          isGreen
            ? 'border-green'
            : 'border-foreground'
        }
      `}
    >
      {/* Card label */}
      <div
        className={`
          absolute left-0 top-0 z-10
          flex max-w-[85%] items-center gap-3
          rounded-br-[10px]
          px-3 py-2
          text-background
          ${
            isGreen
              ? 'bg-green'
              : 'bg-foreground'
          }
        `}
      >
        <p className="truncate text-sm font-medium">
          {label}
        </p>

        {/* Optional check used in Propose */}
        {showCheck && (
          <Image src="/icons/verified-badge.svg" alt="" width={16} height={16} className="shrink-0" />
        )}
      </div>

      {/* Garment image */}
      {image ? (
        <img
          src={image}
          alt={garment.name}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square items-center justify-center bg-surface text-foreground/50">
          No image
        </div>
      )}
    </div>
  );
}
