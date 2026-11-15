'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  CONDITIONS,
  MATERIALS,
  TRANSACTION_TYPES,
  type CatalogsResponse,
  type TransactionType,
} from '../../../components/garment/garment-types';
import ImagePicker, {
  type PickedImage,
} from '../../../components/posts/image-picker';
import type { MeResponse } from '../../../components/posts/post-types';
import { ApiError, authFetch, clearSession } from '../../../lib/http';
import { uploadImages } from '../../../lib/uploads';

const MAX_DESCRIPTION = 350;

const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;

const FIELD =
  'h-[48px] w-full rounded-full border border-[#6C6C6C] bg-[#191919] px-4 text-[14px] text-white outline-none placeholder:text-[#8A8A8A]';

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[14px] text-[#8A8A8A]">{children}</p>;
}

export default function CreateGarmentPage() {
  const router = useRouter();

  const [role, setRole] = useState<'user' | 'store' | null>(null);
  const [catalogs, setCatalogs] = useState<CatalogsResponse | null>(null);

  const [images, setImages] = useState<PickedImage[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [sizeId, setSizeId] = useState('');
  const [material, setMaterial] = useState('');
  const [condition, setCondition] = useState('');
  const [careId, setCareId] = useState('');
  const [datePurchased, setDatePurchased] = useState('');
  const [colorIds, setColorIds] = useState<number[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [transactionType, setTransactionType] =
    useState<TransactionType>('sale');
  const [price, setPrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSessionError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
      router.replace('/login');
      return true;
    }

    return false;
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [me, data] = await Promise.all([
          authFetch<MeResponse>('/auth/me'),
          authFetch<CatalogsResponse>('/catalogs'),
        ]);

        if (!cancelled) {
          setRole(me.role);
          setCatalogs(data);
        }
      } catch (err) {
        if (!cancelled && !handleSessionError(err)) {
          setError('We could not load the form. Try again later.');
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
  const isStore = role === 'store';
  const accentText = isStore ? '#FFFFFF' : '#1A1A1A';
  const today = new Date().toISOString().slice(0, 10);

  const effectiveType: TransactionType = isStore ? 'sale' : transactionType;
  const needsPrice = effectiveType !== 'trade';
  const priceNumber = Number(price);
  const priceValid =
    !needsPrice || (price !== '' && priceNumber >= 1 && priceNumber <= 10000);

  const canSubmit =
    !submitting &&
    images.length > 0 &&
    name.trim() !== '' &&
    description.trim() !== '' &&
    categoryId !== '' &&
    brandId !== '' &&
    sizeId !== '' &&
    material !== '' &&
    datePurchased !== '' &&
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
      const urls = await uploadImages(images.map((image) => image.file));

      await authFetch(isStore ? '/garments/store' : '/garments', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          categoryId: Number(categoryId),
          brandId: Number(brandId),
          sizeId: Number(sizeId),
          material,
          datePurchased,
          colorIds,
          tagIds,
          ...(condition ? { condition } : {}),
          ...(careId ? { careId: Number(careId) } : {}),
          ...(needsPrice ? { price: priceNumber } : {}),
          ...(isStore ? {} : { transactionType: effectiveType }),
          images: urls.map((url) => ({ url })),
        }),
      });

      router.push('/create-garment/sent');
    } catch (err) {
      if (handleSessionError(err)) {
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : 'We could not add your garment. Try again.',
      );
      setSubmitting(false);
    }
  }

  function chipStyle(active: boolean) {
    return active
      ? { backgroundColor: accent, borderColor: accent, color: accentText }
      : { borderColor: '#6C6C6C', color: '#F5F5F5' };
  }

  return (
    <main className="min-h-screen bg-[#191919] pb-[120px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-14">
        <header className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#303030] text-[20px]"
          >
            ‹
          </button>

          <h1 className="text-[22px] font-medium">List a garment</h1>
        </header>

        {/* Fotos */}
        <section className="mt-8">
          <Label>Photos (the first one is the cover)</Label>
          <ImagePicker images={images} onChange={setImages} accent={accent} />
        </section>

        {/* Nombre */}
        <section className="mt-8">
          <Label>Name</Label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 120))}
            placeholder="e.g. True Religion Jeans"
            className={FIELD}
          />
        </section>

        {/* Descripción */}
        <section className="mt-8">
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value.slice(0, MAX_DESCRIPTION))
            }
            rows={4}
            placeholder="Tell us about this garment..."
            className="w-full resize-none rounded-[18px] border border-[#6C6C6C] bg-transparent p-4 text-[14px] text-white outline-none placeholder:text-[#8A8A8A]"
          />
          <p className="mt-1 text-right text-[12px] text-[#8A8A8A]">
            {description.length}/{MAX_DESCRIPTION}
          </p>
        </section>

        {/* Categoría y marca */}
        <section className="mt-8">
          <Label>Category</Label>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={FIELD}
          >
            <option value="">Select a category</option>
            {catalogs.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </section>

        <section className="mt-8">
          <Label>Brand</Label>
          <select
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
            className={FIELD}
          >
            <option value="">Select a brand</option>
            {catalogs.brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </section>

        {/* Talla y material */}
        <section className="mt-8">
          <Label>Size</Label>
          <select
            value={sizeId}
            onChange={(event) => setSizeId(event.target.value)}
            className={FIELD}
          >
            <option value="">Select a size</option>
            {catalogs.sizes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.type} · {item.label}
              </option>
            ))}
          </select>
        </section>

        <section className="mt-8">
          <Label>Material</Label>
          <select
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            className={FIELD}
          >
            <option value="">Select a material</option>
            {MATERIALS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        {/* Colores */}
        <section className="mt-8">
          <Label>Colors (pick at least one)</Label>
          <div className="flex flex-wrap gap-2">
            {catalogs.colors.map((color) => {
              const active = colorIds.includes(color.id);

              return (
                <button
                  key={color.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(colorIds, color.id, setColorIds)}
                  className="flex h-[36px] items-center gap-2 rounded-full border px-3 text-[13px]"
                  style={chipStyle(active)}
                >
                  <span
                    className="h-[14px] w-[14px] rounded-full border border-white/40"
                    style={{ backgroundColor: color.hexcode }}
                  />
                  {color.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Etiquetas */}
        <section className="mt-8">
          <Label>Tags (pick at least one)</Label>
          <div className="flex flex-wrap gap-2">
            {catalogs.tags.map((tag) => {
              const active = tagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(tagIds, tag.id, setTagIds)}
                  className="h-[36px] rounded-full border px-4 text-[13px]"
                  style={chipStyle(active)}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Fecha de compra */}
        <section className="mt-8">
          <Label>Date purchased</Label>
          <input
            type="date"
            value={datePurchased}
            max={today}
            onChange={(event) => setDatePurchased(event.target.value)}
            className={FIELD}
          />
        </section>

        {/* Condición (opcional) */}
        <section className="mt-8">
          <Label>Condition (optional)</Label>
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className={FIELD}
          >
            <option value="">Select a condition</option>
            {CONDITIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        {/* Cuidado (opcional) */}
        <section className="mt-8">
          <Label>Care instructions (optional)</Label>
          <select
            value={careId}
            onChange={(event) => setCareId(event.target.value)}
            className={FIELD}
          >
            <option value="">Select care instructions</option>
            {catalogs.careDetails.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </section>

        {/* Tipo de transacción: solo user (la tienda siempre vende) */}
        {!isStore && (
          <section className="mt-8">
            <Label>I want to</Label>
            <div className="flex flex-wrap gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTransactionType(type.value)}
                  className="h-[40px] rounded-full border px-5 text-[14px] font-medium"
                  style={chipStyle(transactionType === type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Precio */}
        {needsPrice && (
          <section className="mt-8">
            <Label>Price (USD, 1 - 10000)</Label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={10000}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0"
              className={FIELD}
            />
          </section>
        )}

        {error && (
          <p className="mt-4 text-[13px] text-[#FB3F0F]" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-8 h-[51px] w-full rounded-full text-[15px] font-medium disabled:opacity-40"
          style={{ backgroundColor: accent, color: accentText }}
        >
          {submitting ? 'Adding...' : 'Add garment'}
        </button>
      </div>
    </main>
  );
}