import { create } from "zustand";

interface StoreState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentPage: "home",
  setCurrentPage: (page: string) => set({ currentPage: page }),
}));
