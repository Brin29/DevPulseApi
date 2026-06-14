import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { env } from "../env";

export default fp(async (fastify) => {
  fastify.register(cors, {
    origin: [env.FRONTEND_URL!!, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,   
  });
});
