import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import { env } from "../env";

export default fp(async (fastify) => {
  fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", `${env.IMG_SRC}`],
        connectSrc: ["'self'", `${env.FRONTEND_URL}`],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
});
