import path from "path";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import { z } from "zod";

import { createWorker } from "@/main/task-queue-with-workers/utils/create-worker";
import { type CreateTask } from '@/main/task-queue-with-workers/utils/types';
import { APP_URLS, STORAGE_PATHS } from "@/constants";
import { db } from "@/main/db";
import { serviceProcessVideo } from "@/main/services/service.process-video";
import { createLogger, wrapLogger } from "@/utils/logger";
import { tryCatchAsync } from "@/utils/try-catch-async";
import { utilsDisk } from "@/utils/disk";

const NUMBER_OF_WORKERS = 10;
const logger = createLogger('worker-process-video');


/** Task type that acts as contract between producer (who schedule the task) and consumer (worker)  
 * This is for task ""process-video-and-send-to-cdn""
 */
export type Task_ProcessVideoAndSendToCdn = CreateTask<{
  name: "process-video-and-send-to-cdn",
  taskData: {
    /** Video id of the video to process, as saved in DB */
    videoId: string,
    /** Absolute path to the input video */
    inputVideoPath: string,
  };
}>;

/**
 * Set of identical Workers for "process-video-and-send-to-cdn"
 * 
 * The task does:
 * - process the video
 * - update metadata in DB
 * - send the processed video to the CDN
 * - delete the processed video
 * - update metadata in DB
 */
export const workers_processVideo = createWorker<Task_ProcessVideoAndSendToCdn>(
  NUMBER_OF_WORKERS,
  {
    name: 'process-video-and-send-to-cdn',
    run: async (task) => {
      // 0. get task data
      // 0. create a logger for this execution
      const { inputVideoPath, videoId } = task.taskData;
      const videoLogger = wrapLogger(logger, `[${videoId}]`);

      // 1. process the video
      videoLogger.verbose('Processing video...');
      const processVideoResult = await serviceProcessVideo.segmentVideo({
        inputVideoPath,
        outputDirPath: path.join(STORAGE_PATHS.MAIN.PROCESSED, `${videoId}`),
      });
      if (!processVideoResult.ok) {
        videoLogger.error('Error while processing video. Terminate Task.');
        processVideoResult.error.print(videoLogger);
        return;
      }
      videoLogger.verbose(`Video processed successfully.`);

      // 2. update metadata of video
      videoLogger.verbose('Updating metadata in db...');
      db.videos.update(videoId, {
        status: 'preprocessing',
        path_processed: processVideoResult.data.output_files_path,
      });
      videoLogger.verbose('Updated metadata in db');

      // 3. move the files to the cdn
      const moveToCdnResponse = await tryCatchAsync(
        async () => {
          // create form data with files
          // NOTE: append files as latest fields or it will not work
          const formData = new FormData();
          formData.append('folder_name', videoId);
          for (const filePath of processVideoResult.data.output_files_path) {
            formData.append('files', fs.createReadStream(filePath));
          }

          // send request
          logger.verbose('Sendinh POST request to move files to cdn...');
          const res = await fetch(`${APP_URLS.CDN1.URL}/upload`, {
            method: 'POST',
            headers: formData.getHeaders(),
            body: formData,
          });
          if (!res.ok) {
            throw new Error(`Error while moving files to cdn. ${res.status} - ${res.statusText}`);
          }
          logger.verbose('Extracting result from response...');
          const parsedBody = z
            .object({
              success: z.boolean(),
              public_urls: z.array(z.string())
            })
            .safeParse(await res.json());
          if (!parsedBody.success) {
            throw parsedBody.error;
          }
          return parsedBody.data;
        });
      if (!moveToCdnResponse.ok) {
        videoLogger.error('Error while moving files to cdn. Terminate Task.');
        moveToCdnResponse.error.print(videoLogger);
        return;
      }
      videoLogger.verbose(`Video ${videoId} moved to cdn successfully.`);
      const { public_urls } = moveToCdnResponse.data;

      // 4. delete processed files
      utilsDisk.deleteDir(processVideoResult.data.output_dir_path);

      // 5. update metadata of video
      videoLogger.verbose('Updating metadata in db...');
      db.videos.update(videoId, {
        status: 'ready',
        path_processed: null,
        path_cdn_urls: public_urls,
      });
    }
  }
);