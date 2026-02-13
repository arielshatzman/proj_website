import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/proj_website/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        feedback: resolve(__dirname, 'feedback.html'),
        openContact: resolve(__dirname, 'openContact.html'),
        feedback_control: resolve(__dirname, 'feedback_control.html')
      }
    }
  },
  server: {
    port: 5173
  }
})
