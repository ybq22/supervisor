import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { createHash } from 'crypto';

// File type mapping based on extensions
const FILE_TYPE_MAP = {
  '.pdf': 'pdfs',
  '.eml': 'emails',
  '.mbox': 'emails',
  '.png': 'images',
  '.jpg': 'images',
  '.jpeg': 'images',
  '.gif': 'images',
  '.webp': 'images',
  '.md': 'markdown',
  '.txt': 'text',
  '.text': 'text'
};

// Subdirectories to scan
const SUBDIRECTORIES = ['pdfs', 'emails', 'feishu', 'images', 'markdown', 'text'];

/**
 * Calculate SHA256 hash of a file
 * @param {string} filePath - Absolute path to file
 * @returns {Promise<string>} Hex-encoded SHA256 hash
 */
async function calculateFileHash(filePath) {
  try {
    const content = await readFile(filePath);
    return createHash('sha256').update(content).digest('hex');
  } catch (error) {
    throw new Error(`Failed to calculate hash for ${filePath}: ${error.message}`);
  }
}

/**
 * Load the processed manifest if it exists
 * @param {string} uploadsDir - Uploads directory path
 * @returns {Promise<Object>} Manifest object or empty object
 */
async function loadProcessedManifest(uploadsDir) {
  try {
    const manifestPath = join(uploadsDir, '.processed_manifest.json');
    const content = await readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // Return empty manifest if file doesn't exist or can't be read
    return { lastProcessed: null, files: [] };
  }
}

/**
 * Check if a file has already been processed by comparing hashes
 * @param {string} filename - Filename to check
 * @param {string} hash - SHA256 hash of the file
 * @param {Object} manifest - Loaded manifest object
 * @returns {boolean} True if file was already processed
 */
function isAlreadyProcessed(filename, hash, manifest) {
  if (!manifest.files || manifest.files.length === 0) {
    return false;
  }

  return manifest.files.some(
    file => file.filename === filename && file.hash === hash
  );
}

/**
 * Get file information object
 * @param {string} uploadsDir - Base uploads directory
 * @param {string} subdir - Subdirectory name
 * @param {string} filename - Filename
 * @param {Object} stats - File stats from fs.stat
 * @returns {Object} File information object
 */
function getFileInfo(uploadsDir, subdir, filename, stats) {
  return {
    path: join(uploadsDir, subdir, filename),
    size: stats.size,
    timestamp: stats.mtimeMs,
    filename
  };
}

/**
 * Scan uploads directory and categorize files by type
 * @param {string} uploadsDir - Path to uploads directory
 * @returns {Promise<Object>} Categorized file lists
 */
export async function scanUploads(uploadsDir) {
  // Initialize result structure
  const result = {
    pdfs: [],
    emails: [],
    feishu: [],
    images: [],
    markdown: [],
    texts: []
  };

  // Load existing manifest to check for already-processed files
  const manifest = await loadProcessedManifest(uploadsDir);

  // Scan each subdirectory
  for (const subdir of SUBDIRECTORIES) {
    const subdirPath = join(uploadsDir, subdir);

    try {
      const entries = await readdir(subdirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files and directories
        if (entry.name.startsWith('.') || entry.isDirectory()) {
          continue;
        }

        const filePath = join(subdirPath, entry.name);
        const ext = extname(entry.name).toLowerCase();

        // Skip files with unknown extensions
        if (!FILE_TYPE_MAP[ext]) {
          continue;
        }

        try {
          // Calculate hash to check if already processed
          const hash = await calculateFileHash(filePath);

          // Skip if already processed
          if (isAlreadyProcessed(entry.name, hash, manifest)) {
            continue;
          }

          // Get file stats
          const stats = await stat(filePath);
          const fileInfo = getFileInfo(uploadsDir, subdir, entry.name, stats);

          // Categorize file
          const category = FILE_TYPE_MAP[ext];

          // Handle feishu specially (it maps to feishu category)
          if (subdir === 'feishu') {
            result.feishu.push(fileInfo);
          } else if (category === 'pdfs') {
            result.pdfs.push(fileInfo);
          } else if (category === 'emails') {
            result.emails.push(fileInfo);
          } else if (category === 'images') {
            result.images.push(fileInfo);
          } else if (category === 'markdown') {
            result.markdown.push(fileInfo);
          } else if (category === 'text') {
            result.texts.push(fileInfo);
          }
        } catch (error) {
          // Skip files that can't be read or stat'd
          console.error(`Error processing file ${filePath}: ${error.message}`);
          continue;
        }
      }
    } catch (error) {
      // Skip subdirectories that don't exist or can't be read
      if (error.code !== 'ENOENT') {
        console.error(`Error scanning directory ${subdirPath}: ${error.message}`);
      }
      continue;
    }
  }

  return result;
}

/**
 * Update the processed manifest with newly processed files
 * @param {string} uploadsDir - Path to uploads directory
 * @param {Array} processedFiles - Array of processed file objects
 * @returns {Promise<void>}
 */
export async function updateProcessedManifest(uploadsDir, processedFiles) {
  try {
    // Ensure uploads directory exists
    await mkdir(uploadsDir, { recursive: true });

    const manifestPath = join(uploadsDir, '.processed_manifest.json');

    // Load existing manifest or create new one
    let manifest = await loadProcessedManifest(uploadsDir);

    // Update lastProcessed timestamp
    manifest.lastProcessed = new Date().toISOString();

    // Add new processed files (replace existing entries with same filename)
    for (const newFile of processedFiles) {
      const existingIndex = manifest.files.findIndex(
        f => f.filename === newFile.filename
      );

      if (existingIndex >= 0) {
        // Replace existing entry
        manifest.files[existingIndex] = newFile;
      } else {
        // Add new entry
        manifest.files.push(newFile);
      }
    }

    // Write updated manifest
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  } catch (error) {
    throw new Error(`Failed to update processed manifest: ${error.message}`);
  }
}
