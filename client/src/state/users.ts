import { create } from "zustand";
import { CursorPosition, User } from "../../../server/src/types/user";

interface UserStateStore {
  me: User | null;
  users: Record<string, User>;
  cursors: Record<string, CursorPosition>;

  reset(): void;
  setMe(user: User): void;
  setUser: (user: User) => void;
  setUsers: (users: Record<string, User>) => void;
  removeUser: (id: string) => void;
  setCursorPosition: (user_id: string, cursor: CursorPosition) => void;
  setCursorPositions: (cursors: Record<string, CursorPosition>) => void;
}

const initialState = {
  me: null,
  users: {},
  cursors: {},
};

export const useUserState = create<UserStateStore>()((set) => ({
  ...initialState,

  reset: () => set(initialState),
  setMe: (me) => set({ me }),
  setUser: (user) =>
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    })),
  setUsers: (users) => set({ users }),
  removeUser: (id) =>
    set((state) => {
      const { [id]: _, ...users } = state.users;
      const { [id]: __, ...cursors } = state.cursors;
      return { users, cursors };
    }),
  setCursorPosition: (user_id, cursor) =>
    set((state) => ({
      cursors: { ...state.cursors, [user_id]: cursor },
    })),
  setCursorPositions: (cursors) => set({ cursors }),
}));
