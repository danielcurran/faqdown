# Phase 2 — Safety net (Plan B + C)

## Goal

Convert the most common complex ASCII layouts in the PSIV walkthrough into
readable plain-text markdown instead of broken tables, code blocks, or dense
prose. This phase intentionally chooses **simple, robust extraction** over
preserving original tabular formatting.

## What was implemented

All extractors live in the existing `lib/reformat/` layer; no new `lib/extract/`
or `lib/render/` directories were needed.

### New block detectors (`lib/reformat/detect.js`)

| Function | Trigger |
|---|---|
| `isBossCard(lines)` | Line starts with `BOSS #N` |
| `isShopBlock(lines)` | `Shops` heading + fixed-width item/price rows |
| `isCharacterSheet(lines)` | Block contains equipment slots, stats (`HP`, `TP`, `Str`, …), and a right-side profile (`Age`, `Sex`, `Lives`) |
| `isCharacterPortrait(lines)` | ASCII-art frame + profile labels (`Age`, `Sex`, `Lives`) |

### New formatters (`lib/reformat/format.js`)

| Function | Output style |
|---|---|
| `formatBossCard(lines)` | `**BOSS #N — Name**` + bold stat lines (`HP`, `EXP`, `MST`, `Weak`, `Res`, `Imm`, `Recommended`) |
| `formatShopList(lines)` | Grouped bullet list per store: `Item — Price (Bonus)` |
| `formatCharacterSheet(lines)` | Join/Starting info, initial stats, equipment, techniques/skills |
| `formatCharacterPortrait(lines)` | Plain profile line: `Name — Race (Class) · Age: N · Sex: X · Lives: Location` |

### Stat-block improvements (`formatStatBlock`)

`formatStatBlock` now parses multi-column key-value lines such as:

```text
  HP: 300                          Alys: 7
 EXP: 173                          Chaz: 2-3
 MST: 54                           Hahn: 2-3
```

into:

```markdown
**HP:** 300 · **Alys:** 7

**EXP:** 173 · **Chaz:** 2-3

**MST:** 54 · **Hahn:** 2-3
```

Single-column stat lines continue to be joined inline with `·`.

### Routing (`lib/reformat/classify.js` / `index.js`)

`classifyArtBlock` and `formatMixed` route these blocks to the new formatters
before falling back to markdown tables or `<!-- MODERNIZE:TYPE -->` code blocks.

## Files changed

- `lib/reformat/detect.js` — added `isBossCard`, `isShopBlock`, `isCharacterSheet`, `isCharacterPortrait`
- `lib/reformat/format.js` — added `formatBossCard`, `formatShopList`, `formatCharacterSheet`, `formatCharacterPortrait`; improved `formatStatBlock`
- `lib/reformat/classify.js` — wired new formatters into `formatMixed`
- `lib/reformat/index.js` — exported new public formatters
- `scripts/test.js` — added fixtures for all new formatters and the multi-column stat block

## Acceptance criteria (verified)

1. ✅ `npm test` passes (49 tests).
2. ✅ Regenerated PSIV walkthrough renders cleanly:
   - Boss cards (6.1.2, 15.1.1) are plain-text stat blocks.
   - Shop blocks (6.1.3) are grouped bullet lists with bonuses.
   - Character sheets (8.1.1, 8.1.3) are plain-text stat/equip/skill summaries.
   - Character portraits are stripped and replaced by a profile line.
3. ✅ `<!-- MIXED -->` blocks in output are valid markdown tables, lists, or tagged code blocks.

## Remaining work (out of scope for Phase 2)

- Dense data tables (bestiary 14.x, weapon/armour lists 13.x, level/EXP tables 9.x)
  still use markdown tables; some may need future attention.
- Town summary columnar layouts (16.5) remain as plain-space columns; a dedicated
  town-summary parser may be added in a later phase if needed.
- ASCII art that does not match the new detectors still falls back to
  `<!-- MODERNIZE:unknown -->` code blocks for the `art-modernize` skill.

## How to verify

```bash
npm test

# Regenerate from cached raw.txt
node scripts/convert.js --title='Phantasy Star IV' --author='FByouth'

# Spot-check key sections
node -e "console.log(require('fs').readFileSync('scripts/walkthrough.md','utf8').match(/### 6\.1\.2\. Cleaning the Cellar[\s\S]*?(?=###)/)[0])"
node -e "console.log(require('fs').readFileSync('scripts/walkthrough.md','utf8').match(/### 6\.1\.3\. Mile to the Next Town[\s\S]*?(?=###)/)[0])"
node -e "console.log(require('fs').readFileSync('scripts/walkthrough.md','utf8').match(/### 8\.1\.1\. Chaz Ashley[\s\S]*?(?=###)/)[0])"
```
