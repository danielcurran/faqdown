#!/usr/bin/env node
/**
 * sync-skills.js
 *
 * Copies the opencode skill files from ./skills/ into both the repo-local
 * .opencode/skills/ directory and the global opencode skills directory
 * (~/.config/opencode/skills/). This keeps ./skills/ as the source of truth
 * while making the skills discoverable both inside and outside this repo.
 *
 * Usage:
 *   node scripts/sync-skills.js
 *   npm run sync-skills
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const REPO_SKILLS_DIR = path.join(__dirname, '..', '.opencode', 'skills');
const GLOBAL_SKILLS_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.config',
  'opencode',
  'skills'
);

function readFrontmatterName(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }
  const nameMatch = match[1].match(/^name:\s*(.+)$/m);
  if (!nameMatch) {
    throw new Error(`No 'name' field in frontmatter of ${filePath}`);
  }
  return nameMatch[1].trim();
}

function copySkillToDir(sourcePath, targetDir) {
  const name = readFrontmatterName(sourcePath);
  const skillDir = path.join(targetDir, name);
  const targetPath = path.join(skillDir, 'SKILL.md');

  fs.mkdirSync(skillDir, { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
  return { name, targetPath };
}

function syncSkills() {
  const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    console.log('No skill files found in', SKILLS_DIR);
    return;
  }

  let copied = 0;
  for (const file of files) {
    const sourcePath = path.join(SKILLS_DIR, file);

    // Repo mirror
    const repoResult = copySkillToDir(sourcePath, REPO_SKILLS_DIR);
    console.log(`Synced ${file} -> ${repoResult.targetPath}`);

    // Global mirror
    if (fs.existsSync(GLOBAL_SKILLS_DIR)) {
      const globalResult = copySkillToDir(sourcePath, GLOBAL_SKILLS_DIR);
      console.log(`Synced ${file} -> ${globalResult.targetPath}`);
    } else {
      console.warn(`Global skills directory not found, skipping: ${GLOBAL_SKILLS_DIR}`);
    }

    copied++;
  }

  console.log(`\nSynced ${copied} skill(s) to ${REPO_SKILLS_DIR}`);
  if (fs.existsSync(GLOBAL_SKILLS_DIR)) {
    console.log(`Synced ${copied} skill(s) to ${GLOBAL_SKILLS_DIR}`);
  }
}

syncSkills();
