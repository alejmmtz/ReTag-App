import { authFetch } from "./authInfo";

export type UploadBucket = "Posts" | "Events" | "Users" | "Garments";

export async function uploadImage(
  file: File,
  bucket: UploadBucket,
): Promise<string> {
  const signed = await authFetch<{
    uploadUrl: string;
    headers: Record<string, string>;
    url: string;
  }>("/uploads", {
    method: "POST",
    body: JSON.stringify({
      bucket,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  const response = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: signed.headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Image upload failed. Please try again.");
  }

  return signed.url;
}

export async function uploadImages(
  files: File[],
  bucket: UploadBucket,
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    urls.push(await uploadImage(file, bucket));
  }

  return urls;
}
