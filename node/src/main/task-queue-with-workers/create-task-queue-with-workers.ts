import { taskQueueWithWorkerPublicApi } from './utils/task-queue';
import { workers_processVideo } from './workers/worker.process-video';
import { createLogger } from '@/utils/logger';

const logger = createLogger('main - task-queue-with-workers');

export const createTaskQueueWithWorkers = () => {

  // init task queue
  logger.info('Registering task queue scheduler ...!');
  taskQueueWithWorkerPublicApi.registerScheduler();

  // init workers
  logger.info('Registering workers ...!');
  [
    ...workers_processVideo,
  ].forEach(worker => {
    worker.registerWorker();
    logger.info(`worker [${worker.name}] registered!`);
  });
  logger.info('All workers registered!');

};