import { api } from "./api";
import { saveSession, clearSession } from "@/lib/session";

export async function login(email, password) {
const data = await api("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
  }),
  skipAuthRedirect: true,
}); 

  saveSession(data.token, data.user);

  return data.user;
}

export function logout() {
  clearSession();
}