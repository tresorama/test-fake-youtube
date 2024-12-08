import { createCdnServer } from "./create-cdn-server";
import { STORAGE_PATHS, APP_URLS } from "@/constants";

createCdnServer({
  name: 'cdn1',
  port: APP_URLS.CDN1.PORT,
  cdnBaseUrl: APP_URLS.CDN1.URL,
  publicPath: STORAGE_PATHS.CDN1.PUBLIC,
});