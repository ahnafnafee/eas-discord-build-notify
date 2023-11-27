import bodyParser from "body-parser";
import crypto from "crypto";
import { EmbedBuilder } from "discord.js";
import express, { Request, Response } from "express";
import safeCompare from "safe-compare";
import { channel, clientReadyPromise } from "./discord";
import { BuildPayload, SubmitPayload } from "./types";
import { BuildEmbed as DiscordEmbedBuilder, validatedEnv } from "./utils";

// Express Setup
const app = express();
app.use(bodyParser.text({ type: "*/*" }));

app.post("/webhook", async (req: Request, res: Response) => {
    await clientReadyPromise;

    const expoSignature = req.headers["expo-signature"] as string;
    const hmac = crypto.createHmac("sha1", validatedEnv.EAS_SECRET_WEBHOOK_KEY);

    try {
        if (!req.body) {
            throw new Error("Payload body is empty");
        }

        hmac.update(req.body);
        const hash = `sha1=${hmac.digest("hex")}`;

        if (!safeCompare(expoSignature, hash)) {
            res.status(401).send("Signatures didn't match");
            return;
        }

        const payload = JSON.parse(req.body) as SubmitPayload | BuildPayload;

        const isBuild = "priority" in payload;
        const type = isBuild ? "Build" : "Submission";

        const discordEmbedBuilder = new DiscordEmbedBuilder(
            isBuild,
            type,
            payload
        );

        let embed = new EmbedBuilder();

        switch (payload.status) {
            case "canceled": {
                embed = discordEmbedBuilder.embedCancelled();
                break;
            }
            case "errored": {
                embed = discordEmbedBuilder.embedErrored();
                break;
            }
            case "finished": {
                embed = await discordEmbedBuilder.embedFinished();
                break;
            }
        }

        channel.send({ embeds: [embed], files: discordEmbedBuilder.files });

        res.send("Webhook processed successfully");
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).send("Server Error");
    }
});

export default app;
