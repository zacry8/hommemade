#!/usr/bin/env node

/**
 * Portfolio Watcher Script
 * 
 * Watches the /portfolio folder for changes and automatically
 * regenerates portfolio.json when files are added/removed.
 * 
 * Usage:
 *   npm install chokidar
 *   node scripts/watch-portfolio.js
 */

import chokidar from 'chokidar';
import { generatePortfolioConfig, scanPortfolioFolder } from './generate-portfolio.js';
import fs from 'fs';
import path from 'path';

const PORTFOLIO_DIR = './portfolio';
const OUTPUT_FILE = './public/data/portfolio.json';

let isGenerating = false;

function regeneratePortfolio() {
  if (isGenerating) return;
  
  isGenerating = true;
  console.log('🔄 Portfolio folder changed, regenerating...');
  
  try {
    const sections = scanPortfolioFolder();
    const config = generatePortfolioConfig(sections);
    
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2), 'utf8');
    console.log('✅ Portfolio updated successfully!');
    
  } catch (error) {
    console.error('❌ Error regenerating portfolio:', error.message);
  }
  
  setTimeout(() => {
    isGenerating = false;
  }, 1000); // Debounce
}

function startWatcher() {
  console.log('👀 Portfolio Watcher');
  console.log('='.repeat(40));
  console.log(`Watching: ${PORTFOLIO_DIR}`);
  console.log('Press Ctrl+C to stop\n');

  // Watch for file changes in portfolio directory
  const watcher = chokidar.watch(PORTFOLIO_DIR, {
    ignored: /[\/\\]\./,
    persistent: true,
    ignoreInitial: true,
    depth: 2 // Only watch 2 levels deep
  });

  // File events
  watcher
    .on('add', path => {
      console.log(`📁 File added: ${path}`);
      regeneratePortfolio();
    })
    .on('unlink', path => {
      console.log(`🗑️  File removed: ${path}`);
      regeneratePortfolio();
    })
    .on('addDir', path => {
      console.log(`📂 Directory added: ${path}`);
      regeneratePortfolio();
    })
    .on('unlinkDir', path => {
      console.log(`📂 Directory removed: ${path}`);
      regeneratePortfolio();
    })
    .on('error', error => {
      console.error('❌ Watcher error:', error);
    });

  // Initial generation
  regeneratePortfolio();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping portfolio watcher...');
    watcher.close();
    process.exit(0);
  });
}

// Start the watcher
startWatcher();