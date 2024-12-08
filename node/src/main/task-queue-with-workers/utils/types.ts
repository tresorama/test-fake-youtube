
// ===============================================
//     Task
// ===============================================

/** Base type of a Task.  
 * When you create a new worker/producer you don't use this type.  
 * But instead, you need to create a new type (based on `Task`) using the `CreateTask` utility.
 */
export type Task = {
  /** This us the proprty used to identify the task of the same type and apply rate limiting. TThis is not used to indentify task in logs (use `logName` for that) */
  name: string,
  /** Payload for the task. Must be JSON serializable */
  taskData: { [key: string]: any; },
};

/** Generic Type used to create a anew Task type. 
 * The output is the Contract between the producer and the consumer (worker) */
export type CreateTask<NewTask extends Task> = NewTask;

// ===============================================
//     Worker
// ===============================================

/** Worker instance as used by the task queue */
export type WorkerForTaskQueue<T extends Task> = {
  name: string,
  run: (task: T) => Promise<void>,
  checkIfICanRun: () => boolean;
};

/** Parameter of the `createWorker` function. 
 * Definition of Worker that you nee to prodive to the `createWorker` function */
export type CreateWorkerInfo<T extends Task> = {
  name: WorkerForTaskQueue<T>['name'],
  run: WorkerForTaskQueue<T>['run'],
};

/** Output of the `createWorker` function */
export type CreateWorkerOutput<T extends Task> = {
  name: WorkerForTaskQueue<T>['name'],
  registerWorker: () => void,
};

