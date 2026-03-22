/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASENAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
