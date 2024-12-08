import { taskQueueWithWorkers } from "./task-queue";
import type { Task, WorkerForTaskQueue, CreateWorkerInfo, CreateWorkerOutput } from "./types";

/** Function that create a single worker instance */
const createWorkerSingle = <T extends Task>(info: CreateWorkerInfo<T>): CreateWorkerOutput<T> => {

  const state = {
    isRunning: false,
  };

  const worker: WorkerForTaskQueue<T> = {
    name: info.name,
    run: async (task: T) => {
      return info
        .run(task)
        .then(() => {
          state.isRunning = false;
        });
    },
    checkIfICanRun: () => {
      if (state.isRunning) return false;
      else {
        // NOTE: we switch state immediately, this is to avoid race conditions
        state.isRunning = true;
        return true;
      }
    }
  };

  const workerPublicApi: CreateWorkerOutput<T> = {
    name: worker.name,
    registerWorker: () => {
      taskQueueWithWorkers.workers.push(worker);
    }
  };

  return workerPublicApi;
};

/** Function that create multiple identical worker instances */
export const createWorker = <T extends Task>(
  /** The number of identical instances of the worker to create */
  numberOfWorkers: number,
  /** The worker info */
  info: CreateWorkerInfo<T>
) => {
  return new Array(numberOfWorkers).fill(0).map(() => createWorkerSingle(info));
};