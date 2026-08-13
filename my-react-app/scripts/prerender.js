import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const pkgPath = join(root, 'package.json');

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const executablePath = candidates.find((p) => existsSync(p));

const original = readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(original);
pkg.reactSnap = pkg.reactSnap || {};
if (executablePath) {
  pkg.reactSnap.puppeteerExecutablePath = executablePath;
} else {
  delete pkg.reactSnap.puppeteerExecutablePath;
}
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

try {
  console.log(
    executablePath
      ? `[prerender] using browser: ${executablePath}`
      : '[prerender] no system browser found, relying on bundled Chromium'
  );

  const result = spawnSync(
    process.execPath,
    [join(root, 'node_modules', 'react-snap', 'run.js')],
    { stdio: 'inherit', cwd: root }
  );

  if (result.status !== 0) {
    console.warn(
      '[prerender] react-snap failed — continuing with the regular SPA build (dist still deployed).'
    );
  }
} finally {
  writeFileSync(pkgPath, original);
}
