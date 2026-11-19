"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ImagePicker, { type PickedImage } from "../posts/image-picker";
import type { MeResponse } from "../posts/post-types";
import { ApiError, authFetch, clearSession } from "../../lib/http";
import { uploadImages } from "../../lib/uploads";
import type { GarmentDetail } from "./garment-detail-types";
import {
  CONDITIONS,
  MATERIALS,
  type CatalogsResponse,
  type TransactionType,
} from "./garment-types";

const MAX_DESCRIPTION = 350;
const MAX_PHOTOS = 10;

const ACCENT = { user: "#C8F66F", store: "#2864E8" } as const;

type Props = {
  garment?: GarmentDetail;
};

export default function GarmentForm({ garment }: Props) {
  const router = useRouter();
  const isEdit = !!garment;

  const [role, setRole] = useState<"user" | "store" | null>(null);
  const [catalogs, setCatalogs] = useState<CatalogsResponse | null>(null);

  const [keptUrls, setKeptUrls] = useState<string[]>(
    garment?.images.map((image) => image.url) ?? [],
  );
  const [images, setImages] = useState<PickedImage[]>([]);

  const [name, setName] = useState(garment?.name ?? "");
  const [description, setDescription] = useState(garment?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    garment?.category ? String(garment.category.id) : "",
  );
  const [brandId, setBrandId] = useState(
    garment?.brand ? String(garment.brand.id) : "",
  );
  const [sizeId, setSizeId] = useState(
    garment?.size ? String(garment.size.id) : "",
  );
  const [material, setMaterial] = useState(garment?.material ?? "");
  const [condition, setCondition] = useState(garment?.condition ?? "");
  const [careId, setCareId] = useState(
    garment?.care ? String(garment.care.id) : "",
  );
  const [datePurchased, setDatePurchased] = useState(
    garment?.datePurchased ?? "",
  );
  const [colorIds, setColorIds] = useState<number[]>(
    garment?.colors.map((color) => color.id) ?? [],
  );
  const [tagIds, setTagIds] = useState<number[]>(
    garment?.tags.map((tag) => tag.id) ?? [],
  );
  const [transactionType, setTransactionType] = useState<TransactionType>(
    garment?.transactionType ?? "sale",
  );
  const [price, setPrice] = useState(
    garment?.price != null ? String(Number(garment.price)) : "",
  );

  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSessionError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
      router.replace("/login");
      return true;
    }

    return false;
  }

  // Carga el rol y los catálogos (categorías, marcas, tallas, colores...).
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [me, data] = await Promise.all([
          authFetch<MeResponse>("/auth/me"),
          authFetch<CatalogsResponse>("/catalogs"),
        ]);

        if (!cancelled) {
          setRole(me.role);
          setCatalogs(data);
        }
      } catch (err) {
        if (!cancelled && !handleSessionError(err)) {
          setError("We could not load the form. Try again later.");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!role || !catalogs) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-16 text-white">
        {error ? (
          <p className="text-center text-[14px] text-[#FB3F0F]">{error}</p>
        ) : (
          <div className="h-[48px] w-full animate-pulse rounded-full bg-[#262626]" />
        )}
      </main>
    );
  }

  const accent = ACCENT[role];
  const isStore = role === "store";
  const accentText = isStore ? "#FFFFFF" : "#1A1A1A";
  const today = new Date().toISOString().slice(0, 10);

  const effectiveType: TransactionType = isStore ? "sale" : transactionType;
  const needsPrice = effectiveType !== "trade";
  const priceNumber = Number(price);
  const priceValid =
    !needsPrice || (price !== "" && priceNumber >= 1 && priceNumber <= 10000);

  const totalPhotos = keptUrls.length + images.length;

  const canSubmit =
    !submitting &&
    totalPhotos > 0 &&
    name.trim() !== "" &&
    description.trim() !== "" &&
    categoryId !== "" &&
    brandId !== "" &&
    sizeId !== "" &&
    material !== "" &&
    datePurchased !== "" &&
    colorIds.length > 0 &&
    tagIds.length > 0 &&
    priceValid;

  function toggle(list: number[], id: number, set: (v: number[]) => void) {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const uploaded = await uploadImages(
        images.map((image) => image.file),
        "Garments",
      );
      const urls = [...keptUrls, ...uploaded];

      const body = {
        name: name.trim(),
        description: description.trim(),
        categoryId: Number(categoryId),
        brandId: Number(brandId),
        sizeId: Number(sizeId),
        material,
        datePurchased: `${datePurchased}T12:00:00`,
        colorIds,
        tagIds,
        ...(condition ? { condition } : {}),
        ...(careId ? { careId: Number(careId) } : {}),
        ...(needsPrice ? { price: priceNumber } : {}),
        images: urls.map((url) => ({ url })),
      };

      if (garment) {
        await authFetch(`/garments/${garment.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });

        router.push(`/garment/${garment.id}`);
        return;
      }

      await authFetch(isStore ? "/garments/store" : "/garments", {
        method: "POST",
        body: JSON.stringify({
          ...body,
          ...(isStore ? {} : { transactionType: effectiveType }),
        }),
      });

      router.push("/create-garment/sent");
    } catch (err) {
      if (handleSessionError(err)) {
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : "We could not save your garment. Try again.",
      );
      setSubmitting(false);
    }
  }

  function chipStyle(active: boolean) {
    return active
      ? { backgroundColor: accent, borderColor: accent, color: accentText }
      : { borderColor: "#6C6C6C", color: "#F5F5F5" };
  }

  const showAllMaterials = materialsOpen;
  const visibleMaterials = showAllMaterials ? MATERIALS : MATERIALS.slice(0, 4);
  const visibleCare = careOpen
    ? catalogs.careDetails
    : catalogs.careDetails.slice(0, 4);

  const UNDERLINE =
    "w-full border-b border-grey bg-transparent pb-2 text-[22px] text-foreground outline-none placeholder:text-grey focus:border-foreground";
  const PILL_SELECT =
    "h-[52px] w-full rounded-full px-5 text-[16px] font-medium outline-none";

  return (
    <main className="min-h-screen bg-background pb-[150px] text-foreground">
      <div className="mx-auto w-full max-w-[520px] px-7 sm:px-8">
        <header className="-mx-7 flex h-[104px] items-center gap-3 border-b border-white/10 px-7 sm:-mx-8 sm:px-8">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-[48px] w-[48px] items-center justify-start text-[42px] leading-none"
          >
            ‹
          </button>

          <h1 className="text-[28px] font-medium tracking-[-0.03em]">
            {isEdit ? "Edit Garment" : "New Garment"}
          </h1>
        </header>

        {/* Fotos actuales (solo al editar) */}
        {keptUrls.length > 0 && (
          <div className="mt-5 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
            {keptUrls.map((url, index) => (
              <div
                key={url}
                className="relative h-[96px] w-[80px] shrink-0 overflow-hidden rounded-[14px] bg-[#262626]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Current photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() =>
                    setKeptUrls(keptUrls.filter((item) => item !== url))
                  }
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[14px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Fotos (área grande arriba) */}
        <section className="mt-5">
          <ImagePicker
            images={images}
            onChange={setImages}
            accent={accent}
            max={MAX_PHOTOS - keptUrls.length}
            variant="garment"
          />
        </section>

        {/* Nombre */}
        <section className="mt-6">
          <label className="text-[16px] text-grey" htmlFor="garment-name">
            Name
          </label>
          <input
            id="garment-name"
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 120))}
            placeholder="e.g. True Religion Jeans"
            className={`mt-1 ${UNDERLINE}`}
          />
        </section>

        {/* Modo de transacción: solo user y solo al crear */}
        {!isStore && !isEdit && (
          <section className="mt-6">
            <p className="mb-4 text-[16px] text-grey">Transaction mode</p>
            <div className="flex gap-2">
              {(
                [
                  { value: "sale", label: "Purchase" },
                  { value: "trade", label: "Exchange" },
                  { value: "both", label: "Both" },
                ] as { value: TransactionType; label: string }[]
              ).map((type) => {
                const active = transactionType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setTransactionType(type.value)}
                    className="h-[54px] flex-1 rounded-full border px-2 text-[15px] font-medium"
                    style={
                      active
                        ? {
                            backgroundColor: "#FFFFFF",
                            borderColor: "#FFFFFF",
                            color: "#1A1A1A",
                          }
                        : { borderColor: "#6C6C6C", color: "#F5F5F5" }
                    }
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Precio y fecha de adquisición, lado a lado */}
        <section className="mt-6 grid grid-cols-2 gap-5">
          <div>
            <label
              className="text-[16px] text-grey"
              htmlFor="garment-price"
            >
              Price (USD)
            </label>
            <input
              id="garment-price"
              type="number"
              inputMode="decimal"
              min={1}
              max={10000}
              value={needsPrice ? price : ""}
              disabled={!needsPrice}
              onChange={(event) => setPrice(event.target.value)}
              placeholder={needsPrice ? "0" : "Exchange"}
              className={`mt-3 h-[66px] rounded-[18px] border border-white/10 px-5 ${UNDERLINE} disabled:opacity-40`}
            />
          </div>

          <div>
            <label
              className="text-[16px] text-grey"
              htmlFor="garment-date"
            >
              Date of Acquisition
            </label>
            <div className="relative mt-3">
              <input
                id="garment-date"
                type="date"
                value={datePurchased}
                max={today}
                onChange={(event) => setDatePurchased(event.target.value)}
                className={`h-[66px] rounded-[18px] border border-white/10 px-5 pr-14 ${UNDERLINE} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0`}
              />
              <Image src="/icons/calendar.svg" alt="" width={22} height={24} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </section>

        {/* Categoría */}
        <section className="mt-6">
          <p className="mb-4 text-[16px] text-grey">Category</p>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-label="Category"
            className={PILL_SELECT}
            style={{ backgroundColor: accent, color: accentText }}
          >
            <option value="">Select a category</option>
            {catalogs.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </section>

        {/* ReTags */}
        <section className="mt-6">
          <p className="mb-4 text-[16px] text-grey">ReTags</p>
          <div className="flex flex-wrap gap-2">
            {catalogs.tags.map((tag) => {
              const active = tagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(tagIds, tag.id, setTagIds)}
                  className="h-[48px] rounded-full border px-5 text-[16px] font-medium"
                  style={chipStyle(active)}
                >
                  #{tag.name}
                  {active && <span className="ml-2">×</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* Marca y talla, lado a lado */}
        <section className="mt-6 grid grid-cols-2 gap-5">
          <div>
            <label
              className="text-[16px] text-grey"
              htmlFor="garment-brand"
            >
              Brand
            </label>
            <select
              id="garment-brand"
              value={brandId}
              onChange={(event) => setBrandId(event.target.value)}
              className={`mt-3 h-[66px] rounded-[18px] border border-white/10 px-5 ${UNDERLINE} [color-scheme:dark]`}
            >
              <option value="">Select</option>
              {catalogs.brands.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="text-[16px] text-grey"
              htmlFor="garment-size"
            >
              Size
            </label>
            <select
              id="garment-size"
              value={sizeId}
              onChange={(event) => setSizeId(event.target.value)}
              className={`mt-3 h-[66px] rounded-[18px] border border-white/10 px-5 ${UNDERLINE} [color-scheme:dark]`}
            >
              <option value="">Select</option>
              {catalogs.sizes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.type} · {item.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Materiales */}
        <section className="mt-6">
          <p className="mb-4 text-[16px] text-grey">Materials</p>
          <div className="flex flex-wrap gap-2">
            {visibleMaterials.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={material === item}
                onClick={() => setMaterial(material === item ? "" : item)}
                className="h-[48px] rounded-full border px-5 text-[16px] capitalize"
                style={chipStyle(material === item)}
              >
                {item}
              </button>
            ))}
            {!showAllMaterials && MATERIALS.length > 4 && (
              <button
                type="button"
                onClick={() => setMaterialsOpen(true)}
                className="h-[48px] rounded-full border border-[#6C6C6C] px-5 text-[16px]"
              >
                More +
              </button>
            )}
          </div>
        </section>

        {/* Condición */}
        <section className="mt-6">
          <p className="mb-4 text-[16px] text-grey">Condition</p>
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            aria-label="Condition"
            className={`${PILL_SELECT} capitalize`}
            style={{ backgroundColor: accent, color: accentText }}
          >
            <option value="">Select a condition</option>
            {CONDITIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        {/* Cuidado y detalles */}
        <section className="mt-6">
          <p className="mb-4 text-[16px] text-grey">Care &amp; details</p>
          <div className="grid grid-cols-2 gap-3">
            {visibleCare.map((item) => {
              const active = careId === String(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCareId(active ? "" : String(item.id))}
                  className="flex min-h-[72px] items-center gap-3 rounded-[18px] border px-4 text-left text-[15px] leading-tight"
                  style={chipStyle(active)}
                >
                  <Image src="/icons/garment.svg" alt="" width={26} height={24} className="shrink-0 brightness-0 invert" />
                  {item.name}
                </button>
              );
            })}
          </div>
          {!careOpen && catalogs.careDetails.length > 4 && (
            <button
              type="button"
              onClick={() => setCareOpen(true)}
              className="mt-3 h-[34px] rounded-full border border-[#6C6C6C] px-4 text-[13px]"
            >
              More +
            </button>
          )}
        </section>

        {/* Colores */}
        <section className="mt-6">
          <p className="mb-4 text-[16px] text-grey">Colors</p>
          <div className="flex flex-wrap gap-3">
            {catalogs.colors.map((color) => {
              const active = colorIds.includes(color.id);

              return (
                <button
                  key={color.id}
                  type="button"
                  aria-label={color.name}
                  aria-pressed={active}
                  title={color.name}
                  onClick={() => toggle(colorIds, color.id, setColorIds)}
                  className="h-[42px] w-[42px] rounded-full border-2"
                  style={{
                    backgroundColor: color.hexcode,
                    borderColor: active ? accent : "rgba(255,255,255,0.25)",
                    boxShadow: active ? `0 0 0 2px ${accent}55` : undefined,
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* Descripción */}
        <section className="mt-6">
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value.slice(0, MAX_DESCRIPTION))
            }
            rows={4}
            placeholder="Description: tell us about this garment..."
            className="h-[190px] w-full resize-none rounded-[22px] border border-white/10 bg-transparent p-5 text-[18px] text-foreground outline-none placeholder:text-grey focus:border-white/25"
          />
          <p className="mt-1 text-right text-[12px] text-[#8A8A8A]">
            {description.length}/{MAX_DESCRIPTION}
          </p>
        </section>

        {error && (
          <p className="mt-2 text-[13px] text-[#FB3F0F]" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Botón fijo abajo */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent pb-8 pt-6">
        <div className="mx-auto w-full max-w-[520px] px-7 sm:px-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-[51px] w-full rounded-full text-[15px] font-medium disabled:opacity-40"
            style={{ backgroundColor: accent, color: accentText }}
          >
            {submitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save changes"
                : "Add to closet"}
          </button>
        </div>
      </div>
    </main>
  );
}
