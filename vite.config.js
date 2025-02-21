// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// export default defineConfig({
//   plugins: [
//     react()
//   ],
//   resolve: {
//     alias: {
//       process: 'process/browser',
//       Buffer: 'buffer'
//     }
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       define: {
//         global: 'window'
//       },
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           process: true,
//           buffer: true
//         }),
//         NodeModulesPolyfillPlugin()
//       ]
//     }
//   }
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  esbuild: {
    loader: 'jsx', // Use a string here instead of an object
  },
  plugins: [react()],
  server: {
    port: 5173,
  },
});
