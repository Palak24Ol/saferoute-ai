// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force all packages (@material-tailwind, @chakra-ui, @mui, etc.)
    // to use the same single React instance. Without this, each UI library
    // can bundle its own React copy, causing "Invalid hook call" crashes
    // when @react-google-maps triggers an async re-render.
    dedupe: ['react', 'react-dom'],
  },
})