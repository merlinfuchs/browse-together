import { Browser, createBrowser } from "../browser";
import WebSocket from "ws";
import { ClientEvent, ServerEvent } from "../types/event";
import { CursorPosition, User } from "../types/user";

export class Instance {
  id: string;
  browser: Browser;
  users: Record<string, User>;
  cursors: Record<string, CursorPosition>;
  sockets: Record<string, WebSocket>;

  previousFrame: Buffer | null = null;
  frameInterval: NodeJS.Timeout | null = null;

  constructor(id: string, browser: Browser) {
    this.id = id;
    this.browser = browser;
    this.users = {};
    this.cursors = {};
    this.sockets = {};

    this.frameInterval = setInterval(async () => {
      const frame = await this.browser.getCurrentFrame();
      if (this.previousFrame && frame.equals(this.previousFrame)) {
        return;
      }
      this.previousFrame = frame;
      this.emitFrame(frame);
    }, 100);

    this.browser.page.on("framenavigated", async () => {
      await this.emitEvent({
        type: "url_updated",
        url: this.browser.getUrl(),
        favicon: await this.browser.getFaviconUrl(),
      });
    });
  }

  async addUser(user: User, socket: WebSocket) {
    this.users[user.id] = user;
    this.sockets[user.id] = socket;
    this.cursors[user.id] = { x: 0, y: 0, frame_focused: false };

    await this.emitEvent(
      {
        type: "ready",
        url: this.browser.getUrl(),
        favicon: await this.browser.getFaviconUrl(),
        me: user,
        users: this.users,
        cursors: this.cursors,
      },
      user.id
    );
    this.emitEvent({
      type: "user_joined",
      user,
    });
    this.emitEvent({
      type: "cursor_moved",
      user_id: user.id,
      position: this.cursors[user.id],
    });

    this.previousFrame = null;
  }

  async removeUser(id: string) {
    delete this.users[id];
    await this.emitEvent({
      type: "user_left",
      user_id: id,
    });
  }

  handleClientEvent(userId: string, e: ClientEvent) {
    switch (e.type) {
      case "navigate":
        this.browser.goto(e.url);
        break;
      case "navigate_back":
        this.browser.goBack();
        break;
      case "navigate_forward":
        this.browser.goForward();
        break;
      case "navigate_refresh":
        this.browser.refresh();
        break;
      case "cursor_move":
        this.cursors[userId] = e.position;
        this.emitEvent({
          type: "cursor_moved",
          user_id: userId,
          position: e.position,
        });
        break;
      case "cursor_click":
        this.emitEvent({
          type: "cursor_clicked",
          user_id: userId,
        });
        this.browser.click(e.x, e.y, e.button);
        break;
      case "scroll_update":
        this.browser.scroll(e.delta_x, e.delta_y);
        break;
      case "key_down":
        this.browser.keyDown(e.key);
        break;
      case "key_up":
        this.browser.keyUp(e.key);
        break;
      default:
        console.error("Unknown event type:", e);
    }
  }

  async emitEvent(e: ServerEvent, user_id?: string) {
    if (user_id) {
      const socket = this.sockets[user_id];
      if (socket) {
        await socket.send(JSON.stringify(e));
      }
      return;
    }

    const promises = Object.values(this.sockets).map((socket) =>
      socket.send(JSON.stringify(e))
    );
    await Promise.all(promises);
  }

  async emitFrame(frame: Buffer) {
    const promises = Object.values(this.sockets).map((socket) =>
      socket.send(frame)
    );
    await Promise.all(promises);
  }

  async close() {
    clearInterval(this.frameInterval!);
    await this.browser.close();
  }
}

const instances: Record<string, Instance> = {};

export async function getInstance(id: string) {
  const browser = await createBrowser();

  if (!instances[id]) {
    instances[id] = new Instance(id, browser);
  }

  return instances[id];
}
