export interface User {
  id: string;
  name: string;
  avatar_url: string;
  color: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  frame_focused: boolean;
}
