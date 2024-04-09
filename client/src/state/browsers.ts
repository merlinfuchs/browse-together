import { create } from "zustand";
import { Tab } from "../../../server/src/types/tab";

interface BrowserStateStore {
  url: string | null;
  favicon: string | null;

  reset(): void;
  setUrl(url: string | null): void;
  setFavicon(favicon: string | null): void;
}

const initialState = {
  url: null,
  favicon: null,
};

export const useBrowserState = create<BrowserStateStore>()((set) => ({
  ...initialState,

  reset: () => set(initialState),
  setUrl: (url) => set({ url }),
  setFavicon: (favicon) => set({ favicon }),
}));
