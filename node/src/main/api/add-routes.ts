import path from 'path';
import express from "express";
import multer from "multer";
import z from 'zod';
import { formatDate } from 'date-fns';

import { STORAGE_PATHS } from '@/constants';
import type { CreateApiServerOptions } from '@/main/api/create-api-server';
import { db } from '@/main/db';
import { wrapLogger, type Logger } from "@/utils/logger";
import { utilsDisk } from '@/utils/disk';
import { taskQueueWithWorkerPublicApi } from '@/main/task-queue-with-workers/utils/task-queue';
import type { Task_ProcessVideoAndSendToCdn } from "@/main/task-queue-with-workers/workers/worker.process-video";

type AddRoutesOptions = {
  app: express.Express,
  logger: Logger,
  options: CreateApiServerOptions,
};

export const addRoutes = ({ app, logger: baseLogger, options }: AddRoutesOptions) => {

  // GET /test-logger
  app.get('/test-logger', (req, res) => {
    const logger = wrapLogger(baseLogger, '[GET /test-logger]');
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    logger.http('http');
    logger.verbose('verbose');
    logger.debug('debug');
    logger.silly('silly');
    res.send('test-logger');
  });

  // POST Caricamento video
  const multerUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const dirPath = `${STORAGE_PATHS.MAIN.UPLOADS}/`;
        utilsDisk.createDirIfNotExists(dirPath);
        cb(null, dirPath);
      },
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        const dateString = formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss');
        const fileName = `${dateString}-${baseName}${extension}`;
        cb(null, fileName);
      }
    })
  });

  app.post(
    "/videos/upload",
    // (req, res, next) => {
    //   const middlewareLogger = wrapLogger(logger, '[middleware request logger stream]');
    //   middlewareLogger.info(`Stream in arrivo: ${req.isPaused() ? 'Pausa' : 'Attivo'}`);
    //   req.on('data', (chunk) => middlewareLogger.info(`Ricevuto chunk di ${chunk.length} bytes`));
    //   req.on('end', () => middlewareLogger.info('Stream completato'));
    //   next();
    // },
    multerUpload.single("video_file"),
    async (req, res) => {
      const logger = wrapLogger(baseLogger, '[POST /videos/upload]');

      // parse body
      const parsedBody = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        author: z.string().min(1),
      }).safeParse(req.body);
      if (!parsedBody.success) {
        logger.warn('Invalid body. Return 400');
        logger.debug(parsedBody.error.message);
        res.status(400).json({ error: JSON.parse(parsedBody.error.message) });
        return;
      }

      // parse file
      if (!req.file) {
        logger.warn('Missing file. Return 400');
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // valid
      const { title, description, author } = parsedBody.data;
      const { file } = req;

      // create video in db
      // NOTE: the file is already uploaded by multer at this point
      // NOTE: we create a db record before processing the video, because we need the id of the video
      logger.debug('Creating video item in db...');
      const videoCreated = db.videos.create({
        status: 'preprocessing',
        title,
        description,
        author,
        path_upload: file.path,
        path_processed: null,
        path_cdn_urls: null,
      });

      // few steps:
      // - process video (this will create new files in the processed folder)
      // - update metadata of video in db
      // - send a copy of file to cdn
      // - update metadata of video in db
      // - delete processed files
      // - update metadata of video in db
      logger.info('Scheduling task to process video...');
      taskQueueWithWorkerPublicApi.addTask<Task_ProcessVideoAndSendToCdn>({
        name: 'process-video-and-send-to-cdn',
        taskData: {
          videoId: videoCreated.id,
          inputVideoPath: file.path
        }
      });
      // const taskBag = {
      //   videoId: videoCreated.id,
      //   inputFilePath: file.path,
      // };
      // addTaskToQueue({
      //   name: 'on-upload-proess-video',
      //   logName: `on-upload-proess-video [${taskBag.videoId}]`,
      //   timeBetweenTasks_inMs: 2 * 60 * 1000,
      //   cb: async () => {
      //     // get info
      //     const { inputFilePath, videoId } = taskBag;

      //     // logger
      //     const videoLogger = wrapLogger(logger, `[${taskBag.videoId}]`);

      //     // process the video
      //     videoLogger.verbose('Processing video...');
      //     const processVideoResult = await serviceProcessVideo.segmentVideo3({
      //       inputVideoPath: inputFilePath,
      //       outputDirPath: path.join(STORAGE_PATHS.MAIN.PROCESSED, `${videoId}`),
      //     });
      //     if (!processVideoResult.ok) {
      //       videoLogger.error('Error while processing video. Terminate Task.');
      //       processVideoResult.error.print(videoLogger);
      //       return;
      //     }
      //     videoLogger.verbose(`Video processed successfully.`);

      //     // update metadata of video
      //     videoLogger.verbose('Updating metadata in db...');
      //     db.videos.update(videoId, {
      //       status: 'preprocessing',
      //       path_processed: processVideoResult.data.output_files_path,
      //     });
      //     videoLogger.verbose('Updated metadata in db');

      //     // move the files to the cdn
      //     const moveToCdnResponse = await tryCatchAsync(
      //       async () => {
      //         // create form data with files
      //         // NOTE: append files as latest fields or it will not work
      //         const formData = new FormData();
      //         formData.append('folder_name', videoId);
      //         for (const filePath of processVideoResult.data.output_files_path) {
      //           formData.append('files', fs.createReadStream(filePath));
      //         }

      //         // send request
      //         logger.verbose('Sendinh POST request to move files to cdn...');
      //         const res = await fetch(`${APP_URLS.CDN1.URL}/upload`, {
      //           method: 'POST',
      //           headers: formData.getHeaders(),
      //           body: formData,
      //         });
      //         if (!res.ok) {
      //           throw new Error(`Error while moving files to cdn. ${res.status} - ${res.statusText}`);
      //         }
      //         logger.verbose('Extracting result from response...');
      //         const parsedBody = z
      //           .object({
      //             success: z.boolean(),
      //             public_urls: z.array(z.string())
      //           })
      //           .safeParse(await res.json());
      //         if (!parsedBody.success) {
      //           throw parsedBody.error;
      //         }
      //         return parsedBody.data;
      //       });
      //     if (!moveToCdnResponse.ok) {
      //       videoLogger.error('Error while moving files to cdn. Terminate Task.');
      //       moveToCdnResponse.error.print(videoLogger);
      //       return;
      //     }
      //     videoLogger.verbose(`Video ${videoId} moved to cdn successfully.`);
      //     const { public_urls } = moveToCdnResponse.data;

      //     // delete processed files
      //     utilsDisk.deleteDir(processVideoResult.data.output_dir_path);

      //     // update metadata of video
      //     videoLogger.verbose('Updating metadata in db...');
      //     db.videos.update(videoId, {
      //       status: 'ready',
      //       path_processed: null,
      //       path_cdn_urls: public_urls,
      //     });

      //   }
      // });

      res.json({
        videoId: videoCreated.id,
        status: 'uploaded - schedlued for processing',
      });
    });

  // GET Elenco video
  app.get("/videos", (req, res) => {
    const logger = wrapLogger(baseLogger, '[GET /videos]');
    logger.verbose('Getting all videos...');
    const videos = db.videos.getAll();
    res.json(videos);
  });

  // GET Dettagli di un video
  app.get("/videos/:videoId", (req, res) => {
    const logger = wrapLogger(baseLogger, '[GET /videos/:videoId]');

    // parse params
    const paramsSchema = z.object({
      videoId: z.string().min(1),
    });
    const parsedParams = paramsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      logger.warn('Invalid params. Return 400');
      logger.debug(parsedParams.error.message);
      res.status(400).json({ error: parsedParams.error.message });
      return;
    }

    // valid
    const { videoId } = parsedParams.data;

    logger.verbose(`Getting video ${videoId}...`);
    const video = db.videos.getById(videoId);
    if (!video) {
      logger.warn(`Not found video ${videoId}. Return 404`);
      res.status(404).json({ error: "Video not found" });
      return;
    }
    logger.verbose(`Found video ${videoId}. Return 200`);

    res.json(video);
  });

  // POST Commenti
  app.post("/comments/:videoId", express.json(), (req, res) => {
    const logger = wrapLogger(baseLogger, '[POST /comments/:videoId]');

    // parse params
    const paramsSchema = z.object({
      videoId: z.string().min(1),
    });
    const parsedParams = paramsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      logger.warn('Invalid params. Return 400');
      logger.debug(parsedParams.error.message);
      res.status(400).json({ error: parsedParams.error.message });
      return;
    }

    // parse body
    const bodySchema = z.object({
      comment: z.string().min(1),
    });
    const parsedBody = bodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      logger.warn('Invalid body. Return 400');
      logger.debug(parsedBody.error.message);
      res.status(400).json({ error: parsedBody.error.message });
      return;
    }

    // valid
    const { videoId } = parsedParams.data;
    const { comment } = parsedBody.data;

    // ensure video exists
    logger.verbose(`Checking if video ${videoId} exists...`);
    const video = db.videos.getById(videoId);
    if (!video) {
      logger.warn(`Not found video ${videoId}. Return 404`);
      res.status(404).json({ error: "Video not found" });
      return;
    }
    logger.verbose(`Found video ${videoId}.`);

    // append comment in db
    logger.verbose(`Creating comment for video ${videoId}...`);
    const createdComment = db.comments.create({
      video_id: videoId,
      comment
    });

    res.json({ commentId: createdComment.id });
  });

  // GET Commenti
  app.get("/comments/:videoId", (req, res) => {
    const logger = wrapLogger(baseLogger, '[GET /comments/:videoId]');

    // parse params
    const paramsSchema = z.object({
      videoId: z.string().min(1),
    });
    const parsedParams = paramsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      logger.warn('Invalid params. Return 400');
      logger.debug(parsedParams.error.message);
      res.status(400).json({ error: parsedParams.error.message });
      return;
    }

    // valid
    const { videoId } = req.params;

    logger.verbose(`Getting comments for video ${videoId}...`);
    const comments = db.comments.getAll().filter(comment => comment.video_id === videoId);
    res.json(comments);
  });

};