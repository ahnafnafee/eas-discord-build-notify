import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { validatedEnv } from "../utils";

export const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

export let channel;

export const clientReadyPromise = new Promise<void>((resolve) => {
    client.once("ready", async () => {
        console.log("Discord client is ready!");
        channel = (await client.channels.fetch(
            validatedEnv.DISCORD_CHANNEL_ID
        )) as TextChannel;
        resolve();
    });
});

client.login(validatedEnv.DISCORD_BOT_TOKEN);
