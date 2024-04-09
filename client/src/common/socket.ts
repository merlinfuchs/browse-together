import env from "./env";
import { ClientEvent, ServerEvent } from "../../../server/src/types/event";
import { useUserState } from "../state/users";
import { sdk } from "./sdk";
import { useFrameState } from "../state/frame";
import { cacheAccessToken, startAuth } from "./auth";
import { useBrowserState } from "../state/browsers";

let socket: WebSocket | null = null;
let openPromise: Promise<void> | null = null;

export function createConnection() {
  console.log("connect");
  if (socket) {
    // Close the existing socket before creating a new one
    // "onclose" below will connect a new socket
    socket.close();
    return;
  }

  socket = new WebSocket(env.VITE_WS_URL);

  openPromise = new Promise((resolve) => {
    if (!socket) return;

    socket.onopen = () => {
      resolve();
      startAuth();
    };
  });

  socket.onmessage = (msg) => {
    if (msg.data instanceof Blob) {
      const dataUrl = URL.createObjectURL(msg.data);
      useFrameState.getState().setCurrentFrame(dataUrl);
      return;
    }

    const e: ServerEvent = JSON.parse(msg.data.toString());

    switch (e.type) {
      case "token_exchanged":
        sdk.commands.authenticate({ access_token: e.access_token });
        emitEvent({
          type: "authenticate",
          access_token: e.access_token,
          instance_id: sdk.instanceId,
        });
        cacheAccessToken(e.access_token);
        break;
      case "ready":
        useUserState.getState().setMe(e.me);
        useUserState.getState().setUsers(e.users);
        useUserState.getState().setCursorPositions(e.cursors);
        useBrowserState.getState().setUrl(e.url);
        useBrowserState.getState().setFavicon(e.favicon);
        break;

      case "url_updated":
        useBrowserState.getState().setUrl(e.url);
        useBrowserState.getState().setFavicon(e.favicon);
        break;

      case "user_joined":
        useUserState.getState().setUser(e.user);
        break;
      case "user_left":
        useUserState.getState().removeUser(e.user_id);
        break;

      case "cursor_moved":
        useUserState.getState().setCursorPosition(e.user_id, e.position);
        break;

      default:
        console.error("Unknown event type:", e);
    }
  };

  socket.onclose = () => {
    socket = null;
    useBrowserState.getState().reset();
    useUserState.getState().reset();
    useFrameState.getState().reset();

    createConnection();
  };
}

export async function emitEvent(e: ClientEvent) {
  if (!socket) {
    throw new Error("Socket is not connected");
  }

  if (openPromise) {
    await openPromise;
  }

  socket.send(JSON.stringify(e));
}
