#!/usr/bin/env node
// Split a large walkthrough markdown into per-section files
// Usage: node split-guide.js <input.md> [output-dir]

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputDir = process.argv[3] || 'guide';

if (!inputFile) {
  console.error('Usage: node split-guide.js <input.md> [output-dir]');
  process.exit(1);
}

const md = fs.readFileSync(inputFile, 'utf8');
const lines = md.split('\n');

// Find where the header (title, author, TOC) ends and sections begin
let headerEnd = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/<a id="s\d/)) {
    headerEnd = i;
    break;
  }
}

const header = lines.slice(0, headerEnd).join('\n');

// Find all section boundaries by scanning anchor tags
const anchorLines = [];
for (let i = headerEnd; i < lines.length; i++) {
  const m = lines[i].match(/<a id="(s\d+(?:-\d+)*)"><\/a>/);
  if (m) {
    anchorLines.push({ line: i, anchor: m[1] });
  }
}

// Build sections from anchor boundaries
const sections = [];
for (let a = 0; a < anchorLines.length; a++) {
  const startLine = anchorLines[a].line;
  const endLine = a + 1 < anchorLines.length ? anchorLines[a + 1].line : lines.length;
  const body = lines.slice(startLine, endLine).join('\n').trim();
  sections.push({ anchor: anchorLines[a].anchor, body });
}

// Extract section number from anchor (e.g. "s6-4-8" → "6.4.8")
function getNumber(anchor) {
  return anchor.replace(/^s/, '').replace(/-/g, '.');
}

// Extract heading text from section body
function getHeading(body) {
  const bodyLines = body.split('\n');
  for (const line of bodyLines) {
    const hMatch = line.match(/^#+\s+(.+)/);
    if (hMatch) return hMatch[1].trim();
  }
  return '';
}

// Create a URL-safe slug from heading text
function slugify(text) {
  let s = text.toLowerCase();
  // Remove smart quotes and other special characters
  s = s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '');
  s = s.replace(/[^a-z0-9\s-']/g, '');
  s = s.replace(/\s+/g, '-');
  s = s.replace(/'/g, '');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  return s || 'section';
}

// Assign filenames
const tocEntries = [];
for (const s of sections) {
  const num = getNumber(s.anchor);
  const title = getHeading(s.body);
  // Strip section number prefix from title (e.g. "1.1. Foreword" → "Foreword")
  const numPrefix = num.split('.').map(n => n).join('');
  const strippedTitle = title.replace(new RegExp(`^${num.replace(/\./g, '\\.')}\\.?\\s*`), '');
  const slug = slugify(strippedTitle) || slugify(title);
  const depth = (num.match(/\./g) || []).length;
  const indent = '  '.repeat(depth);
  const filename = `${num}-${slug}.md`;

  tocEntries.push({ indent, num, title, filename });
  s.filename = filename;
  s.num = num;
  s.title = title;
}

// Create output directory
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

// Write section files
console.log(`Splitting into ${sections.length} sections...`);
const sizes = [];
for (const s of sections) {
  const content = s.body + '\n';
  fs.writeFileSync(path.join(outputDir, s.filename), content);
  sizes.push(s.body.length);
}
// Print summary
for (let i = 0; i < sections.length; i++) {
  console.log(`  ${sections[i].filename} (${sizes[i]} chars)`);
}

// Build index.md: update TOC links to point to section files
let indexContent = header.split('\n');
const newTocLines = [];
for (const line of indexContent) {
  const tocMatch = line.match(/^(\s*-\s+\[)(.+?)(\]\(#)(s[\d-]+)(\)\s*)$/);
  if (tocMatch) {
    const anchor = tocMatch[4];
    const entry = sections.find(s => s.anchor === anchor);
    if (entry) {
      newTocLines.push(`${tocMatch[1]}${tocMatch[2]}](${entry.filename})`);
    } else {
      newTocLines.push(line);
    }
  } else {
    newTocLines.push(line);
  }
}
indexContent = newTocLines;

// Add section file listing at the bottom
indexContent.push('');
indexContent.push('---');
indexContent.push('');
indexContent.push('## Section Files');
indexContent.push('');
for (const e of tocEntries) {
  indexContent.push(`${e.indent}- [${e.num}. ${e.title}](${e.filename})`);
}

const indexFile = path.join(outputDir, 'index.md');
fs.writeFileSync(indexFile, indexContent.join('\n'));

// Stats
const totalChars = sizes.reduce((a, b) => a + b, 0);
const avgChars = Math.round(totalChars / sections.length);
const maxChars = Math.max(...sizes);
const minChars = Math.min(...sizes);
console.log(`\n${outputDir}/index.md created`);
console.log(`${sections.length} section files | avg ${avgChars} chars | range ${minChars}-${maxChars} chars`);
