import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    DISCORD_BOT_TOKEN: z.string(),
    DISCORD_CHANNEL_ID: z.string(),
    EAS_SECRET_WEBHOOK_KEY: z.string().optional(),
    EXPO_DEFAULT_TEAM_NAME: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let validatedEnv: Env;

try {
    // This assumes that `process.env` contains all necessary variables.
    // You might need to load them with dotenv-flow or similar before validation.
    validatedEnv = envSchema.parse(process.env);
} catch (e) {
    console.error("Invalid environment configuration", e);
    process.exit(1); // Exit the process with an error code
}

export default validatedEnv;
