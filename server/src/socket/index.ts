import WebSocket from "ws";
import { ClientEvent, ServerEvent } from "../types/event";
import { User } from "../types/user";
import { Instance, getInstance } from "./instance";
import env from "../common/env";
import { getColorFromURL } from "color-thief-node";

export function handleConnection(socket: WebSocket) {
  let instance: Instance | null = null;
  let user: User | null = null;

  console.log("New connection");

  socket.on("message", async (data) => {
    const e: ClientEvent = JSON.parse(data.toString());

    switch (e.type) {
      case "token_exchange":
        await exchangeToken(socket, e.code);
        break;
      case "authenticate":
        user = await getUser(e.access_token);

        instance = await getInstance(e.instance_id);
        instance.addUser(user, socket);
        break;
      default:
        if (user && instance) {
          instance.handleClientEvent(user.id, e);
        }
    }
  });

  socket.on("close", () => {
    if (user) {
      instance?.removeUser(user.id);
    }
  });
}

async function exchangeToken(socket: WebSocket, code: string) {
  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
    }),
  }).then((res) => {
    if (res.status !== 200) {
      res.text().then(console.error);
      throw new Error("Invalid code");
    }
    return res.json();
  });

  await socket.send(
    JSON.stringify({
      type: "token_exchanged",
      access_token: res.access_token,
    } satisfies ServerEvent)
  );
}

async function getUser(accessToken: string): Promise<User> {
  const disUser = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => {
    if (res.status !== 200) {
      throw new Error("Invalid access token");
    }
    return res.json();
  });

  const avatarUrl = disUser.avatar
    ? `https://cdn.discordapp.com/avatars/${disUser.id}/${disUser.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${Number(disUser.id) % 6}.png`;

  const rgbColor = await getColorFromURL(avatarUrl);

  return {
    id: disUser.id,
    name: disUser.global_name || `${disUser.username}#${disUser.discriminator}`,
    avatar_url: disUser.avatar
      ? `https://cdn.discordapp.com/avatars/${disUser.id}/${disUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${
          Number(disUser.id) % 6
        }.png`,
    color: rgbToHex(...rgbColor),
  };
}

const rgbToHex = (r: number, g: number, b: number) =>
  "#" +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
