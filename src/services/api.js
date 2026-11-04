import { getToken, clearSession } from "@/lib/session";

export async function api(endpoint, options = {}) {
  const {
    skipAuthRedirect = false,
    ...fetchOptions
  } = options;

  const token = getToken()  ;

  const headers = {
    ...(fetchOptions.body && {
      "Content-Type": "application/json",
    }),
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && !skipAuthRedirect) {
    clearSession();

    window.location.href = "/login";

    throw new Error("Session expired");
  }

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}