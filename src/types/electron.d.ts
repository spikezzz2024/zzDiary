export {};

declare global {
  interface Window {
    __ZZDIARY_PORT__?: number;
    electronAPI?: {
      platform: NodeJS.Platform;
      isElectron: boolean;
      backendPort: number | null;
    };
  }
}
