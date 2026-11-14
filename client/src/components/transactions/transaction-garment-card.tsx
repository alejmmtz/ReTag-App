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
            ? 'border-[#C8F66F]'
            : 'border-[#F5F5F5]'
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
          text-[#1A1A1A]
          ${
            isGreen
              ? 'bg-[#C8F66F]'
              : 'bg-[#F5F5F5]'
          }
        `}
      >
        <p className="truncate text-[14px] font-medium md:text-[15px]">
          {label}
        </p>

        {/* Optional check used in Propose */}
        {showCheck && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[12px] font-bold text-[#C8F66F]">
            ✓
          </span>
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
        <div className="flex aspect-square items-center justify-center bg-[#242424] text-white/50">
          No image
        </div>
      )}
    </div>
  );
}