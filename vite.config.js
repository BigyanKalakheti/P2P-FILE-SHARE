

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   esbuild: {
//     loader: 'jsx', // Use a string here instead of an object
//   },
//   plugins: [react()],
//   server: {
//     port: 5173,
//   },
// });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   esbuild: {
//     loader: 'jsx', // Use a string here instead of an object
//   },
//   plugins: [react()],
//   server: {
//     port: 5173,
//   },
//   define: {
//     global: 'window', // Polyfill `global` with `window` for browser compatibility
//     process: 'process', // Polyfill `process`
//   },
// });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import ViteEnvCompatible from "vite-plugin-env-compatible";

// export default defineConfig({
//   plugins: [
//     react(),
//     ViteEnvCompatible(), // Use the plugin to support process.env
//   ],
//   server: {
//     port: 5173,
//   },
//   define: {
//     global: 'window', // Polyfill `global` with `window` for browser compatibility
//     process: { nextTick: () => {} },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteEnvCompatible from "vite-plugin-env-compatible";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
export default defineConfig({
  plugins: [
    react(),
    ViteEnvCompatible(), // Use the plugin to support process.env
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
      define: { 'process.env.var': '"hello"' }, // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
  }),, // Add polyfills for Node.js APIs
  ],
  server: {
    port: 5173,
  },
  define: {
    global: 'window', // Polyfill `global` with `window` for browser compatibility
  },
});
