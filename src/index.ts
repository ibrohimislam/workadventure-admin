import fastify from 'fastify'
import qs from 'qs'
import GracefulServer from '@gquittet/graceful-server'
import adminRoutes from './routes/admin'
// import * as Sentry from '@sentry/node';

// Sentry.init({
//   dsn: "https://1958e1f7039a77c5c3cc75fd89ad654b@o4510637491093504.ingest.de.sentry.io/4510696931786832",
//   sendDefaultPii: true,
// });

const maxFileSize = process.env.MAX_FILE_SIZE !== undefined ? parseInt(process.env.MAX_FILE_SIZE) : 1024 * 1024 * 100; // 100MB default

const fastifyInstance = fastify({
  logger: true,
  trustProxy: true,
  bodyLimit: maxFileSize,
  querystringParser: (str) => qs.parse(str),
})

// Sentry.setupFastifyErrorHandler(fastifyInstance);

const gracefulServer = GracefulServer(fastifyInstance.server)

gracefulServer.on(GracefulServer.READY, () => {
  fastifyInstance.log.info('Server is ready')
})

gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
  fastifyInstance.log.info('Server is shutting down')
})

gracefulServer.on(GracefulServer.SHUTDOWN, (error: Error) => {
  fastifyInstance.log.info(`Server is down because of ${error.message}`)
})

fastifyInstance.log.info('Starting server...')

const start = async () => {
  try {
    await fastifyInstance.register(adminRoutes)
    await fastifyInstance.listen({ host: '0.0.0.0', port: 3000 })
    fastifyInstance.log.info(`server listening on port 3000`)
    gracefulServer.setReady()
  } catch (err) {
    fastifyInstance.log.error(err)
    process.exit(1)
  }
}

start()