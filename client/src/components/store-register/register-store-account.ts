import { API_URL } from "../../lib/api";
import { authFetch } from "../../lib/authInfo";
import { uploadImage } from "../../lib/uploads";
import type { AccountFields } from "../register/types";
import {
  normalizeStore,
  type StoreFields,
} from "./store-fields";

type RegisterStoreResult = {
  user: {
    id: string;
    email: string;
  };
  store: {
    id: string;
    storeName: string;
  };
};

async function readError(
  response: Response,
  fallback: string,
) {
  const body = await response.json().catch(() => null);

  return Array.isArray(body?.message)
    ? body.message.join(", ")
    : (body?.message ?? fallback);
}

export async function registerStoreAccount(
  account: AccountFields,
  storeFields: StoreFields,
  profileFile: File | null,
  coverFile: File | null,
) {
  const store = normalizeStore(storeFields);

  //Crear cuenta STORE + StoreEntity
  const registrationResponse = await fetch(
    `${API_URL}/auth/register/store`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...account,
        username: account.username.replace(/^@/, ""),
        ...store,
      }),
    },
  );

  if (!registrationResponse.ok) {
    throw new Error(
      await readError(
        registrationResponse,
        "We couldn't create your store account.",
      ),
    );
  }

  const registration: RegisterStoreResult =
    await registrationResponse.json();

  //Login automático
  const loginResponse = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: account.email,
        password: account.password,
      }),
    },
  );

  if (!loginResponse.ok) {
    throw new Error(
      "Your account was created, but we couldn't log you in.",
    );
  }

  const loginData = await loginResponse.json();
  const token = loginData?.access_token;

  if (typeof token !== "string" || !token) {
    throw new Error(
      "Your account was created, but the login response was invalid.",
    );
  }

  localStorage.setItem("access_token", token);

  //Subir imágenes después de tener JWT
  const images = [];

  if (coverFile) {
    const coverUrl = await uploadImage(
      coverFile,
      "Users",
    );

    images.push({
      url: coverUrl,
      isCover: true,
      isProfile: false,
    });
  }

  if (profileFile) {
    const profileUrl = await uploadImage(
      profileFile,
      "Users",
    );

    images.push({
      url: profileUrl,
      isCover: false,
      isProfile: true,
    });
  }

  //Actualizar Store con imágenes
  if (images.length > 0) {
    await authFetch(
      `/stores/${registration.store.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          storeName: store.storeName,
          location: store.location,
          socialmedia: store.socialmedia,
          schedule: store.schedule,
          description: store.description,
          images,
        }),
      },
    );
  }

  return registration;
}