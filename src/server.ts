import Fastify from 'fastify'
import { connectDatabase } from './utils/database'
import { registerSwagger } from './utils/swagger'
import authRoutes from './routes/auth.routes'

const fastify = Fastify({ logger: true })

const start = async () => {
  try {
    await connectDatabase()
    await registerSwagger(fastify)
    await fastify.register(authRoutes)
    await fastify.listen({ port: Number(process.env.PORT) || 3000, host: "0.0.0.0" })
    console.log('Servidor corriendo en http://localhost:3000')
    console.log('Documentación Swagger en http://localhost:3000/docs')
  } catch (err) {
    fastify.log.error(err)
  }
}

start()
