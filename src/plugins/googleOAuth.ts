import fastifyOauth2, { type FastifyOAuth2Options } from "@fastify/oauth2";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { env } from "../env";

export default fp(async (fastify) => {
  fastify.register(fastifyOauth2 as FastifyPluginCallback<FastifyOAuth2Options>, {
    name: "googleOAuth2",
    scope: ["profile", "email"],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/auth/google",
    callbackUri: `${env.REDIRECT_URL}`,
  });
});