import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import { startBackend, stopBackend } from './backend';
import type { BackendProcess } from './backend';

let mainWindow: BrowserWindow | null = null;
let backend: BackendProcess | null = null;

const isDev = !!process.env.ELECTRON_RENDERER_URL;

function getPreloadPath(): string {
  return path.join(__dirname, '../preload/index.mjs');
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: true,
    title: 'zzDiary',
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL!);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadURL(`http://127.0.0.1:${backend!.port}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function boot(): Promise<void> {
  try {
    backend = await startBackend();
  } catch (err) {
    dialog.showErrorBox(
      'Failed to start backend',
      err instanceof Error ? err.message : String(err)
    );
    app.quit();
    return;
  }

  ipcMain.handle('get-backend-port', () => {
    return backend?.port ?? null;
  });

  await createWindow();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(boot);

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('before-quit', async () => {
    if (backend) {
      await stopBackend(backend);
      backend = null;
    }
  });
}
