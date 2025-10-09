import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/http/server.ts'],
    outDir: 'dist',
    target: 'node20',
    format: ['cjs'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: false,
    shims: false,
    noExternal: ['saas/auth', 'saas/env']
})