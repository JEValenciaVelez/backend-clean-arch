import cluster from 'cluster';
import os from 'os';

import { env } from '@/infrastructure/config/env';
import { createContainer } from '@/presentation/container/container';
import { createServer } from '@/presentation/http/server';

async function bootstrap(): Promise<void> {
  const container = await createContainer();
  const app = createServer(container);

  app.listen(env.PORT, () => {
    container.logger.info(`✅ Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

async function main(): Promise<void> {
  if (env.MULTI_CORE === 1 && cluster.isPrimary) {
    const cpus = os.cpus().length;
    // eslint-disable-next-line no-console
    console.log(`🧠 Primary ${process.pid} running ${cpus} workers`);
    for (let i = 0; i < cpus; i += 1) {
      cluster.fork();
    }
    cluster.on('exit', (worker) => {
      console.warn(`⚠️  Worker ${worker.process.pid} died, restarting...`);
      cluster.fork();
    });
    return;
  }

  await bootstrap();
}

main().catch((error) => {
  console.error('❌ Fatal bootstrap error', error);
  process.exit(1);
});
