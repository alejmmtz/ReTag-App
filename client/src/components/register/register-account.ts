import { API_URL } from "../../lib/api";
import { uploadImage } from "../../lib/uploads";
import type { AccountFields } from "./types";

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  return Array.isArray(body?.message)
    ? body.message.join(", ")
    : (body?.message ?? fallback);
}

export async function registerAccount(fields: AccountFields, photo: File | null) {
  if (!API_URL) {
    throw new Error("We couldn't connect to the server. Please try again later.");
  }

  const username = fields.username.replace(/^@/, "");
  const registration = await fetch(`${API_URL}/auth/register/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...fields, username }),
  }).catch(() => null);

  if (!registration) {
    throw new Error("We couldn't connect to the server. Please try again.");
  }
  if (!registration.ok) {
    throw new Error(await readError(registration, "We couldn't create your account."));
  }

  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: fields.email, password: fields.password }),
  }).catch(() => null);

  const loginData = await loginResponse?.json().catch(() => null);
  const token = loginData?.access_token;
  if (!loginResponse?.ok || typeof token !== "string" || !token) {
    return { signedIn: false as const };
  }

  localStorage.setItem("access_token", token);

  if (photo) {
    const profilePicture = await uploadImage(photo, "Users");
    const profileResponse = await fetch(`${API_URL}/users/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profilePicture }),
    });
    if (!profileResponse.ok) {
      throw new Error("Your account was created, but we couldn't save the photo.");
    }
  }

  return { signedIn: true as const };
}
