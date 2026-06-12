import fp from "fastify-plugin";
import oauthPlugin from "@fastify/oauth2";
import { env } from "../env";

export default fp(async (fastify) => {
  fastify.register(oauthPlugin, {
    name: "githubOAuth2",

    credentials: {
      client: {
        id: env.GITHUB_CLIENT_ID!,
        secret: env.GITHUB_CLIENT_SECRET!,
      },

      auth: {
        authorizeHost: "https://github.com",
        authorizePath: "/login/oauth/authorize",

        tokenHost: "https://github.com",
        tokenPath: "/login/oauth/access_token",
      },
    },

    startRedirectPath: "/auth/github",

    callbackUri: env.GITHBU_CALLBACK_URL!,
  });
});