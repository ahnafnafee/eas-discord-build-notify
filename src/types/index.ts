export type PayloadPlatform = "android" | "ios";
export type PayloadStatus = "finished" | "errored" | "canceled";

export type Payload = {
    id: string;
    accountName: string;
    projectName: string;
    appId: string;
    initiatingUserId: string;
    cancelingUserId?: string;
    platform: PayloadPlatform;
    status: PayloadStatus;
    createdAt: string;
    updatedAt: string;
    completedAt: string;
    maxRetryTimeMinutes: number;
};

export type SubmitPayload = Payload & {
    submissionDetailsPageUrl: string;
    parentSubmissionId: string;
    archiveUrl?: string;
    turtleBuildId: string;
    submissionInfo: {
        error?: {
            message: string;
            errorCode: string;
        };
        logsSource: {
            type: string;
            bucketKey: string;
        };
    };
};

export type BuildPayloadPriority = "high" | "normal" | "low";

export type BuildPayload = Payload & {
    buildDetailsPageUrl: string;
    parentBuildId: string;
    artifacts?: {
        buildUrl: string;
        logsS3KeyPrefix: string;
    };
    metadata: {
        appName: string;
        username: string;
        workflow: string;
        appVersion: string;
        appBuildVersion: string;
        cliVersion: string;
        sdkVersion: string;
        buildProfile: string;
        distribution: string;
        appIdentifier: string;
        gitCommitHash: string;
        gitCommitMessage: string;
        runtimeVersion: string;
        channel: string;
        releaseChannel: string;
        reactNativeVersion: string;
        trackingContext: {
            platform: string;
            account_id: string;
            dev_client: boolean;
            project_id: string;
            tracking_id: string;
            project_type: string;
            dev_client_version: string;
        };
        credentialsSource: string;
        isGitWorkingTreeDirty: boolean;
        message: string;
        runFromCI: boolean;
    };
    metrics: {
        memory: number;
        buildEndTimestamp: number;
        totalDiskReadBytes: number;
        buildStartTimestamp: number;
        totalDiskWriteBytes: number;
        cpuActiveMilliseconds: number;
        buildEnqueuedTimestamp: number;
        totalNetworkEgressBytes: number;
        totalNetworkIngressBytes: number;
    };
    error?: {
        message: string;
        errorCode: string;
    };
    enqueuedAt: string;
    provisioningStartedAt: string;
    workerStartedAt: string;
    expirationDate: string;
    priority: BuildPayloadPriority;
    resourceClass: string;
    actualResourceClass: string;
};
