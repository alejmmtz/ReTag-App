import { authFetch } from "../../lib/authInfo";
import type { PostImage, PostType } from "./post-types";

type ImageSource = { url: string; isCover?: boolean };
type LinkedGarment = { id: string; images?: ImageSource[] };
type ImagePost = {
  postType: PostType;
  images: PostImage[];
  garment?: { id: string } | null;
};

const pendingGarments = new Map<string, Promise<PostImage[]>>();

// The first URL is the cover in the create-post API. Reuse existing files.
export function garmentPostImageUrls(
  images: readonly ImageSource[] = [],
): string[] {
  const ordered = [...images].sort(
    (a, b) => Number(!!b.isCover) - Number(!!a.isCover),
  );
  return [
    ...new Set(ordered.map((image) => image.url.trim()).filter(Boolean)),
  ].slice(0, 10);
}

function loadGarmentImages(id: string): Promise<PostImage[]> {
  const existing = pendingGarments.get(id);
  if (existing) return existing;

  const request = authFetch<{ images: PostImage[] }>(
    `/garments/${encodeURIComponent(id)}`,
  )
    .then((garment) => garment.images ?? [])
    .finally(() => pendingGarments.delete(id));
  pendingGarments.set(id, request);
  return request;
}

export async function offerImageUrls(
  garment: LinkedGarment,
): Promise<string[]> {
  let urls = garmentPostImageUrls(garment.images);
  if (!urls.length)
    urls = garmentPostImageUrls(await loadGarmentImages(garment.id));
  if (!urls.length) {
    throw new Error("Add a photo to this garment before posting an offer.");
  }
  return urls;
}

// Older offers may have only garmentId saved. Recover their media for display
// without changing the post or overwriting photos explicitly attached to it.
export async function withOfferImages<T extends ImagePost>(
  post: T,
): Promise<T> {
  if (post.postType !== "offer" || post.images.length || !post.garment)
    return post;

  try {
    const images = await loadGarmentImages(post.garment.id);
    const urls = garmentPostImageUrls(images);
    return {
      ...post,
      images: urls.map((url, index) => ({
        ...images.find((image) => image.url.trim() === url)!,
        url,
        isCover: index === 0,
      })),
    };
  } catch {
    // A missing/deleted garment must not prevent the rest of the feed loading.
    return post;
  }
}

export function withOfferImagesForPosts<T extends ImagePost>(
  posts: T[],
): Promise<T[]> {
  return Promise.all(posts.map(withOfferImages));
}
