import path from "path";
import { createDbTable, type DbRecord } from "@/utils/db.mock";
import { saveSnapshotAsJsonFile } from "@/utils/db.mock.save-snaphot";
import { utilsDisk } from "@/utils/disk";
import { STORAGE_PATHS } from "@/constants";

// fake db in memory
export type DB = {
  video: DbRecord<{
    id: string,
    status: 'ready' | 'preprocessing',
    author: string,
    title: string,
    description: string,
    path_upload: string,
    path_processed: string[] | null,
    path_cdn_urls: string[] | null,
  }>,
  comments: DbRecord<{
    id: string,
    video_id: string,
    comment: string,
  }>;
};
export const db = {
  videos: createDbTable<DB['video']>([]),
  comments: createDbTable<DB['comments']>([]),
};

// save a copy of the db every 4 seconds to disk
utilsDisk.createDirIfNotExists(STORAGE_PATHS.DEBUG);
setInterval(() => {
  saveSnapshotAsJsonFile(db, path.resolve(STORAGE_PATHS.DEBUG, 'db.json'));
}, 4000);