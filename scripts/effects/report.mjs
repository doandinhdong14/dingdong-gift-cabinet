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
  const result = { file: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      result.file = args[++i];
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
  } catch {
    return null;
  }
}

async function main() {
  const { file } = parseArgs();

  if (!file) {
    console.error('Error: Missing required --file parameter.');
    console.error('Usage: npm run effects:report -- --file <path/to/batch.json>');
    process.exit(1);
  }

  const batchFilePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(batchFilePath)) {
    console.error(`Error: Batch file not found: ${batchFilePath}`);
    process.exit(1);
  }

  const batchData = JSON.parse(fs.readFileSync(batchFilePath, 'utf8'));
  const { batchId, tasks, outputDir = '../dingdong-gift-workers' } = batchData;

  const baseOutputDir = path.resolve(repoRoot, outputDir, batchId);

  const reportRows = [];

  for (const t of tasks) {
    const branchName = `effect/${batchId}/${t.slot}`;
    const workspacePath = path.resolve(baseOutputDir, `agent-${t.slot}`);
    const effectDir = path.join(workspacePath, 'src', 'effects', t.id);

    let status = 'not-started';
    let headCommit = 'N/A';
    let hasHandoff = false;
    let hasQA = false;
    let hasRequests = false;

    if (fs.existsSync(workspacePath)) {
      headCommit = runGit(['rev-parse', '--short', branchName]) || 'unknown';

      if (fs.existsSync(effectDir)) {
        const manifestPath = path.join(effectDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            status = m.status || 'draft';
          } catch {
            status = 'invalid-manifest';
          }
        }
        hasHandoff = fs.existsSync(path.join(effectDir, 'HANDOFF.md'));
        hasQA = fs.existsSync(path.join(effectDir, 'QA.md'));
        hasRequests = fs.existsSync(path.join(effectDir, 'REQUESTS.md'));
      }
    }

    reportRows.push({
      slot: t.slot,
      effectId: t.id,
      kind: t.kind,
      branch: branchName,
      head: headCommit,
      status,
      handoff: hasHandoff ? 'YES' : 'NO',
      qa: hasQA ? 'YES' : 'NO',
      requests: hasRequests ? 'YES' : 'none',
      port: t.port,
    });
  }

  console.log(`\n========================================`);
  console.log(`COORDINATOR STATUS REPORT: BATCH ${batchId}`);
  console.log(`========================================\n`);

  console.table(reportRows);
}

main().catch((err) => {
  console.error('Report generator failed:', err);
  process.exit(1);
});
