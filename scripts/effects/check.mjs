#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { id: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) {
      result.id = args[++i];
    }
  }
  return result;
}

function runCommand(command, args, cwd) {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows && !command.endsWith('.cmd') && !command.endsWith('.exe') ? `${command}.cmd` : command;

    const proc = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
    });

    proc.on('close', (code) => {
      resolve(code === 0);
    });

    proc.on('error', (err) => {
      console.error(`Failed to execute ${command}:`, err.message);
      resolve(false);
    });
  });
}

const IMPORT_REGEX = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

function checkImportBoundaries(effectId, effectDir) {
  const violations = [];

  function scanDir(dir) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (item === 'node_modules' || item === '.git') continue;
        scanDir(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        let match;
        while ((match = IMPORT_REGEX.exec(content)) !== null) {
          const importTarget = match[1] || match[2];
          if (!importTarget) continue;

          // Check cross-effect import
          if (importTarget.includes('/effects/') && !importTarget.includes(`/effects/${effectId}`)) {
            violations.push({
              file: path.relative(repoRoot, fullPath),
              import: importTarget,
              reason: 'Cross-effect import violation (importing from another effect package)',
            });
          }

          // Check unauthorized legacy/host import
          if (
            importTarget.startsWith('../') ||
            importTarget.startsWith('../../')
          ) {
            const resolved = path.resolve(path.dirname(fullPath), importTarget);
            const relativeToSrc = path.relative(path.join(repoRoot, 'src'), resolved).replace(/\\/g, '/');

            // If it escapes src/effects/<id>, it MUST be effect-sdk or shared-assets
            if (!relativeToSrc.startsWith(`effects/${effectId}`)) {
              if (
                !relativeToSrc.startsWith('effect-sdk') &&
                !relativeToSrc.startsWith('shared-assets')
              ) {
                violations.push({
                  file: path.relative(repoRoot, fullPath),
                  import: importTarget,
                  resolved: relativeToSrc,
                  reason: 'Unauthorized internal import (only effect-sdk and shared-assets are allowed)',
                });
              }
            }
          }
        }
      }
    }
  }

  scanDir(effectDir);
  return violations;
}

async function main() {
  const { id } = parseArgs();
  if (!id) {
    console.error('Error: Missing required --id parameter.');
    console.error('Usage: npm run effects:check -- --id <effect-id>');
    process.exit(1);
  }

  const effectDir = path.join(repoRoot, 'src', 'effects', id);
  if (!fs.existsSync(effectDir)) {
    console.error(`Error: Effect directory not found: ${effectDir}`);
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`Running Technical Checks for "${id}"`);
  console.log(`========================================\n`);

  let allPassed = true;

  // 1. Manifest Validation
  console.log('[1/4] Checking manifest.json...');
  const manifestPath = path.join(effectDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('FAIL: Missing manifest.json in package.');
    allPassed = false;
  } else {
    try {
      const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (rawManifest.id !== id) {
        console.error(`FAIL: manifest.id "${rawManifest.id}" does not match package folder "${id}"`);
        allPassed = false;
      } else {
        console.log('PASS: manifest.json ID matches folder.');
      }
    } catch (err) {
      console.error('FAIL: Corrupt or unparseable manifest.json:', err.message);
      allPassed = false;
    }
  }

  // 2. Import Boundary Validation
  console.log('\n[2/4] Checking import boundaries...');
  const importViolations = checkImportBoundaries(id, effectDir);
  if (importViolations.length > 0) {
    console.error(`FAIL: Found ${importViolations.length} import boundary violation(s):`);
    for (const v of importViolations) {
      console.error(`  - ${v.file}: "${v.import}" -> ${v.reason}`);
    }
    allPassed = false;
  } else {
    console.log('PASS: All imports strictly respect package boundaries (SDK/shared-assets only).');
  }

  // 3. Package Unit Tests
  console.log('\n[3/4] Running package tests...');
  const testsDir = path.join(effectDir, 'tests');
  if (fs.existsSync(testsDir)) {
    const testSuccess = await runCommand(
      'npx',
      ['vitest', 'run', path.relative(repoRoot, testsDir).replace(/\\/g, '/')],
      repoRoot
    );
    if (!testSuccess) {
      console.error('FAIL: Unit tests failed.');
      allPassed = false;
    } else {
      console.log('PASS: Package unit tests passed.');
    }
  } else {
    console.log('NOTE: No tests/ folder found in package.');
  }

  // 4. Typecheck
  console.log('\n[4/4] Running TypeScript typecheck...');
  const tscSuccess = await runCommand('npx', ['tsc', '--noEmit'], repoRoot);
  if (!tscSuccess) {
    console.error('FAIL: TypeScript compilation errors detected.');
    allPassed = false;
  } else {
    console.log('PASS: TypeScript compilation clean.');
  }

  console.log('\n========================================');
  if (allPassed) {
    console.log(`ALL CHECKS PASSED for effect "${id}"!`);
    console.log('========================================\n');
    process.exit(0);
  } else {
    console.error(`CHECKS FAILED for effect "${id}". Please resolve errors above.`);
    console.log('========================================\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Check runner failed:', err);
  process.exit(1);
});
