// Main reformatting entry points and public API.

const {
  isDecorativeLine, isAsciiArtBlock, isTableBlock, isStatBlock
} = require('./detect');
const {
  formatProse, formatTable, formatAscii, classifyArtBlock,
  formatStatBlock, formatDecorativeText
} = require('./format');
const { formatMixed } = require('./classify');

function reformatBlock(lines) {
  // Phase 1: Full-block checks for content that must stay whole
  if (lines.every(l => isDecorativeLine(l))) return '';

  // Phase 2: Check ASCII art — if mixed with stat/table lines, segment anyway
  if (isAsciiArtBlock(lines)) {
    const hasStat = lines.some(l => /^\w[\w\s]+\s*:\s*\w/.test(l.trim()));
    const hasTablePipes = lines.some(l => {
      const s = l.trim();
      if (!s.includes('|')) return false;
      return s.replace(/\|/g, '').replace(/[^a-zA-Z0-9]/g, '').length >= 3;
    });
    if (hasStat || hasTablePipes) {
      return '<!-- MIXED -->\n\n' + formatMixed(lines);
    }
    return formatAscii(lines);
  }

  // Phase 3: Strip simple decorative elements to plain text
  const dec = formatDecorativeText(lines);
  if (dec !== null) return dec;

  // Phase 4: Pure-type formatting
  if (isTableBlock(lines)) return formatTable(lines);
  if (isStatBlock(lines)) return formatStatBlock(lines);
  return formatProse(lines);
}

function reformat(content) {
  if (!content || !content.trim()) return '';
  const blocks = content.split(/\n{2,}/);
  const result = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) continue;
    const formatted = reformatBlock(lines);
    if (formatted) result.push(formatted);
  }
  return result.join('\n\n').trim();
}

module.exports = {
  reformat,
  reformatBlock,
  formatMixed,
  formatTable,
  formatAscii,
  formatProse,
  formatStatBlock,
  formatDecorativeText,
  classifyArtBlock
};
