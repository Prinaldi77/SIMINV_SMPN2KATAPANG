const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface AuthUser {
    id: number;
    name: string;
    username: string;
    nip: string |null;
    email: string;
    role: "admin" | "guru" | "kepsek";
    jabatan: string;
    no_telp: string | null;
}

const TOKEN_KEY = "siminv_token";
const USER_KEY = "siminv_user";

export function saveAuth(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try{
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }
  if (!res.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server.");
  }
  return data as T;
}
export async function logoutUser() {
  try {
    await apiFetch("/logout", { method: "POST" });
  } catch {
    // Abaikan jika token sudah expired
  } finally {
    clearAuth();
    window.location.href = "/login";
  }
}