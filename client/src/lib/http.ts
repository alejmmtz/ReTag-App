import { API_URL } from './api';

// Error que se lanza cuando la API responde con un estado distinto.
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem('access_token');
  } catch {
    // localStorage puede estar bloqueado (modo privado)en ese caso, no hay nada que borrar.
  }
}

// Llama a la API con el token de sesión y devuelve el JSON analizado.
// Lanza un ApiError para que cada pantalla pueda reaccionar ante un 401 (sesión caducada).
export async function authFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new ApiError('No active session was found.', 401);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (init.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string>) },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? 'Something went wrong.');

    throw new ApiError(message, response.status);
  }

  return data as T;
}
