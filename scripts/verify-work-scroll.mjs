/**
 * Lightweight sanity checks for work scroll math (run: node scripts/verify-work-scroll.mjs)
 */

function columnCycleHeight(tiles) {
  return tiles.reduce(
    (total, tile, index) => total + tile.height + (index > 0 ? 0.5 : 0),
    0,
  );
}

function computeColumnTranslateVh(virtualOffset, column) {
  const cycleHeight = columnCycleHeight(column.tiles);
  const travel = (virtualOffset / 900) * column.speed * cycleHeight;
  const rawOffset =
    ((travel % cycleHeight) + cycleHeight) % cycleHeight;

  return column.initialY - cycleHeight - rawOffset;
}

const column = {
  speed: 0.6,
  initialY: -48,
  tiles: [
    { height: 60.5 },
    { height: 60.5 },
    { height: 60.5 },
    { height: 60.5 },
  ],
};

const atZero = computeColumnTranslateVh(0, column);
const atStep = computeColumnTranslateVh(100, column);
const looped = computeColumnTranslateVh(900 / 0.6 / columnCycleHeight(column.tiles) * columnCycleHeight(column.tiles), column);

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  } else {
    console.log(`OK: ${message}`);
  }
}

assert(Number.isFinite(atZero), "translate at virtual 0 is finite");
assert(Number.isFinite(atStep), "translate at virtual 100 is finite");
assert(atZero !== atStep, "wheel input changes column offset");
assert(
  Math.abs(looped - atZero) < 0.01 || Math.abs(looped - atStep) < 200,
  "loop modulo stays in expected range",
);

if (failed > 0) {
  process.exit(1);
}

console.log("\nAll work scroll checks passed.");
