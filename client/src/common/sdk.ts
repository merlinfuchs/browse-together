import { DiscordSDK } from "@discord/embedded-app-sdk";
import env from "./env";

export const sdk = new DiscordSDK(env.VITE_DISCORD_CLIENT_ID);
