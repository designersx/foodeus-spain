// src/stores/authStore.ts
import { create } from "zustand";
import jwtDecode from "jwt-decode";
import decodeToken from "@/lib/decode-token";

interface DecodedToken {
  role_id: number;
  exp: number;            // optional – if you want to track expiry
}

type Role = 1 | 2 | 3 | null; // 1=superadmin, 2=admin, 3=fieldUser

interface AuthState {
  token: string | null;
  roleId: Role;
  setToken: (token: string) => void;
  clearAuth: () => void;

  /* convenience getters */
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isFieldUser: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  roleId: null,

  // ─── setters ────────────────────────────────────────────────
  setToken: (token: string) => {
    /* persist token */
    localStorage.setItem("token", token);

    /* decode role_id (fallback to server field if you prefer) */
    let role: Role = null;
    try {
      const decoded: DecodedToken | null = token ? (decodeToken(token) as DecodedToken) : null;
    //   const decoded = jwtDecode<DecodedToken>(token);
      role = decoded.role_id as Role;
    } catch (err) {
      console.error("Failed to decode token:", err);
    }

    set({ token, roleId: role });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    set({ token: null, roleId: null });
  },

  // ─── getters / permission helpers ───────────────────────────
  isSuperAdmin: () => get().roleId === 1,
  isAdmin: () => get().roleId === 2,
  isFieldUser: () => get().roleId === 3,
}));

/* Hydrate on app start */
const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
if (savedToken) useAuthStore.getState().setToken(savedToken);
