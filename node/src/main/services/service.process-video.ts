import { exec } from 'child_process';
import { createLogger } from '@/utils/logger';
import { printError } from '@/utils/error';
import { tryCatchAsync } from '@/utils/try-catch-async';
import { utilsDisk } from '@/utils/disk';
import { PROJECT_PATH } from '@/constants';

const logger = createLogger('service - process-video');

/** 
 * Service for processing videos and producing HLS ready files  
 * NOTE: the machine needs to have `ffmpeg` installed
*/
export const serviceProcessVideo = {
  segmentVideo: async ({
    inputVideoPath,
    outputDirPath
  }: {
    /** Absolute path to the input video */
    inputVideoPath: string,
    /** Absolute path to the output directory */
    outputDirPath: string;
  }) => {

    return tryCatchAsync(() => {

      type SuccessValue = {
        success: true;
        output_dir_path: string;
        output_files_path: string[];
      };

      return new Promise<SuccessValue>((resolve, reject) => {

        // prevent destroying machine file system
        if (!inputVideoPath.startsWith(PROJECT_PATH)) {
          logger.debug('Input video path is not allowed');
          logger.debug(inputVideoPath);
          throw new Error('Input video path is not allowed');
        }

        // build ffmpeg command
        const ffmpegCommand = `
        rm -rf "${outputDirPath}" && \
        mkdir -p "${outputDirPath}" && \
        ffmpeg -hide_banner -re -i "${inputVideoPath}" \
        -map 0:v:0 -map 0:a:0 \
        -map 0:v:0 -map 0:a:0 \
        -map 0:v:0 -map 0:a:0 \
        -map 0:v:0 -map 0:a:0 \
        -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -c:a aac -ar 48000 \
        -filter:v:0 scale=w=640:h=360:force_original_aspect_ratio=decrease -maxrate:v:0 856k -bufsize:v:0 1200k -b:a:0 96k \
        -filter:v:1 scale=w=960:h=540:force_original_aspect_ratio=decrease -maxrate:v:1 1498k -bufsize:v:1 2100k -b:a:1 128k \
        -filter:v:2 scale=w=1280:h=720:force_original_aspect_ratio=decrease -maxrate:v:2 2996k -bufsize:v:2 4200k -b:a:2 128k \
        -filter:v:3 scale=w=1920:h=1080:force_original_aspect_ratio=decrease -maxrate:v:3 5350k -bufsize:v:3 7500k -b:a:3 192k \
        -var_stream_map "v:0,a:0,name:360p v:1,a:1,name:540p v:2,a:2,name:720p v:3,a:3,name:1080p" \
        -f hls \
        -hls_time 6 \
        -hls_playlist_type vod \
        -hls_list_size 0 \
        -master_pl_name master.m3u8 \
        -hls_segment_filename "${outputDirPath}/v%v_segment%d.ts" \
        "${outputDirPath}/v%v.m3u8"
        `.trim();


        // run ffmpeg
        logger.silly('Spawned Ffmpeg with command:');
        logger.silly(ffmpegCommand);
        exec(
          ffmpegCommand,
          (error, stdout, stderr) => {
            // if error
            if (error) {
              logger.error(`exec error: ${error}`);
              printError(error, logger);
              reject(error);
            }
            // if success
            resolve({
              success: true,
              output_dir_path: outputDirPath,
              output_files_path: utilsDisk.getAllFilePathsInDir(outputDirPath),
            });
          });

      });

    });

  },
};


