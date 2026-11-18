#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    id: '',
    kind: 'object3d',
    name: '',
    desc: '',
    slot: '01',
    port: 5211,
    batchId: 'batch-001',
    baseline: 'main',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) {
      result.id = args[++i];
    } else if (args[i] === '--kind' && args[i + 1]) {
      result.kind = args[++i];
    } else if (args[i] === '--name' && args[i + 1]) {
      result.name = args[++i];
    } else if (args[i] === '--desc' && args[i + 1]) {
      result.desc = args[++i];
    } else if (args[i] === '--slot' && args[i + 1]) {
      result.slot = args[++i];
    } else if (args[i] === '--port' && args[i + 1]) {
      result.port = parseInt(args[++i], 10);
    } else if (args[i] === '--batch' && args[i + 1]) {
      result.batchId = args[++i];
    } else if (args[i] === '--baseline' && args[i + 1]) {
      result.baseline = args[++i];
    }
  }

  return result;
}

const KEBAB_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VALID_KINDS = ['object3d', 'background', 'scene', 'transition', 'overlay2d'];

async function main() {
  const opts = parseArgs();

  if (!opts.id) {
    console.error('Error: Missing required --id parameter.');
    console.error('Usage: npm run effects:create -- --id <effect-id> [--kind <kind>] [--name <name>]');
    process.exit(1);
  }

  if (!KEBAB_REGEX.test(opts.id)) {
    console.error(`Error: Invalid ID "${opts.id}". Must be lowercase kebab-case (e.g. "rose-reveal-01").`);
    process.exit(1);
  }

  if (!VALID_KINDS.includes(opts.kind)) {
    console.error(`Error: Invalid kind "${opts.kind}". Must be one of: ${VALID_KINDS.join(', ')}`);
    process.exit(1);
  }

  const targetDir = path.join(repoRoot, 'src', 'effects', opts.id);
  const templateDir = path.join(repoRoot, 'templates', 'effect');

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Effect directory already exists at ${targetDir}. Refusing to overwrite.`);
    process.exit(1);
  }

  if (!fs.existsSync(templateDir)) {
    console.error(`Error: Template directory not found at ${templateDir}`);
    process.exit(1);
  }

  const effectName = opts.name || opts.id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const effectDesc = opts.desc || `Hiệu ứng ${effectName}`;

  console.log(`Creating effect package: "${opts.id}" (${opts.kind}) at ${targetDir}...`);

  fs.mkdirSync(targetDir, { recursive: true });

  // Recursively copy template and replace placeholders
  function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      for (const child of fs.readdirSync(src)) {
        copyRecursive(path.join(src, child), path.join(dest, child));
      }
    } else {
      const ext = path.extname(src);
      const isBinary = ['.webp', '.png', '.jpg', '.glb', '.mp3'].includes(ext);

      if (isBinary) {
        fs.copyFileSync(src, dest);
      } else {
        let content = fs.readFileSync(src, 'utf8');
        content = content
          .replaceAll('__EFFECT_ID__', opts.id)
          .replaceAll('__EFFECT_NAME__', effectName)
          .replaceAll('__EFFECT_KIND__', opts.kind)
          .replaceAll('__EFFECT_DESC__', effectDesc)
          .replaceAll('__TASK_ID__', `task-${opts.id}`)
          .replaceAll('__BATCH_ID__', opts.batchId)
          .replaceAll('__SLOT__', opts.slot)
          .replaceAll('__PORT__', String(opts.port))
          .replaceAll('__BASELINE_COMMIT__', opts.baseline);

        fs.writeFileSync(dest, content, 'utf8');
      }
    }
  }

  copyRecursive(templateDir, targetDir);

  // Ensure .local reference directory exists
  const localRefDir = path.join(repoRoot, '.local', opts.id, 'references');
  fs.mkdirSync(localRefDir, { recursive: true });

  console.log(`Successfully created effect package at: ${targetDir}`);
  console.log(`To preview: npm run effects:preview -- --id ${opts.id} --port ${opts.port}`);
  console.log(`To check:   npm run effects:check -- --id ${opts.id}`);
}

main().catch((err) => {
  console.error('Failed to create effect scaffold:', err);
  process.exit(1);
});
