import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.number().default(8080),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
});

export default envSchema.parse(process.env);
