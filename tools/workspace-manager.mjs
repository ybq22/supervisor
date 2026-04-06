#!/usr/bin/env node
/**
 * Mentor Workspace Manager
 *
 * Manages workspace directories for each mentor, providing a complete
 * and organized space for all mentor-related content including:
 * - Original uploads
 * - Processed content
 * - Web-scraped sources
 * - Analysis results
 * - Final skill files
 *
 * Usage:
 *   import { createWorkspace, getWorkspacePath, addToWorkspace } from './workspace-manager.mjs'
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash as createCryptoHash } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create a mentor workspace with organized directory structure
 *
 * @param {string} mentorName - The mentor's name
 * @returns {Promise<string>} Path to the workspace
 */
export async function createWorkspace(mentorName) {
  // Create slug from mentor name (remove special chars, replace spaces)
  const mentorSlug = mentorName
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    .replace(/\s+/g, '_');

  // Base workspace directory
  const workspaceDir = path.join(process.env.HOME, '.claude', 'mentors-workspace', mentorSlug);

  // Create directory structure
  const dirs = [
    '',                              // workspace root
    'uploads',                       // Original uploads
    'uploads/raw',                   // Raw uploaded files
    'uploads/temp',                 // Temporary files
    'processed',                     // Processed/parsed content
    'processed/texts',              // Parsed text content
    'processed/markdown',           // Parsed markdown content
    'processed/pdfs',               // Parsed PDF content
    'processed/emails',             // Parsed email content
    'processed/images',             // Parsed image metadata
    'processed/feishu',             // Parsed Feishu content
    'sources',                       // Web-scraped sources
    'sources/arxiv',                 // ArXiv papers
    'sources/web',                   // Web search results
    'analysis',                      // Analysis results
    'analysis/papers',               // Paper analysis
    'analysis/reviews',              // Content reviews
    'skill',                         // Final generated skill
    'logs'                           // Log files
  ];

  for (const dir of dirs) {
    const dirPath = path.join(workspaceDir, dir);
    await fs.mkdir(dirPath, { recursive: true });
  }

  // Initialize workspace metadata
  const workspaceMetadata = {
    name: mentorName,
    slug: mentorSlug,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: '1.0',
    statistics: {
      uploads_count: 0,
      processed_count: 0,
      sources_count: 0,
      last_analysis: null
    }
  };

  const metadataPath = path.join(workspaceDir, 'workspace.json');
  await fs.writeFile(metadataPath, JSON.stringify(workspaceMetadata, null, 2), 'utf8');

  return workspaceDir;
}

/**
 * Get workspace path for a mentor
 *
 * @param {string} mentorName - The mentor's name
 * @returns {string} Path to the workspace
 */
export function getWorkspacePath(mentorName) {
  const mentorSlug = mentorName
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    .replace(/\s+/g, '_');

  return path.join(process.env.HOME, '.claude', 'mentors-workspace', mentorSlug);
}

/**
 * Check if workspace exists for a mentor
 *
 * @param {string} mentorName - The mentor's name
 * @returns {boolean} True if workspace exists
 */
export async function workspaceExists(mentorName) {
  const workspacePath = getWorkspacePath(mentorName);
  try {
    const stats = await fs.stat(workspacePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Add uploaded file to workspace
 *
 * @param {string} mentorName - The mentor's name
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<Object>} Upload result
 */
export async function addUpload(mentorName, filePath) {
  const workspacePath = getWorkspacePath(mentorName);

  // Create workspace if it doesn't exist
  if (!(await workspaceExists(mentorName))) {
    await createWorkspace(mentorName);
  }

  // Read file
  const stats = await fs.stat(filePath);
  const buffer = await fs.readFile(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // Copy to uploads/raw directory
  const rawUploadsDir = path.join(workspacePath, 'uploads', 'raw');
  const targetPath = path.join(rawUploadsDir, filename);
  await fs.writeFile(targetPath, buffer);

  // Get file hash for deduplication
  const hash = createHash(buffer);

  // Update workspace metadata
  await updateWorkspaceStats(mentorName, {
    uploads_count: 1
  });

  return {
    success: true,
    filename,
    originalPath: filePath,
    storedPath: targetPath,
    size: stats.size,
    hash,
    ext
  };
}

/**
 * Process uploaded file and store in processed directory
 *
 * @param {string} mentorName - The mentor's name
 * @param {string} filePath - Path to the file in uploads/raw
 * @param {Object} parsedResult - Result from parser
 * @returns {Promise<Object>} Process result
 */
export async function saveProcessedContent(mentorName, filePath, parsedResult) {
  const workspacePath = getWorkspacePath(mentorName);
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  // Determine target directory based on file type
  const typeMap = {
    '.txt': 'texts',
    '.text': 'texts',
    '.md': 'markdown',
    '.pdf': 'pdfs',
    '.eml': 'emails',
    '.mbox': 'emails',
    '.png': 'images',
    '.jpg': 'images',
    '.jpeg': 'images',
    '.gif': 'images',
    '.webp': 'images',
    '.json': 'feishu'
  };

  const targetDir = typeMap[ext] || 'texts';
  const processedDir = path.join(workspacePath, 'processed', targetDir);

  // Save processed content as JSON
  const processedFilename = `${filename}.json`;
  const processedPath = path.join(processedDir, processedFilename);

  const processedData = {
    original_file: filename,
    original_path: filePath,
    processed_at: new Date().toISOString(),
    ...parsedResult
  };

  await fs.writeFile(processedPath, JSON.stringify(processedData, null, 2), 'utf8');

  // Update workspace metadata
  await updateWorkspaceStats(mentorName, {
    processed_count: 1
  });

  return {
    success: true,
    processedPath,
    targetDir
  };
}

/**
 * Save ArXiv papers to workspace
 *
 * @param {string} mentorName - The mentor's name
 * @param {Array} papers - ArXiv papers
 * @returns {Promise<void>}
 */
export async function saveArxivPapers(mentorName, papers) {
  const workspacePath = getWorkspacePath(mentorName);
  const arxivDir = path.join(workspacePath, 'sources', 'arxiv');

  await fs.writeFile(
    path.join(arxivDir, 'papers.json'),
    JSON.stringify(papers, null, 2),
    'utf8'
  );

  await updateWorkspaceStats(mentorName, {
    sources_count: papers.length
  });
}

/**
 * Save web search results to workspace
 *
 * @param {string} mentorName - The mentor's name
 * @param {Array} webResults - Web search results
 * @returns {Promise<void>}
 */
export async function saveWebResults(mentorName, webResults) {
  const workspacePath = getWorkspacePath(mentorName);
  const webDir = path.join(workspacePath, 'sources', 'web');

  await fs.writeFile(
    path.join(webDir, 'results.json'),
    JSON.stringify(webResults, null, 2),
    'utf8'
  );
}

/**
 * Update workspace statistics
 *
 * @param {string} mentorName - The mentor's name
 * @param {Object} updates - Statistics to update
 */
async function updateWorkspaceStats(mentorName, updates) {
  const workspacePath = getWorkspacePath(mentorName);
  const metadataPath = path.join(workspacePath, 'workspace.json');

  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

  // Update statistics
  for (const key in updates) {
    if (typeof metadata.statistics[key] === 'number') {
      metadata.statistics[key] += updates[key];
    } else {
      metadata.statistics[key] = updates[key];
    }
  }

  metadata.updated_at = new Date().toISOString();

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
}

/**
 * Get workspace metadata
 *
 * @param {string} mentorName - The mentor's name
 * @returns {Promise<Object>} Workspace metadata
 */
export async function getWorkspaceMetadata(mentorName) {
  const workspacePath = getWorkspacePath(mentorName);
  const metadataPath = path.join(workspacePath, 'workspace.json');

  try {
    const content = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * List all mentors with workspaces
 *
 * @returns {Promise<Array>} List of mentor metadata
 */
export async function listWorkspaces() {
  const workspacesRoot = path.join(process.env.HOME, '.claude', 'mentors-workspace');

  try {
    const entries = await fs.readdir(workspacesRoot, { withFileTypes: true });
    const workspaces = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metadataPath = path.join(workspacesRoot, entry.name, 'workspace.json');
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          workspaces.push(metadata);
        } catch {
          // Skip invalid workspaces
        }
      }
    }

    return workspaces;
  } catch (error) {
    return [];
  }
}

// Helper function to create hash
function createHash(buffer) {
  return createCryptoHash('sha256').update(buffer).digest('hex');
}

export default {
  createWorkspace,
  getWorkspacePath,
  workspaceExists,
  addUpload,
  saveProcessedContent,
  saveArxivPapers,
  saveWebResults,
  getWorkspaceMetadata,
  listWorkspaces
};
