const TOKEN_KEY = "pm_admin_token";
const USER_KEY = "pm_admin_user";

export function saveSession(token, user) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  if (typeof window === "undefined") return null;

  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;

  const user = sessionStorage.getItem(USER_KEY);

  if (!user) return null;

  return JSON.parse(user);
}

export function clearSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function hasSession() {
  return !!getToken();
}