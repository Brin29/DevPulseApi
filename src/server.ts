import Fastify from "fastify";
import { connectDatabase } from "./utils/database.utils";
import { registerSwagger } from "./utils/swagger.utils";
import authRoutes from "./routes/auth.routes";
import teamRoutes from "./routes/team.routes";
import taskRoutes from "./routes/task.routes";
import reportRoutes from "./routes/report.routes";
import userRoutes from "./routes/user.routes";
import cors from "./plugins/cors";
import googleOAuth from "./plugins/googleOAuth";
import githubOAuth from "./plugins/githubOAuth";
import multipart from "./plugins/multipart";
import helmet from "./plugins/helmet";

const fastify = Fastify({ logger: true });

fastify.setErrorHandler((error: any, _, reply) => {
  const status = error.status ?? error.statusCode ?? 500;
  const message = error.message ?? "Error interno del servidor";

  reply.status(status).send({ error: message });
});

const start = async () => {
  try {
    await fastify.register(cors);
    await connectDatabase();
    await registerSwagger(fastify);
    await fastify.register(helmet);
    await fastify.register(googleOAuth);
    await fastify.register(githubOAuth);
    await fastify.register(multipart);
    await fastify.register(authRoutes);
    await fastify.register(teamRoutes);
    await fastify.register(taskRoutes);
    await fastify.register(reportRoutes);
    await fastify.register(userRoutes);
    await fastify.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
    console.log("Servidor corriendo en http://localhost:3000");
    console.log("Documentación Swagger en http://localhost:3000/docs");
  } catch (err) {
    fastify.log.error(err);
  }
};

start();
