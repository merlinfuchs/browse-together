import env from "./env";
import { sdk } from "./sdk";
import { emitEvent } from "./socket";

let accessToken: string | null = null;

export async function startAuth() {
  await sdk.ready();

  if (accessToken) {
    emitEvent({
      type: "authenticate",
      access_token: accessToken,
      instance_id: sdk.instanceId,
    });
    return;
  }

  accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    try {
      await sdk.commands.authenticate({ access_token: accessToken });
      emitEvent({
        type: "authenticate",
        access_token: accessToken,
        instance_id: sdk.instanceId,
      });
      return;
    } catch (e) {
      console.error(e);
    }
  }

  const { code } = await sdk.commands.authorize({
    client_id: env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    // prompt: "none",
    scope: ["identify"],
  });

  emitEvent({
    type: "token_exchange",
    code,
  });
}

export function cacheAccessToken(token: string) {
  accessToken = token;
  localStorage.setItem("access_token", token);
}
