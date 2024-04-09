import { create } from "zustand";

interface FrameState {
  currentFrame: string | null;

  reset: () => void;
  setCurrentFrame: (frame: string) => void;
}

export const useFrameState = create<FrameState>()((set) => ({
  currentFrame: null,

  reset: () => set({ currentFrame: null }),
  setCurrentFrame: (frame: string | null) => set({ currentFrame: frame }),
}));
