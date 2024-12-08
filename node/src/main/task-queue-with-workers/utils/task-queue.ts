
import type { Task, Worker } from "./types";
import { printError } from "@/utils/error";
import { createLogger, wrapLogger } from "@/utils/logger";


const logger = createLogger('main - task-queue-with-workers');


/**
 * Singleton instance of a TaskQueue
 * 
 * That lets:
 * - producer to add tasks to queue
 * - consumer (worker) to run tasks
 */
export const taskQueueWithWorkers = {
  queue: [] as Task[],
  workers: [] as Worker<any>[],
  interval: null as NodeJS.Timeout | null,

  // register event listeners
  registerScheduler: () => {
    const INTERVAL_TIME = 15 * 1000;
    taskQueueWithWorkers.interval = setInterval(taskQueueWithWorkers.notifyWorkers, INTERVAL_TIME);
  },
  unregisterScheduler: () => {
    if (taskQueueWithWorkers.interval === null) return;
    clearInterval(taskQueueWithWorkers.interval);
  },

  // prducer
  addTask: <T extends Task>(task: T) => {
    taskQueueWithWorkers.queue.push(task);
  },

  // private api
  notifyWorkers: () => {
    // 1. if there are not tasks in queue, exit
    if (taskQueueWithWorkers.queue.length === 0) {
      logger.silly('0 task in queue found! Terminate');
      return;
    }
    logger.silly(`Tasks in queue: ${taskQueueWithWorkers.queue.length}`);
    taskQueueWithWorkers.queue.forEach((t, i) => {
      logger.silly(`[Task: ${i + 1} / ${taskQueueWithWorkers.queue.length}] : [${t.name}]`);
    });

    // 2. check which worker can run which task
    let searchState: {
      status: 'idle',
      taskIndex: null,
      workerIndex: null,
    } | {
      status: "worker-accepted-task",
      taskIndex: number;
      workerIndex: number;
    } = {
      status: 'idle',
      taskIndex: null,
      workerIndex: null,
    };

    for (const [it, task] of taskQueueWithWorkers.queue.entries()) {
      const taskLogger = wrapLogger(logger, `[Task ${it + 1} / ${taskQueueWithWorkers.queue.length}] [${task.name}]`);

      const workersForThisTask = taskQueueWithWorkers.workers.filter(w => w.name === task.name);
      if (workersForThisTask.length === 0) {
        taskLogger.error('No worker registered for this task. Are they registerd ? Check next task');
        continue;
      }

      for (const [iw, worker] of workersForThisTask.entries()) {
        const workerLogger = wrapLogger(taskLogger, `[Worker ${iw + 1} / ${workersForThisTask.length}]`);
        const accepted = worker.checkIfICanRun();
        if (accepted) {
          workerLogger.info('Worker accepted task');
          searchState = {
            status: 'worker-accepted-task',
            taskIndex: it,
            workerIndex: iw,
          };
          break;
        }
        workerLogger.silly('Worker cannot run task');
      }

      if (searchState.status === 'worker-accepted-task') {
        break;
      }
    }

    if (searchState.status === 'idle') {
      logger.info('No worker accepted any of the task in queue at this moment. Terminate');
      return;
    }

    // found it
    const task = taskQueueWithWorkers.queue[searchState.taskIndex];
    const worker = taskQueueWithWorkers.workers[searchState.workerIndex];
    const executionLogger = wrapLogger(logger, `[Task: ${searchState.taskIndex + 1} / ${taskQueueWithWorkers.queue.length}] [Worker: ${searchState.workerIndex + 1} / ${taskQueueWithWorkers.workers.length}] [${task.name}]`);

    // 3. remove task from queue
    taskQueueWithWorkers.queue.splice(searchState.taskIndex, 1);

    // 4. run task
    executionLogger.silly("Running task...");
    worker
      .run(task)
      .then(() => {
        executionLogger.info(`Worker finished task.`);
      })
      .catch((error) => {
        executionLogger.error(`Worker failed to finish task.`);
        printError(error, logger);
      });

  },

};

/**
 * Public API of TaskQueue
 * 
 * That lets:
 * - producer to add tasks to queue
 */
export const taskQueueWithWorkerPublicApi = {
  registerScheduler: taskQueueWithWorkers.registerScheduler,
  unregisterScheduler: taskQueueWithWorkers.unregisterScheduler,
  addTask: taskQueueWithWorkers.addTask,
};
