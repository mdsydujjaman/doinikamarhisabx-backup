import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // Backup Preview is hosted inside this repository subdirectory.
  // Root deployment path remains separate and unchanged.
  base: mode === 'backup'
    ? '/doinikamarhisabx-backup/app-backup/dev/'
    : '/doinikamarhisab-X/',
}))
