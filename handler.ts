import serverlessExpress from "@vendia/serverless-express";
import app from "./src/app";

export const handler = serverlessExpress({ app });
