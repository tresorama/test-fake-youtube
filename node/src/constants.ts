import path from "path";

// populate __dirname
const __dirname = import.meta.dirname; // get the name of the directory


export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const APP_URLS = {
  MAIN: {
    URL: "http://localhost:4000",
    PORT: 4000,
  },
  CDN1: {
    URL: "http://localhost:4001",
    PORT: 4001,
  }
};
export const PROJECT_PATH = path.resolve(__dirname, "..");
export const STORAGE_PATHS = {
  TEST: path.resolve(__dirname, "../_test"),
  DEBUG: path.resolve(__dirname, "../_debug"),
  MAIN: {
    UPLOADS: path.resolve(__dirname, "../_storage/main/uploads"),
    PROCESSED: path.resolve(__dirname, "../_storage/main/processed"),
  },
  CDN1: {
    PUBLIC: path.resolve(__dirname, "../_storage/cdn1/public"),
  },
};