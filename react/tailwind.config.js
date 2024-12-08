import path from "path";
import { skeleton } from "@skeletonlabs/skeleton/plugin";
import * as themes from "@skeletonlabs/skeleton/themes";


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    path.join(
      require.resolve('@skeletonlabs/skeleton-react'), '../**/*.{html,js,jsx,tsx,ts}'
    )
  ],
  theme: {
    extend: {},
  },
  plugins: [
    skeleton({
      // NOTE: each theme included will be added to your CSS bundle
      themes: [themes.terminus]
    })
  ],
}

