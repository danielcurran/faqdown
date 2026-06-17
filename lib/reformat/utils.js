// Shared utility functions for reformatting.

/**
 * Generate an HTML anchor ID from a section number.
 * Converts dots to hyphens and prefixes with 's'.
 * @param {string} num - Section number like "6.4.8"
 * @returns {string} Anchor ID like "s6-4-8"
 */
function anchorId(num) {
  return 's' + num.replace(/\./g, '-');
}

/**
 * Remove trailing frame/decoration characters from a table cell.
 * Strips trailing /, \, and ¯ characters.
 * @param {string} cell - Table cell text
 * @returns {string} Cleaned cell text
 */
function stripFrameChars(cell) {
  return cell.replace(/[\/\\¯]+$/g, '').trim();
}

/**
 * Strip pipe-delimited box-framing and dash decoration from a string.
 * Used for roman-format sub-headers like | - Overworld - |
 * @param {string} s - String with potential framing
 * @returns {string} Extracted label with framing removed
 */
function stripPipeAndDash(s) {
  return s.replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').replace(/^-\s*/, '').replace(/\s*-$/, '').trim();
}

module.exports = { anchorId, stripFrameChars, stripPipeAndDash };
