import esbuild from 'esbuild';
import fs, { rmSync } from 'fs';
import path from 'path';

// Clean dist folder
if (fs.existsSync('dist')) rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist');

// Read package.json to get version and repo
const pkgPath = path.resolve('./package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const currentYear = new Date().getFullYear();

// Automatic banner
const banner = `/*! ParamTracker ${pkg.version} | MIT License | (c) Jonas Souza 2023-${currentYear} | ${pkg.repository?.url || ''} */`;

// Create dist folder if it does not exist
if (!fs.existsSync('dist')) fs.mkdirSync('dist');

async function build() {
  console.log('Building ParamTracker...');

  // Build minified UMD / Browser / Node
  await esbuild.build({
    entryPoints: ['src/tracker.browser.js'],
    bundle: true,
    format: 'iife',
    minify: true,
    sourcemap: false,
    outfile: 'dist/tracker.min.js',
    banner: { js: banner },
    treeShaking: false,
  });

  // Build unminified UMD / Browser / Node
  await esbuild.build({
    entryPoints: ['src/tracker.browser.js'],
    bundle: true,
    format: 'iife',
    minify: false,
    sourcemap: false,
    outfile: 'dist/tracker.js',
    banner: { js: banner },
    treeShaking: false,
  });

  // Build minified ESM
  await esbuild.build({
    entryPoints: ['src/tracker.js'],
    bundle: true,
    format: 'esm',
    minify: true,
    sourcemap: false,
    outfile: 'dist/tracker.esm.min.js',
    banner: { js: banner },
  });

  // Build unminified ESM
  await esbuild.build({
    entryPoints: ['src/tracker.js'],
    bundle: true,
    format: 'esm',
    minify: false,
    sourcemap: false,
    outfile: 'dist/tracker.esm.js',
    banner: { js: banner },
  });

  // Build minified CommonJS
  await esbuild.build({
    entryPoints: ['src/tracker.js'],
    bundle: true,
    format: 'cjs',
    minify: true,
    sourcemap: false,
    outfile: 'dist/tracker.cjs.min.js',
    banner: { js: banner },
  });

  // Build unminified CommonJS
  await esbuild.build({
    entryPoints: ['src/tracker.js'],
    bundle: true,
    format: 'cjs',
    minify: false,
    sourcemap: false,
    outfile: 'dist/tracker.cjs.js',
    banner: { js: banner },
  });

  console.log('Build completed successfully!');
}

// Run build
build().catch((err) => {
  console.error(err);
  process.exit(1);
});
