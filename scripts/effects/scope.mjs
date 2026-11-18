#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { id: '', base: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) {
      result.id = args[++i];
    } else if (args[i] === '--base' && args[i + 1]) {
      result.base = args[++i];
    }
  }
  return result;
}

function runGit(args) {
  try {
    const stdout = execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return stdout.trim();
  } catch (err) {
    console.warn(`Git command "git ${args.join(' ')}" returned warning/error:`, err.message);
    return '';
  }
}

async function main() {
  const { id, base } = parseArgs();

  if (!id) {
    console.error('Error: Missing required --id parameter.');
    console.error('Usage: npm run effects:scope -- --id <effect-id> [--base <sha-or-branch>]');
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`Checking Workspace Boundary Scope for "${id}"`);
  console.log(`Baseline reference: ${base || '(current worktree uncommitted only)'}`);
  console.log(`========================================\n`);

  const changedFiles = new Set();

  // 1. Committed diff if base is provided
  if (base) {
    const committedDiff = runGit(['diff', '--name-only', base, 'HEAD']);
    if (committedDiff) {
      for (const line of committedDiff.split('\n')) {
        const clean = line.trim().replace(/\\/g, '/');
        if (clean) changedFiles.add(clean);
      }
    }
  }

  // 2. Staged changes
  const stagedDiff = runGit(['diff', '--cached', '--name-only']);
  if (stagedDiff) {
    for (const line of stagedDiff.split('\n')) {
      const clean = line.trim().replace(/\\/g, '/');
      if (clean) changedFiles.add(clean);
    }
  }

  // 3. Unstaged changes
  const unstagedDiff = runGit(['diff', '--name-only']);
  if (unstagedDiff) {
    for (const line of unstagedDiff.split('\n')) {
      const clean = line.trim().replace(/\\/g, '/');
      if (clean) changedFiles.add(clean);
    }
  }

  // 4. Untracked files via git status --porcelain
  const statusOutput = runGit(['status', '--porcelain', '-uall']);
  if (statusOutput) {
    for (const line of statusOutput.split('\n')) {
      if (!line.trim()) continue;
      // Format is XY <path> or ?? <path>
      const match = line.match(/^..\s+(.*)$/);
      const filePath = (match ? match[1] : line.slice(3)).trim().replace(/\\/g, '/');
      if (filePath) changedFiles.add(filePath);
    }
  }

  const allowedPrefixes = [
    `src/effects/${id}/`,
    `.local/${id}/`,
  ];

  const violations = [];

  for (const file of changedFiles) {
    const isAllowed = allowedPrefixes.some((prefix) => file.startsWith(prefix));
    if (!isAllowed) {
      violations.push(file);
    }
  }

  if (violations.length > 0) {
    console.error(`FAIL: Boundary Violation! Found ${violations.length} modified/untracked file(s) outside permitted scope:`);
    for (const v of violations) {
      console.error(`  [VIOLATION] -> ${v}`);
    }
    console.error(`\nWorkers are strictly restricted to:`);
    console.error(`  - src/effects/${id}/**`);
    console.error(`  - .local/${id}/**`);
    console.error(`\nPlease revert or stash unauthorized modifications before handing off.`);
    console.log(`========================================\n`);
    process.exit(1);
  } else {
    console.log(`PASS: All ${changedFiles.size} modified/created files are strictly within allowed scope:`);
    console.log(`  - src/effects/${id}/**`);
    console.log(`  - .local/${id}/**`);
    console.log(`\nNo cross-contamination or root alterations detected.`);
    console.log(`========================================\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Scope runner failed:', err);
  process.exit(1);
});
