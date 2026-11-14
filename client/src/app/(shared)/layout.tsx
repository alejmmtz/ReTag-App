export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="mx-auto min-h-dvh w-full max-w-[520px]">
        {children}
      </div>
    </div>
  );
}