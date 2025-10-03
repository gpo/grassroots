/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_BACKEND_HOST: string;
  readonly VITE_FRONTEND_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
