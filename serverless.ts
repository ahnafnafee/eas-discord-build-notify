import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
    service: "eas-discord-webhook",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-esbuild",
        "serverless-offline",
        "serverless-dotenv-plugin",
        "serverless-better-credentials",
        "serverless-plugin-warmup",
        "serverless-plugin-optimize",
    ],
    provider: {
        name: "aws",
        architecture: "arm64",
        runtime: "nodejs16.x",
        region: "us-east-1",
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
        },

        iam: {
            role: {
                statements: [
                    {
                        Effect: "Allow",
                        Action: ["lambda:InvokeFunction"],
                        Resource: ["*"],
                    },
                ],
            },
        },
    },
    custom: {
        webpack: {
            webpackConfig: "webpack.config.js",
            packager: "pnpm",
        },
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            target: "node16",
            exclude: ["aws-sdk", "@aws-sdk/client-lambda"],
            define: { "require.resolve": undefined },
            platform: "node",
            concurrency: 10,
        },
        "serverless-offline": {
            httpPort: 33031,
        },
        warmup: {
            default: {
                enabled: true,
                role: "IamRoleLambdaExecution",
                verbose: false, // Disable the logs
                logRetentionInDays: 7,
                events: [
                    {
                        schedule: "rate(5 minutes)",
                    },
                ],
                cleanFolder: false,
                architecture: "arm64",
                prewarm: true,
            },
        },
    },
    package: {
        individually: true,
        patterns: [
            "!.git/**",
            "!.gh-assets/**",
            "!README.md",
            "!assets/**",
            "!.github/**",
        ],
    },
    functions: {
        easBuildWebhook: {
            handler: "handler.handler",
            events: [
                { http: { path: "/", method: "any", cors: true } },
                { http: { path: "/{proxy+}", method: "any", cors: true } },
            ],
        },
    },
};

module.exports = serverlessConfiguration;
