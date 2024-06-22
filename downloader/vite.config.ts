import path from "path";

import UnpluginTypia from "@ryoppippi/unplugin-typia/vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid(), UnpluginTypia()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
