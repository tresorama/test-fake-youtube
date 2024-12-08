import fs from "fs";
import type { createDbTable } from "./db.mock";

export const saveSnapshotAsJsonFile = (
  db: Record<string, ReturnType<typeof createDbTable<any>>>,
  filePath: string,
) => {
  const dbJson = Object.fromEntries(
    Object.keys(db).map((tableName) => [tableName, db[tableName].getAll()])
  );
  fs.writeFileSync(filePath, JSON.stringify(dbJson, null, 2), { flag: 'w' });
};