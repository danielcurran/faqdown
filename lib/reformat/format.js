// Formatters for reformatting GameFAQs plain-text walkthroughs.

const { isDecorativeLine } = require('./detect');

function formatProse(lines) {
  let text = lines.join(' ').replace(/ +/g, ' ').trim();
  if (!text) return '';
  return text + '\n\n';
}

function formatTable(lines) {
  const dataRows = [];
  for (const line of lines) {
    const s = line.trim();
    if (!s) continue;
    // Skip rows that are purely decorative between pipes
    const betweenPipes = s.split('|').slice(1, -1);
    if (betweenPipes.length === 0) continue;
    if (betweenPipes.every(c => /^[\*\-_=¯\s]+$/.test(c.trim()))) continue;
    dataRows.push(s);
  }
  if (dataRows.length === 0) return '';

  // Determine column count from the row with most pipe separators
  const colCounts = dataRows.map(r => r.split('|').length - 1);
  const maxCols = Math.max(...colCounts);
  if (maxCols < 2) return '';

  // Extract cells
  const rows = dataRows.map(row => {
    const cells = row.split('|');
    // Skip leading/trailing empty cell from leading/trailing pipe
    const firstCell = cells[0].trim().length > 0 ? 0 : 1;
    const slice = cells.slice(firstCell);
    // Pad to maxCols
    while (slice.length < maxCols) slice.push('');
    return slice.slice(0, maxCols).map(c => c.trim());
  });

  if (rows.length === 0) return '';

  // Build markdown table
  let md = '';
  for (let i = 0; i < rows.length; i++) {
    md += '| ' + rows[i].join(' | ') + ' |\n';
    if (i === 0) {
      md += '| ' + rows[i].map(() => '---').join(' | ') + ' |\n';
    }
  }
  return md + '\n';
}

function formatAscii(lines) {
  const text = lines.map(l => l.trimEnd()).join('\n').trim();
  if (!text) return '';
  const type = classifyArtBlock(lines);
  return '<!-- MODERNIZE:' + type + ' -->\n\n```\n' + text + '\n```\n\n';
}

function classifyArtBlock(lines) {
  const text = lines.join('\n');

  // boss — BOSS # markers or boss HP/level indicators
  if (/BOSS\s*#?\s*\d|Boss\s*:|Recommended Level.*\d+\+|Requires.*boss/i.test(text)) return 'boss';

  // statblock — RPG stat labels with values
  if (/\b(LV|HP|TP|ATK|DFS|MST|STRNGTH|AGILITY|DEXTRTY|MENTAL|EXP)\s*[:\d]/i.test(text)) return 'statblock';

  // menu — menu option markers
  if (/\|\s*o\s+(CONTINUE|SAVE|ITEM|EQUIP|MAGIC|STATUS|OPTIONS|CONFIG|LOAD|NEW\s+GAME)/i.test(text)) return 'menu';

  // dungeon — area/dungeon headers with decorative framing
  if (/\/\/\s*DUNGEON|^\s*\|?\/\s+[\w\s]+\s*[/\\_¯]{4,}/m.test(text)) return 'map';

  // map — location names with prices or services
  if (/(Inn|Shop|Store|Bar|Temple|Church|Guild)\s.*(MST|\d+\s*MST)/i.test(text)) return 'map';

  // equipment — equipment slot labels or item stat lines
  if (/\b(Head|Right|Left|Body|Weapon|Shield|Armor|Accessory)\b.*[A-Z]/i.test(text)) return 'equipment';

  return 'unknown';
}

function formatStatBlock(lines) {
  const kvRe = /^\s*\w[\w\s]+\s*:\s*\w/;
  const kvLines = [];
  const otherLines = [];

  for (const line of lines) {
    const s = line.trim();
    if (!s) continue;
    if (kvRe.test(s)) {
      const [key, ...rest] = s.split(':');
      kvLines.push('**' + key.trim() + ':** ' + rest.join(':').trim());
    } else {
      otherLines.push(s);
    }
  }

  let out = '';
  if (kvLines.length > 0) out += kvLines.join(' · ') + '\n\n';
  if (otherLines.length > 0) out += otherLines.join(' ').replace(/ +/g, ' ').trim() + '\n\n';
  return out;
}

function formatDecorativeText(lines) {
  const cleaned = [];
  let anyChanged = false;
  for (const line of lines) {
    const orig = line.trim();
    if (!orig || /^[\/\\¯_|\-=\s]+$/.test(orig)) continue;
    if (/^[\*\-_=¯]{8,}$/.test(orig)) continue;
    let s = orig;
    s = s.replace(/^\/\/\s*/, '')
         .replace(/^\|?\s*\/\s*/, '')
         .replace(/^[\/\\]+\s*/, '')
         .replace(/[\/\\¯_|=\-]{2,}/g, ' ');
    if (s !== orig) {
      s = s.replace(/\s+/g, ' ').trim();
      if (s) {
        cleaned.push('**' + s + '**');
        anyChanged = true;
      }
    } else if (orig) {
      cleaned.push(orig);
    }
  }
  if (!anyChanged) return null;
  return cleaned.join('\n\n') + '\n\n';
}

module.exports = {
  formatProse, formatTable, formatAscii, classifyArtBlock,
  formatStatBlock, formatDecorativeText
};
