import path from 'path';
import { test, expect } from 'vitest';

import { serviceProcessVideo } from './service.process-video';
import { STORAGE_PATHS } from '@/constants';
import { utilsDisk } from '@/utils/disk';

test('service.process-video', { timeout: 5 * 60 * 1000 }, async () => {
  const inputVideoPath = path.join(STORAGE_PATHS.TEST, "auto/elephants-dream-trimmed.mp4");
  const outputDirPath = path.join(STORAGE_PATHS.TEST, "auto/output");

  utilsDisk.deleteDir(outputDirPath);
  const result = await serviceProcessVideo.segmentVideo({ inputVideoPath, outputDirPath });

  expect(result.ok).toBe(true);
});