import { CursorPosition, User } from "./user";
import { Tab } from "./tab";

// Authentication flow:
// -> token_exchange
// <- token_exchanged
// -> authenticate
// <- ready
// ...

export type ServerEvent =
  | {
      type: "token_exchanged";
      access_token: string;
    }
  | {
      type: "ready";
      me: User;
      url: string;
      favicon: string | null;
      users: Record<string, User>;
      cursors: Record<string, CursorPosition>;
    }
  | {
      type: "url_updated";
      url: string;
      favicon: string;
    }
  | {
      type: "user_joined";
      user: User;
    }
  | {
      type: "user_left";
      user_id: string;
    }
  | {
      type: "cursor_moved";
      user_id: string;
      position: CursorPosition;
    }
  | {
      type: "cursor_clicked";
      user_id: string;
    };

export type ClientEvent =
  | {
      type: "token_exchange";
      code: string;
    }
  | {
      type: "authenticate";
      access_token: string;
      instance_id: string;
    }
  | {
      type: "navigate";
      url: string;
    }
  | {
      type: "navigate_back";
    }
  | {
      type: "navigate_forward";
    }
  | {
      type: "navigate_refresh";
    }
  | {
      type: "cursor_move";
      position: CursorPosition;
    }
  | {
      type: "cursor_click";
      x: number;
      y: number;
      button: "left" | "right";
    }
  | {
      type: "scroll_update";
      delta_x: number;
      delta_y: number;
    }
  | {
      type: "key_down";
      key: string;
    }
  | {
      type: "key_up";
      key: string;
    };
