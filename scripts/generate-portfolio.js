#!/usr/bin/env node

/**
 * Portfolio Generator Script
 * 
 * Automatically scans the /portfolio folder structure and generates
 * portfolio.json configuration file.
 * 
 * Usage:
 *   node scripts/generate-portfolio.js
 * 
 * Requirements:
 *   npm install fs path
 */

import fs from 'fs';
import path from 'path';

// Configuration
const PORTFOLIO_DIR = './portfolio';
const OUTPUT_FILE = './public/data/portfolio.json';
const SUPPORTED_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  videos: ['.mp4', '.webm', '.mov', '.avi'],
  documents: ['.pdf']
};

// Utility functions
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  if (SUPPORTED_EXTENSIONS.images.includes(ext)) return 'image';
  if (SUPPORTED_EXTENSIONS.videos.includes(ext)) return 'video';
  if (SUPPORTED_EXTENSIONS.documents.includes(ext)) return 'pdf';
  
  return 'unknown';
}

function formatTitle(filename) {
  // Remove extension and convert to title case
  const name = path.parse(filename).name;
  return name
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function parseFilename(filename) {
  // Support format: title__description__tags.ext
  const name = path.parse(filename).name;
  const parts = name.split('__');
  
  return {
    title: formatTitle(parts[0] || name),
    description: parts[1] || '',
    tags: parts[2] ? parts[2].split('-') : []
  };
}

function scanPortfolioFolder() {
  if (!fs.existsSync(PORTFOLIO_DIR)) {
    console.error(`Portfolio directory '${PORTFOLIO_DIR}' not found!`);
    console.log('Please create the portfolio folder structure first.');
    process.exit(1);
  }

  const sections = [];
  const folders = fs.readdirSync(PORTFOLIO_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();

  console.log(`Found ${folders.length} portfolio sections:`);

  folders.forEach((folder, index) => {
    console.log(`  - ${folder}`);
    
    const folderPath = path.join(PORTFOLIO_DIR, folder);
    const files = fs.readdirSync(folderPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return Object.values(SUPPORTED_EXTENSIONS).flat().includes(ext);
      })
      .sort();

    const media = files.map(file => {
      const filePath = path.join(folderPath, file);
      const relativePath = path.join('portfolio', folder, file);
      const fileInfo = parseFilename(file);
      const type = getFileType(file);

      return {
        src: relativePath.replace(/\\/g, '/'), // Ensure forward slashes for web
        title: fileInfo.title,
        description: fileInfo.description || `${fileInfo.title} from ${folder} collection`,
        type: type,
        tags: fileInfo.tags
      };
    });

    // Use first image as thumbnail, fallback to placeholder
    const thumbnail = media.find(m => m.type === 'image')?.src || 
                     'https://via.placeholder.com/400x300?text=' + encodeURIComponent(folder);

    sections.push({
      id: folder.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: formatTitle(folder),
      description: `${formatTitle(folder)} portfolio collection`,
      thumbnail: thumbnail,
      media: media
    });

    console.log(`    Found ${files.length} media files`);
  });

  return sections;
}

function generatePortfolioConfig(sections) {
  const config = {
    gallery: {
      title: "Creative Portfolio",
      description: "A showcase of creative work and projects",
      sections: sections
    },
    settings: {
      autoPlay: false,
      showTitles: true,
      showDescriptions: true,
      lazyLoad: true,
      thumbnailQuality: "medium"
    },
    generated: {
      timestamp: new Date().toISOString(),
      totalSections: sections.length,
      totalMedia: sections.reduce((sum, section) => sum + section.media.length, 0)
    }
  };

  return config;
}

function saveConfig(config) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create backup if file exists
    if (fs.existsSync(OUTPUT_FILE)) {
      const backupFile = OUTPUT_FILE.replace('.json', '.backup.json');
      fs.copyFileSync(OUTPUT_FILE, backupFile);
      console.log(`Created backup: ${backupFile}`);
    }

    // Write new config
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2), 'utf8');
    console.log(`Generated ${OUTPUT_FILE} successfully!`);
    
    const stats = config.generated;
    console.log(`📊 Statistics:`);
    console.log(`   Sections: ${stats.totalSections}`);
    console.log(`   Media files: ${stats.totalMedia}`);
    console.log(`   Generated: ${stats.timestamp}`);
    
  } catch (error) {
    console.error('Error saving configuration:', error.message);
    process.exit(1);
  }
}

function main() {
  console.log('🚀 Portfolio Generator');
  console.log('='.repeat(50));
  
  try {
    // Scan portfolio folder
    const sections = scanPortfolioFolder();
    
    if (sections.length === 0) {
      console.log('⚠️  No portfolio sections found!');
      console.log('Please add folders and media files to the portfolio directory.');
      return;
    }

    // Generate configuration
    const config = generatePortfolioConfig(sections);
    
    // Save to file
    saveConfig(config);
    
    console.log('✅ Portfolio generation complete!');
    console.log('You can now refresh your gallery to see the changes.');
    
  } catch (error) {
    console.error('❌ Error generating portfolio:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  scanPortfolioFolder,
  generatePortfolioConfig,
  getFileType,
  formatTitle,
  parseFilename
};