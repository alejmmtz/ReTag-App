"use client";

import AssetIcon from '../icons/asset-icon';
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

const ACCENT = { user: "#C8F66F", store: "#1D5CEB" } as const;

type Props = {
  garment?: GarmentDetail;
};

function SelectChevron({ color = "currentColor" }: { color?: string }) {
  return (
    <AssetIcon
      name="chevron-down"
      width={16}
      height={9}
      className="pointer-events-none"
      style={{ color }}
    />
  );
}

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
  const [colorsExpanded, setColorsExpanded] = useState(false);
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
      <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        {error ? (
          <p className="text-center text-sm text-orange">{error}</p>
        ) : (
          <div className="mx-auto h-12 max-w-lg animate-pulse rounded-full bg-[#222222]" />
        )}
      </main>
    );
  }

  const accent = ACCENT[role];
  const isStore = role === "store";
  const accentText = isStore ? "#FFFFFF" : "#141414";
  const today = new Date().toISOString().slice(0, 10);

  const effectiveType: TransactionType = isStore ? "sale" : transactionType;
  const needsPrice = effectiveType !== "trade";
  const priceNumber = Number(price);
  const priceValid =
    !needsPrice ||
    (price !== "" &&
      !Number.isNaN(priceNumber) &&
      priceNumber >= 1 &&
      priceNumber <= 10000);

  const totalPhotos = keptUrls.length + images.length;

  const missingFields: string[] = [];
  if (totalPhotos === 0) missingFields.push("photo");
  if (name.trim() === "") missingFields.push("name");
  if (!priceValid) missingFields.push("price ($1-$10,000)");
  if (datePurchased === "") missingFields.push("date");
  if (categoryId === "") missingFields.push("category");
  if (tagIds.length === 0) missingFields.push("ReTags");
  if (brandId === "") missingFields.push("brand");
  if (sizeId === "") missingFields.push("size");
  if (material === "") missingFields.push("material");
  if (colorIds.length === 0) missingFields.push("color");
  if (description.trim() === "") missingFields.push("description");

  const canSubmit = !submitting && missingFields.length === 0;

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
      : {
          backgroundColor: "#191919",
          borderColor: "#2C2C2C",
          color: "#D4D4D4",
        };
  }

  const visibleMaterials = materialsOpen ? MATERIALS : MATERIALS.slice(0, 4);
  const visibleCare = careOpen
    ? catalogs.careDetails
    : catalogs.careDetails.slice(0, 4);
  const visibleColors = colorsExpanded
    ? catalogs.colors
    : catalogs.colors.slice(0, 3);

  return (
    <main
      className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter"
    >
      <div className="mx-auto w-full mb-28">
        {/* Header */}
        <header className="flex items-center gap-2 border-b border-grey pb-6">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm leading-none text-foreground/90 transition active:bg-white/5 min-h-11 min-w-11"
          >
            <AssetIcon name="chevron" width={9} height={16} />
          </button>

          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {isEdit ? "Edit Garment" : "New Garment"}
          </h1>
        </header>

        {/* Fotos actuales (solo al editar) */}
        {keptUrls.length > 0 && (
          <div className="mb-3 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {keptUrls.map((url, index) => (
              <div
                key={url}
                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#1D1D1D]"
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
                  className="button-icon image-overlay absolute right-1 top-1"
                >
                  <AssetIcon name="x icon" width={16} height={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Área de imágenes */}
        <section className="-mx-8 w-[calc(100%+4rem)]">
          <ImagePicker
            images={images}
            onChange={setImages}
            accent={accent}
            max={MAX_PHOTOS - keptUrls.length}
            variant="garment"
          />
        </section>

        <div className="space-y-8 pt-8">
          {/* Nombre */}
          <section>
            <label
              className="block text-xs font-normal text-grey"
              htmlFor="garment-name"
            >
              Name
            </label>
            <input
              id="garment-name"
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 120))}
              placeholder="Stwd Jacket 2024 Winter"
              className="mt-2 w-full border-b border-line bg-transparent pb-2.5 text-sm text-foreground outline-none placeholder:text-[#6B6B6B] focus:border-white/50 min-h-11"
            />
          </section>

          {/* Modo de transacción */}
          {!isStore && !isEdit && (
            <section>
              <p className="mb-2.5 text-xs text-grey">
                Transaction mode
              </p>
              <div className="grid grid-cols-3 gap-2.5 min-w-0">
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
                      className="rounded-full border px-3 py-3 text-sm font-medium transition min-h-11 min-w-11"
                      style={
                        active
                          ? {
                              backgroundColor: "#FFFFFF",
                              borderColor: "#FFFFFF",
                              color: "#141414",
                            }
                          : {
                              backgroundColor: "#191919",
                              borderColor: "#2C2C2C",
                              color: "#8E8E8E",
                            }
                      }
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Precio y fecha de adquisición */}
          <section className="grid grid-cols-2 gap-3.5">
            <div>
              <label
                className="block text-xs text-grey"
                htmlFor="garment-price"
              >
                Price
              </label>
              <div className="mt-2 flex h-[44px] items-center rounded-[12px] border border-line bg-background px-3.5 focus-within:border-white/40 disabled:opacity-40">
                <span className="mr-1 text-sm text-foreground">$</span>
                <input
                  id="garment-price"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={10000}
                  value={needsPrice ? price : ""}
                  disabled={!needsPrice}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder={needsPrice ? "9.99" : "Exchange"}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-[#6B6B6B] disabled:opacity-40 min-h-11"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs text-grey"
                htmlFor="garment-date"
              >
                Date of Acquisition
              </label>
              <div className="relative mt-2 flex h-[44px] items-center rounded-[12px] border border-line bg-background px-3.5 focus-within:border-white/40">
                <input
                  id="garment-date"
                  type="date"
                  value={datePurchased}
                  max={today}
                  onChange={(event) => setDatePurchased(event.target.value)}
                  className="w-full bg-transparent pr-7 text-sm text-foreground outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 min-h-11"
                />
                <AssetIcon
                  name="calendar"
                  width={12}
                  height={12}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 opacity-75"
                />
              </div>
            </div>
          </section>

          {/* Categoría */}
          <section>
            <p className="mb-2.5 text-xs text-grey">Category</p>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                aria-label="Category"
                className="mt-2 w-full appearance-none rounded-full py-3 text-center text-sm font-medium outline-none"
                style={{ backgroundColor: accent, color: accentText }}
              >
                <option value="" disabled>
                  Select category
                </option>
                {catalogs.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-7.5 -translate-y-1/2">
                <SelectChevron color={accentText} />
              </span>
            </div>
          </section>

          {/* ReTags */}
          <section>
            <p className="mb-2.5 text-xs text-grey">ReTags</p>
            <div className="flex flex-wrap gap-2">
              {catalogs.tags.map((tag) => {
                const active = tagIds.includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(tagIds, tag.id, setTagIds)}
                    className="inline-flex h-[34px] items-center rounded-full border px-3.5 text-sm font-medium transition min-h-11 min-w-11"
                    style={chipStyle(active)}
                  >
                    #{tag.name}
                    {active && <AssetIcon name="x icon" width={14} height={14} className="ml-2" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Marca y talla */}
          <section className="grid grid-cols-2 gap-3.5">
            <div>
              <label
                className="block text-xs text-grey"
                htmlFor="garment-brand"
              >
                Brand
              </label>
              <div className="relative mt-2">
                <select
                  id="garment-brand"
                  value={brandId}
                  onChange={(event) => setBrandId(event.target.value)}
                  className="h-[44px] w-full appearance-none rounded-[12px] border border-line bg-background pl-3.5 pr-9 text-sm text-foreground outline-none focus:border-white/40"
                >
                  <option value="" disabled>
                    Select brand
                  </option>
                  {catalogs.brands.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grey">
                  <SelectChevron />
                </span>
              </div>
            </div>

            <div>
              <label
                className="block text-xs text-grey"
                htmlFor="garment-size"
              >
                Size
              </label>
              <div className="relative mt-2">
                <select
                  id="garment-size"
                  value={sizeId}
                  onChange={(event) => setSizeId(event.target.value)}
                  className="h-[44px] w-full appearance-none rounded-[12px] border border-line bg-background pl-3.5 pr-9 text-sm text-foreground outline-none focus:border-white/40"
                >
                  <option value="" disabled>
                    Select size
                  </option>
                  {catalogs.sizes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.type} · {item.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grey">
                  <SelectChevron />
                </span>
              </div>
            </div>
          </section>

          {/* Materiales */}
          <section>
            <p className="mb-2.5 text-xs text-grey">Materials</p>
            <div className="flex flex-wrap gap-2">
              {visibleMaterials.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={material === item}
                  onClick={() => setMaterial(material === item ? "" : item)}
                  className="h-[34px] rounded-full border px-3.5 text-sm font-medium capitalize transition min-h-11 min-w-11"
                  style={chipStyle(material === item)}
                >
                  {item}
                </button>
              ))}
              {!materialsOpen && MATERIALS.length > 4 && (
                <button
                  type="button"
                  onClick={() => setMaterialsOpen(true)}
                  aria-expanded={materialsOpen}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-grey active:border-grey active:text-foreground"
                >
                  More
                  <AssetIcon name="plus" width={18} height={18} />
                </button>
              )}
            </div>
          </section>

          {/* Condición */}
          <section>
            <p className="mb-2.5 text-xs text-grey">Condition</p>
            <div className="relative">
              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                aria-label="Condition"
                className="w-full appearance-none rounded-full py-3 pl-4 pr-9 text-sm font-medium capitalize outline-none"
                style={{ backgroundColor: accent, color: accentText }}
              >
                <option value="">Select condition (optional)</option>
                {CONDITIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                <SelectChevron color={accentText} />
              </span>
            </div>
          </section>

          {/* Cuidado y detalles */}
          <section>
            <p className="mb-2.5 text-xs text-grey">
              Care &amp; details
            </p>
            <div className="grid grid-cols-2 gap-2.5 min-w-0">
              {visibleCare.map((item) => {
                const active = careId === String(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCareId(active ? "" : String(item.id))}
                    className="flex h-[42px] items-center gap-2.5 rounded-[12px] border px-3.5 text-left text-sm font-medium transition min-h-11 min-w-11"
                    style={chipStyle(active)}
                  >
                    <span aria-hidden="true" className="inline-block h-4 w-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
            {!careOpen && catalogs.careDetails.length > 4 && (
              <button
                type="button"
                onClick={() => setCareOpen(true)}
                aria-expanded={careOpen}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-grey active:border-grey active:text-foreground"
              >
                More
                <AssetIcon name="plus" width={18} height={18} />
              </button>
            )}
          </section>

          {/* Colores */}
          <section>
            <p className="mb-2.5 text-xs text-grey">Colors</p>
            <div className="flex flex-wrap items-center gap-2.5">
              {visibleColors.map((color) => {
                const active = colorIds.includes(color.id);

                return (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={color.name}
                    aria-pressed={active}
                    title={color.name}
                    onClick={() => toggle(colorIds, color.id, setColorIds)}
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-full border transition min-h-11 min-w-11"
                    style={{
                      borderColor: active ? accent : "#383838",
                      boxShadow: active ? `0 0 0 1.5px ${accent}` : undefined,
                    }}
                  >
                    <span
                      className="h-[24px] w-[24px] rounded-full"
                      style={{ backgroundColor: color.hexcode }}
                    />
                  </button>
                );
              })}

              {!colorsExpanded && catalogs.colors.length > 3 && (
                <button
                  type="button"
                  aria-label="Show more colors"
                  onClick={() => setColorsExpanded(true)}
                  aria-expanded={colorsExpanded}
                  className="button-icon border border-line bg-surface/60 text-grey active:border-grey active:text-foreground"
                >
                  <AssetIcon name="plus" width={20} height={20} />
                </button>
              )}
            </div>
          </section>

          {/* Descripción */}
          <section>
            <label
              className="mb-2 block text-xs text-grey"
              htmlFor="garment-description"
            >
              Description
            </label>
            <textarea
              id="garment-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value.slice(0, MAX_DESCRIPTION))
              }
              rows={4}
              placeholder="Write about the garment..."
              className="w-full resize-none rounded-[14px] border border-line bg-background p-3.5 text-sm text-foreground outline-none placeholder:text-[#6B6B6B] focus:border-white/40"
            />
            <p className="mt-1 text-right text-xs text-[#7A7A7A]">
              {description.length}/{MAX_DESCRIPTION}
            </p>
          </section>

          {error && (
            <p className="text-xs text-orange" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Botón fijo abajo */}
      <div className="fixed mx-auto w-full max-w-lg inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/95 to-transparent pb-6 pt-12 px-8">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="button-pill w-full transition disabled:opacity-50"
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

          {!submitting && missingFields.length > 0 && (
            <p className="mt-2 text-center text-xs text-[#8E8E8E]">
              Oops, you&#39;re missing some things... {missingFields.join(", ")}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
