import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  backendPort: null as number | null,
});

ipcRenderer.invoke('get-backend-port').then((port: number | null) => {
  if (port && window.electronAPI) {
    window.electronAPI.backendPort = port;
    window.__ZZDIARY_PORT__ = port;
  }
});
