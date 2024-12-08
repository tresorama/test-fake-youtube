import express from "express";
import multer from "multer";
import path from 'path';
import cors from 'cors';
import z from "zod";

import { createLogger, type Logger } from "@/utils/logger";
import { createExpressMiddlewareRequestLogger } from "@/utils/logger/middleware.logger";
import { utilsDisk } from "@/utils/disk";

type CreateCdnServerOptions = {
  /** Name used for the logger */
  name: string,
  /** Port used by the server */
  port: number,
  /** CDN base url for ther rest of internet */
  cdnBaseUrl: string,
  /** Path to the static files to serve publicly */
  publicPath: string;
};

export const createCdnServer = (options: CreateCdnServerOptions) => {

  const logger = createLogger(options.name);
  const app = express();

  // init middlewares
  app.use(createExpressMiddlewareRequestLogger(`${options.name} - req`));
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }));
  app.use(express.static(options.publicPath));
  app.use(express.json()); // parse json request body
  app.use(express.urlencoded({ extended: false }));// parse urlencoded request body

  // init routes
  addRoutes({ app, logger, options });

  // Avvia il server
  app.listen(options.port, () => {
    logger.info(`CDN Server "${options.name}" running on ${options.cdnBaseUrl}`);
  });

};


type AddRoutesOptions = {
  app: express.Express,
  logger: Logger,
  options: CreateCdnServerOptions;
};
const addRoutes = ({ app, logger, options }: AddRoutesOptions) => {

  app.get("/", (req, res) => {
    res.send(`CDN Server running on port ${options.port}`);
  });

  // POST /upload
  // upload files in a specific directory
  // NOTE: 
  // - upload is handle in multer
  // - rest of esponse in express
  const multerUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        // parse body from req
        const parsedBody = z
          .object({ folder_name: z.string().min(1) })
          .safeParse(req.body);
        if (!parsedBody.success) {
          const error = new Error(parsedBody.error.message);
          cb(error, '');
          return;
        }
        // save files in a specific folder
        const outPath = `${options.publicPath}/${parsedBody.data.folder_name}/`;
        utilsDisk.createDirIfNotExists(outPath);
        cb(null, outPath);
      },
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        const fileName = `${baseName}${extension}`;
        cb(null, fileName);
      }
    }),
  });
  app.post("/upload", multerUpload.array("files"), (req, res) => {
    // parse files
    if (!Array.isArray(req.files)) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    // valid

    // create a final array of file urls of files saved
    // and send them back to the client
    // These new url will be used to access the files from the internet
    const outputFilesUrls = req.files.map((file) => {
      const publicFileUrl = file.path.replace(options.publicPath, options.cdnBaseUrl);
      return publicFileUrl;
    });

    // reply
    res.json({
      success: true,
      public_urls: outputFilesUrls
    });
  });
};