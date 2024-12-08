import { APP_URLS } from "@/constants";
import { createApiServer } from "./api/create-api-server";
import { createTaskQueueWithWorkers } from './task-queue-with-workers/create-task-queue-with-workers';

createTaskQueueWithWorkers();
createApiServer({
  port: APP_URLS.MAIN.PORT
});

