import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
    service: "eas-discord-webhook",
    frameworkVersion: "3",
    org: "ahnafnafee",
    app: "eas-discord-webhook",
    console: true,
    useDotenv: true,
    plugins: [
        "serverless-esbuild",
        "serverless-offline",
        "serverless-dotenv-plugin",
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
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: ["lambda:InvokeFunction"],
                Resource: ["*"],
            },
        ],
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
            exclude: ["aws-sdk"], // AWS SDK is not needed since it's available in the AWS environment
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
                architecture: "arm64",
            },
            enabled: true,
            events: [
                {
                    schedule: "rate(5 minutes)",
                },
            ],
            prewarm: true,
            concurrency: 1,
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
        "eas-build-webhook": {
            handler: "handler.handler",
            events: [
                {
                    http: "ANY /",
                },
                {
                    http: "ANY /{proxy+}",
                },
            ],
        },
    },
};

module.exports = serverlessConfiguration;
