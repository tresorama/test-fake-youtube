import path from 'path';
import fs from 'fs';

export const utilsDisk = {
  createDirIfNotExists: (outputDirPath: string) => {
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }
  },
  getAllFilePathsInDir: (dirPath: string) => {
    const files = fs.readdirSync(dirPath);
    const filePaths = files.map((file) => path.join(dirPath, file));
    return filePaths;
  },
  deleteFiles: (filesPath: string[]) => {
    for (const filePath of filesPath) {
      fs.rmSync(filePath);
    }
  },
  deleteDir: (dirPath: string) => {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};