import { z } from "zod";

const envSchema = z.object({
  VITE_WS_URL: z.string().default("ws://localhost:8080"),
  VITE_DISCORD_CLIENT_ID: z.string(),
});

export default envSchema.parse(import.meta.env);
