import { createWorker } from "./create-worker";
import { taskQueueWithWorkerPublicApi } from "./task-queue";
import type { CreateTask } from "./types";


export async function demo() {

  type Task_Task1 = CreateTask<{
    name: "task-1",
    taskData: {
      name: string,
      age: number,
    };
  }>;

  // consumer
  createWorker<Task_Task1>(1, {
    name: 'task-1',
    run: async (task) => {
      const { name, age } = task.taskData;
      console.log('task-1', { name, age });
    }
  });


  // producer
  taskQueueWithWorkerPublicApi.addTask<Task_Task1>({
    name: 'task-1',
    taskData: {
      name: 'john',
      age: 50,
    }
  });

}



