import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

export interface BackendProcess {
  port: number;
  process: ChildProcess;
}

function isDev(): boolean {
  return !!process.env.ELECTRON_RENDERER_URL;
}

function jarPath(): string {
  if (isDev()) {
    return path.join(process.cwd(), 'zzdiary-server', 'build', 'libs', 'zzdiary-server-0.0.1-SNAPSHOT.jar');
  }
  return path.join(process.resourcesPath, 'zzdiary-server.jar');
}

function healthCheck(port: number, timeoutMs: number = 30000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = (): void => {
      const req = http.get(`http://127.0.0.1:${port}/actuator/health`, (res) => {
        if (res.statusCode === 200) {
          res.resume();
          resolve();
        } else {
          res.resume();
          retryOrFail();
        }
      });
      req.on('error', () => {
        retryOrFail();
      });
      req.setTimeout(2000, () => {
        req.destroy();
        retryOrFail();
      });
    };

    function retryOrFail(): void {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Backend health check timed out after ${timeoutMs}ms on port ${port}`));
      } else {
        setTimeout(poll, 500);
      }
    }

    poll();
  });
}

function parsePortFromOutput(data: string): number | null {
  const match = data.match(/Tomcat started on port (\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export async function startBackend(): Promise<BackendProcess> {
  const dev = isDev();
  const jar = jarPath();

  if (!fs.existsSync(jar)) {
    throw new Error(
      `Spring Boot JAR not found at:\n${jar}\n\n` +
      'Please build the backend first:\n' +
      '  cd zzdiary-server && ./gradlew bootJar'
    );
  }

  if (dev) {
    try {
      await healthCheck(8080, 1500);
      console.log('[backend] Reusing existing backend on port 8080');
      return { port: 8080, process: null as unknown as ChildProcess };
    } catch {
      // No backend running, start one
    }
  }

  const portArg = dev ? '8080' : '0';
  console.log(`[backend] Starting: java -jar ${jar} --server.port=${portArg}`);

  const proc = spawn('java', [
    '-jar', jar,
    `--server.port=${portArg}`,
    '--server.address=127.0.0.1',
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout?.on('data', (data: Buffer) => {
    const text = data.toString();
    process.stdout.write(`[backend] ${text}`);
  });

  proc.stderr?.on('data', (data: Buffer) => {
    const text = data.toString();
    process.stderr.write(`[backend:err] ${text}`);
  });

  proc.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'ENOENT') {
      throw new Error(
        'Java is not installed or not in PATH.\n' +
        'Please install Java 25 or later to run zzDiary.'
      );
    }
    throw err;
  });

  let port: number;

  if (dev) {
    port = 8080;
  } else {
    port = await new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timed out waiting for Spring Boot to start'));
      }, 60000);

      proc.stdout?.on('data', (data: Buffer) => {
        const parsed = parsePortFromOutput(data.toString());
        if (parsed) {
          clearTimeout(timeout);
          resolve(parsed);
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      proc.on('exit', (code) => {
        clearTimeout(timeout);
        reject(new Error(`Backend process exited with code ${code}`));
      });
    });
  }

  console.log(`[backend] Waiting for health check on port ${port}...`);
  await healthCheck(port);
  console.log(`[backend] Ready on port ${port}`);

  return { port, process: proc };
}

export async function stopBackend(proc: BackendProcess): Promise<void> {
  if (!proc.process) {
    console.log('[backend] No process to stop (was reused)');
    return;
  }

  const { port, process: childProc } = proc;

  console.log('[backend] Shutting down...');

  try {
    await new Promise<void>((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port,
        path: '/actuator/shutdown',
        method: 'POST',
        timeout: 3000,
      }, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => resolve());
      req.end();
    });
  } catch {
    // Fall through to SIGTERM
  }

  childProc.kill('SIGTERM');

  const exited = await new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(false), 5000);
    childProc.on('exit', () => {
      clearTimeout(timer);
      resolve(true);
    });
  });

  if (!exited) {
    console.log('[backend] Force killing backend process');
    childProc.kill('SIGKILL');
  }

  console.log('[backend] Stopped');
}
