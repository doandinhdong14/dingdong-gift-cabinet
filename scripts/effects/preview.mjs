#!/usr/bin/env node
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { id: '', port: 5211 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) {
      result.id = args[++i];
    } else if (args[i] === '--port' && args[i + 1]) {
      result.port = parseInt(args[++i], 10);
    }
  }
  return result;
}

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });
    server.listen(port, '127.0.0.1');
  });
}

async function main() {
  const { id, port } = parseArgs();

  if (!id) {
    console.error('Error: Missing required --id parameter.');
    console.error('Usage: npm run effects:preview -- --id <effect-id> [--port <port>]');
    process.exit(1);
  }

  console.log(`Checking port availability on port ${port}...`);
  const isAvailable = await checkPortAvailable(port);
  if (!isAvailable) {
    console.error(`\nError: Port ${port} is currently occupied by another process!`);
    console.error(`To maintain environment isolation, Vite will NOT automatically jump ports.`);
    console.error(`Please close any existing dev server running on port ${port} or assign an alternate port.\n`);
    process.exit(1);
  }

  const previewUrl = `http://localhost:${port}/#/effects/${id}`;

  console.log(`\n========================================`);
  console.log(`Starting Preview Host for Effect: "${id}"`);
  console.log(`Direct Preview URL: ${previewUrl}`);
  console.log(`Port: ${port} (Strict)`);
  console.log(`========================================\n`);

  const isWindows = process.platform === 'win32';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';

  const proc = spawn(npxCmd, ['vite', '--port', String(port), '--strictPort'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: isWindows,
  });

  proc.on('error', (err) => {
    console.error('Failed to spawn preview server:', err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Preview launcher error:', err);
  process.exit(1);
});
