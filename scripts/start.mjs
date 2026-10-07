import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const processes = [];
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of processes) child.kill();
}

function start(directory, args) {
  const child = spawn(process.execPath, args, {
    cwd: fileURLToPath(new URL(directory, root)),
    stdio: 'inherit',
  });
  processes.push(child);
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) stop(code ?? 1);
  });
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

start('api/', ['dist/src/main.js']);
start('ui/', [
  'node_modules/vite/bin/vite.js',
  'preview',
  '--port',
  '3001',
  '--strictPort',
]);
