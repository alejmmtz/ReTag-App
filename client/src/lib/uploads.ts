import { authFetch } from './http';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const result = await authFetch<{ url: string }>('/uploads', {
    method: 'POST',
    body: formData,
  });

  return result.url;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    urls.push(await uploadImage(file));
  }

  return urls;
}