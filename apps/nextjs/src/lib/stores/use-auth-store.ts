import { create } from "zustand";
import { type User } from "@deudamigo/ts-rest";

export type AuthStore = {
  status: "authenticated" | "loading" | "unauthenticated";
  user: User | null;
  clear: () => void;
  set: (
    newData: AuthStore | Partial<AuthStore> | ((state: AuthStore) => AuthStore | Partial<AuthStore>)
  ) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: "loading",
  clear: () => {
    set({ user: null, status: "unauthenticated" });
  },
  set: (newData) => {
    set(newData);
  },
}));
