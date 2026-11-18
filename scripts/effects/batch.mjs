#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { file: '', dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      result.file = args[++i];
    } else if (args[i] === '--dry-run') {
      result.dryRun = true;
    }
  }
  return result;
}

function runGit(args, cwd = repoRoot) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    throw new Error(`git ${args.join(' ')} failed: ${err.message}`);
  }
}

async function main() {
  const { file, dryRun } = parseArgs();

  if (!file) {
    console.error('Error: Missing required --file parameter.');
    console.error('Usage: npm run effects:batch -- --file <path/to/batch.json> [--dry-run]');
    process.exit(1);
  }

  const batchFilePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(batchFilePath)) {
    console.error(`Error: Batch file not found: ${batchFilePath}`);
    process.exit(1);
  }

  const batchData = JSON.parse(fs.readFileSync(batchFilePath, 'utf8'));
  const { batchId, tasks, outputDir = '../dingdong-gift-workers' } = batchData;

  if (!batchId || !Array.isArray(tasks) || tasks.length === 0) {
    console.error('Error: Invalid batch.json. Must contain "batchId" and a non-empty "tasks" array.');
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`Preparing Batch "${batchId}" with ${tasks.length} Task(s)`);
  console.log(`Dry-run mode: ${dryRun ? 'YES' : 'NO'}`);
  console.log(`========================================\n`);

  // 1. Validate Tasks for collisions
  const seenIds = new Set();
  const seenSlots = new Set();
  const seenPorts = new Set();

  for (const t of tasks) {
    if (!t.id || !t.slot || !t.port) {
      console.error(`Error: Task is missing id, slot, or port:`, t);
      process.exit(1);
    }
    if (seenIds.has(t.id)) {
      console.error(`Error: Duplicate effectId "${t.id}" in batch!`);
      process.exit(1);
    }
    seenIds.add(t.id);

    if (seenSlots.has(t.slot)) {
      console.error(`Error: Duplicate slot "${t.slot}" in batch!`);
      process.exit(1);
    }
    seenSlots.add(t.slot);

    if (seenPorts.has(t.port)) {
      console.error(`Error: Duplicate port ${t.port} in batch!`);
      process.exit(1);
    }
    seenPorts.add(t.port);
  }

  // 2. Resolve baseline commit
  let baselineCommit = batchData.baselineCommit || 'HEAD';
  try {
    baselineCommit = runGit(['rev-parse', baselineCommit]);
  } catch (err) {
    console.error(`Error resolving baseline commit: ${err.message}`);
    process.exit(1);
  }
  console.log(`Baseline commit resolved to: ${baselineCommit}`);

  const templateDir = path.join(repoRoot, 'templates', 'effect');
  const baseOutputDir = path.resolve(repoRoot, outputDir, batchId);

  const results = [];

  for (const task of tasks) {
    const branchName = `effect/${batchId}/${task.slot}`;
    const workspacePath = path.resolve(baseOutputDir, `agent-${task.slot}`);

    console.log(`\n--- Preparing Slot ${task.slot} : ${task.id} (${task.kind}) ---`);
    console.log(`Branch:    ${branchName}`);
    console.log(`Workspace: ${workspacePath}`);
    console.log(`Port:      ${task.port}`);

    if (!dryRun) {
      // 1. Create worktree
      if (fs.existsSync(workspacePath)) {
        console.warn(`Warning: Workspace path ${workspacePath} already exists. Skipping git worktree add.`);
      } else {
        fs.mkdirSync(path.dirname(workspacePath), { recursive: true });
        console.log(`Adding git worktree...`);
        try {
          runGit(['worktree', 'add', '-b', branchName, workspacePath, baselineCommit]);
        } catch (err) {
          console.error(`Worktree creation failed: ${err.message}`);
          console.log(`Attempting checkout existing branch if already created...`);
          runGit(['worktree', 'add', workspacePath, branchName]);
        }
      }

      // 2. Scaffold effect in the newly created worktree
      const effectDir = path.join(workspacePath, 'src', 'effects', task.id);
      if (!fs.existsSync(effectDir)) {
        fs.mkdirSync(effectDir, { recursive: true });

        // Copy template
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
                .replaceAll('__EFFECT_ID__', task.id)
                .replaceAll('__EFFECT_NAME__', task.name || task.id)
                .replaceAll('__EFFECT_KIND__', task.kind || 'object3d')
                .replaceAll('__EFFECT_DESC__', task.desc || task.name || task.id)
                .replaceAll('__TASK_ID__', `task-${batchId}-${task.slot}`)
                .replaceAll('__BATCH_ID__', batchId)
                .replaceAll('__SLOT__', task.slot)
                .replaceAll('__PORT__', String(task.port))
                .replaceAll('__BASELINE_COMMIT__', baselineCommit);

              fs.writeFileSync(dest, content, 'utf8');
            }
          }
        }

        copyRecursive(templateDir, effectDir);
      }

      // 3. Create .local references directory
      const localRefDir = path.join(workspacePath, '.local', task.id, 'references');
      fs.mkdirSync(localRefDir, { recursive: true });

      // Copy any reference files
      if (Array.isArray(task.referenceFiles)) {
        for (const refFile of task.referenceFiles) {
          const resolvedSrc = path.resolve(repoRoot, refFile);
          if (fs.existsSync(resolvedSrc)) {
            const destFile = path.join(localRefDir, path.basename(refFile));
            fs.copyFileSync(resolvedSrc, destFile);
            console.log(`Copied reference file: ${path.basename(refFile)}`);
          }
        }
      }
    }

    results.push({
      slot: task.slot,
      id: task.id,
      branch: branchName,
      workspace: workspacePath,
      port: task.port,
      previewCmd: `npm run effects:preview -- --id ${task.id} --port ${task.port}`,
    });
  }

  console.log(`\n========================================`);
  console.log(`BATCH "${batchId}" READY! Allocation Summary:`);
  console.log(`========================================\n`);

  console.table(results);
}

main().catch((err) => {
  console.error('Batch setup failed:', err);
  process.exit(1);
});
