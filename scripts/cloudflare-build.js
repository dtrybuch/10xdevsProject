// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

/**
 * This script handles building for Cloudflare with React 18 compatibility
 */
async function main() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '..');
    
    console.log('Preparing for Cloudflare build...');
    
    // Check if dist directory exists from previous builds
    const distDir = path.resolve(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      console.log('Removing existing dist directory...');
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    
    // Temporarily modify package.json to use React 18
    const packageJsonPath = path.resolve(rootDir, 'package.json');
    const originalPackageJson = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(originalPackageJson);
    
    // Store original React versions
    const originalReact = packageJson.dependencies.react;
    const originalReactDom = packageJson.dependencies['react-dom'];
    
    console.log(`Original React version: ${originalReact}`);
    console.log(`Original React DOM version: ${originalReactDom}`);
    
    // Update to React 18
    packageJson.dependencies.react = '18.2.0';
    packageJson.dependencies['react-dom'] = '18.2.0';
    
    // Write modified package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    try {
      // Install React 18 dependencies
      console.log('Installing React 18 dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      
      // Build with Astro
      console.log('Building with Astro...');
      execSync('astro build', { stdio: 'inherit' });
      
      // Check if dist directory was created
      if (!fs.existsSync(distDir)) {
        console.error('Error: dist directory was not created by the build process');
        process.exit(1);
      }
      
      // Print diagnostic information about the dist directory
      console.log('Analyzing dist directory structure:');
      printDirectoryStructure(distDir);
      
      // Patch build output with MessageChannel polyfill
      await patchBuildOutput(rootDir);
    } finally {
      // Restore original package.json
      console.log('Restoring original React versions...');
      packageJson.dependencies.react = originalReact;
      packageJson.dependencies['react-dom'] = originalReactDom;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      // Reinstall original dependencies
      console.log('Reinstalling original dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    console.log('Cloudflare build completed successfully!');
  } catch (error) {
    console.error('Error during build process:', error);
    process.exit(1);
  }
}

/**
 * Print the directory structure to help diagnose issues
 * @param {string} dir - The directory to print the structure of
 * @param {number} level - Current recursion level
 */
function printDirectoryStructure(dir, level = 0) {
  try {
    if (!fs.existsSync(dir)) {
      console.log(`${' '.repeat(level * 2)}Directory does not exist: ${dir}`);
      return;
    }
    
    const stats = fs.statSync(dir);
    if (!stats.isDirectory()) {
      console.log(`${' '.repeat(level * 2)}Not a directory: ${dir}`);
      return;
    }
    
    console.log(`${' '.repeat(level * 2)}${path.basename(dir)}/`);
    
    const files = fs.readdirSync(dir);
    
    // Sort files and directories
    const dirs = [];
    const regularFiles = [];
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          dirs.push(file);
        } else {
          regularFiles.push(file);
        }
      } catch (/** @type {any} */ err) {
        console.log(`${' '.repeat((level + 1) * 2)}Error accessing ${file}: ${err.message}`);
      }
    }
    
    // Print directories first, then files
    for (const subdir of dirs) {
      printDirectoryStructure(path.join(dir, subdir), level + 1);
    }
    
    for (const file of regularFiles) {
      console.log(`${' '.repeat((level + 1) * 2)}${file} (${Math.round(fs.statSync(path.join(dir, file)).size / 1024)}KB)`);
    }
  } catch (/** @type {any} */ err) {
    console.log(`${' '.repeat(level * 2)}Error scanning directory ${dir}: ${err.message}`);
  }
}

/**
 * Patch build output files with MessageChannel polyfill
 * @param {string} rootDir - Root directory of the project
 */
async function patchBuildOutput(rootDir) {
  // Define the polyfill code
  const polyfill = `
// MessageChannel polyfill for Cloudflare Workers
if (typeof globalThis.MessageChannel === 'undefined') {
  class MessagePort {
    onmessage = null;
    postMessage(data) {
      if (this.paired && this.paired.onmessage) {
        const event = { data };
        setTimeout(() => {
          if (this.paired?.onmessage) this.paired.onmessage(event);
        }, 0);
      }
    }
    start() {}
    close() {}
    paired = null;
  }

  class MessageChannelPolyfill {
    port1;
    port2;

    constructor() {
      this.port1 = new MessagePort();
      this.port2 = new MessagePort();
      this.port1.paired = this.port2;
      this.port2.paired = this.port1;
    }
  }

  globalThis.MessageChannel = MessageChannelPolyfill;
  globalThis.MessagePort = MessagePort;
}
`;

  try {
    const distDir = path.resolve(rootDir, 'dist');
    
    // Find and patch the main worker file
    const workerFiles = [
      path.resolve(distDir, '_worker.js'),
      path.resolve(distDir, 'server/entry.mjs'),
      path.resolve(distDir, 'functions/[[path]].js')
    ];
    
    let patchedMainWorker = false;
    for (const file of workerFiles) {
      try {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          if (stats.isFile()) {
            console.log(`Patching main worker file: ${file}`);
            const content = fs.readFileSync(file, 'utf8');
            fs.writeFileSync(file, polyfill + content);
            patchedMainWorker = true;
          } else {
            console.warn(`Skipping ${file} - not a file`);
          }
        }
      } catch (/** @type {any} */ err) {
        console.warn(`Error processing potential worker file ${file}: ${err.message}`);
      }
    }
    
    if (!patchedMainWorker) {
      console.warn('Could not find main worker file to patch. Searching for alternatives...');
      
      // Find all possible JS files in dist
      /** @type {string[]} */
      const allJsFiles = [];
      findAllJsFiles(distDir, allJsFiles);
      
      console.log(`Found ${allJsFiles.length} JavaScript files to check.`);
      
      // Look for files that might be entry points or contain React code
      let patchCount = 0;
      for (const file of allJsFiles) {
        try {
          const stats = fs.statSync(file);
          if (!stats.isFile()) {
            console.warn(`Skipping ${file} - not a file`);
            continue;
          }
          
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('ReactDOM') || 
              content.includes('react-dom') || 
              file.includes('entry') || 
              file.includes('worker')) {
            console.log(`Patching possible React file: ${file}`);
            fs.writeFileSync(file, polyfill + content);
            patchCount++;
          }
        } catch (/** @type {any} */ err) {
          console.warn(`Error processing file ${file}: ${err.message}`);
        }
      }
      
      console.log(`Patched ${patchCount} JavaScript files with MessageChannel polyfill.`);
    }
    
    console.log('Build output patching completed.');
  } catch (/** @type {any} */ error) {
    console.error('Error patching build output:', error.message);
    throw error;
  }
}

/**
 * Find all JavaScript files in a directory
 * @param {string} dir - Directory to search
 * @param {string[]} results - Array to collect results
 */
function findAllJsFiles(dir, results) {
  try {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory does not exist: ${dir}`);
      return;
    }

    const stats = fs.statSync(dir);
    if (!stats.isDirectory()) {
      console.warn(`Not a directory: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          findAllJsFiles(filePath, results);
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.mjs'))) {
          results.push(filePath);
        }
      } catch (/** @type {any} */ err) {
        console.warn(`Error processing ${filePath}: ${err.message}`);
      }
    }
  } catch (/** @type {any} */ err) {
    console.warn(`Error scanning directory ${dir}: ${err.message}`);
  }
}

main(); 