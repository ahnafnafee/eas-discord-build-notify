import { AttachmentBuilder, Colors, EmbedBuilder } from "discord.js";
import QRCode from "qrcode";
import { PassThrough } from "stream";
import { BuildPayload, SubmitPayload } from "../types";
import properCase from "./proper-case";

class BuildEmbed {
    isBuild: boolean;
    type: string;
    payload: SubmitPayload | BuildPayload;
    files: AttachmentBuilder[] = [];

    constructor(
        isBuild: boolean,
        type: string,
        payload: SubmitPayload | BuildPayload
    ) {
        this.isBuild = isBuild;
        this.type = type;
        this.payload = payload;
    }

    initEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${this.payload.accountName}`,
                iconURL: "https://github.com/expo.png",
                url: `https://expo.dev/accounts/${this.payload.accountName}`,
            })
            .setThumbnail("https://github.com/expo.png")
            .setTimestamp()
            .setFooter({
                text: "EAS Build",
                iconURL: "https://github.com/expo.png",
            });

        return embed;
    }

    embedCancelled(): EmbedBuilder {
        const embed = this.initEmbed();
        embed
            .setTitle(
                `🛑 ${this.type} Canceled - ${properCase(
                    this.payload.projectName
                )}`
            )
            .setColor(Colors.Greyple);

        if (this.isBuild) {
            const buildPayload = this.payload as BuildPayload;
            embed
                .setDescription(
                    "The build was canceled. Please check the logs for more information."
                )
                .setURL(buildPayload.buildDetailsPageUrl || "");
        } else {
            const submissionPayload = this.payload as SubmitPayload;
            embed
                .setDescription(
                    "The submission was canceled. Please check the logs for more information."
                )
                .setURL(submissionPayload.submissionDetailsPageUrl || "");
        }

        return embed;
    }

    embedErrored(): EmbedBuilder {
        const embed = this.initEmbed();
        embed
            .setTitle(
                `⛔ ${this.type} Failure - ${properCase(
                    this.payload.projectName
                )}`
            )
            .setColor(Colors.Red);

        if (this.isBuild) {
            const buildPayload = this.payload as BuildPayload;
            embed
                .setDescription(
                    "An error occurred during the build process. Please check the logs for more information."
                )
                .addFields(
                    {
                        name: "Error",
                        value: buildPayload.error?.message || "Unknown error",
                        inline: true,
                    },
                    {
                        name: "Profile",
                        value:
                            buildPayload.metadata.buildProfile ||
                            "Unknown profile",
                        inline: true,
                    },
                    {
                        name: "Code",
                        value: buildPayload.error?.errorCode || "Unknown code",
                        inline: true,
                    }
                )
                .setURL(buildPayload.buildDetailsPageUrl || "");
        } else {
            const submissionPayload = this.payload as SubmitPayload;
            embed
                .setDescription(
                    "An error occurred during the submission process. Please check the logs for more information."
                )
                .addFields(
                    {
                        name: "Error",
                        value:
                            submissionPayload.submissionInfo?.error?.message ||
                            "Unknown error",
                        inline: true,
                    },
                    {
                        name: "\u200B",
                        value: "\u200B",
                        inline: true,
                    },
                    {
                        name: "Code",
                        value:
                            submissionPayload.submissionInfo?.error
                                ?.errorCode || "Unknown code",
                        inline: true,
                    }
                )
                .setURL(submissionPayload.submissionDetailsPageUrl || "");
        }

        return embed;
    }

    async embedFinished(): Promise<Promise<EmbedBuilder>> {
        const embed = this.initEmbed();
        embed
            .setTitle(
                `✅ ${this.type} Success - ${properCase(
                    this.payload.projectName
                )}`
            )
            .setColor(Colors.Green);

        if (this.isBuild) {
            const buildPayload = this.payload as BuildPayload;

            const qrStream = new PassThrough();
            switch (buildPayload.platform) {
                case "ios":
                    await QRCode.toFileStream(
                        qrStream,
                        `itms-services://?action=download-manifest;url=https://api.expo.dev/v2/projects/${buildPayload.appId}/builds/${buildPayload.id}/manifest.plist`,
                        {
                            type: "png",
                            width: 256,
                            errorCorrectionLevel: "H",
                        }
                    );
                    break;
                default:
                    await QRCode.toFileStream(
                        qrStream,
                        buildPayload.artifacts?.buildUrl,
                        {
                            type: "png",
                            width: 256,
                            errorCorrectionLevel: "H",
                        }
                    );
                    break;
            }

            const file = new AttachmentBuilder(qrStream).setName("qrCode.jpg");
            this.files.push(file);

            embed
                .setDescription(
                    `${
                        buildPayload.platform === "ios"
                            ? "Scan QR Code"
                            : `[Download](${buildPayload.artifacts?.buildUrl})`
                    } - [Details](${buildPayload.buildDetailsPageUrl})`
                )
                .addFields(
                    {
                        name: "Platform",
                        value: `${buildPayload.platform}`,
                        inline: true,
                    },
                    {
                        name: "Profile",
                        value:
                            buildPayload.metadata.buildProfile ||
                            "Unknown profile",
                        inline: true,
                    },
                    {
                        name: "App Version",
                        value:
                            `${buildPayload.metadata.appVersion}` +
                            ((buildPayload.metadata.appBuildVersion &&
                                ` (${buildPayload.metadata.appBuildVersion})`) ||
                                ""),
                        inline: true,
                    }
                )
                .setImage(`attachment://${file.name}`)
                .setURL(buildPayload.artifacts?.buildUrl || "");
        } else {
            const submissionPayload = this.payload as SubmitPayload;
            embed
                .setDescription(
                    `Submission Details: ${submissionPayload.submissionDetailsPageUrl}`
                )
                .addFields({
                    name: "Platform",
                    value: `${submissionPayload.platform}`,
                    inline: true,
                })
                .setURL(submissionPayload.submissionDetailsPageUrl);
        }

        return embed;
    }
}

export default BuildEmbed;
