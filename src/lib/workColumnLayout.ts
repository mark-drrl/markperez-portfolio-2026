/** Shared Work column geometry — used by Work gallery and desktop Curate handoff. */

export type WorkColumnTile = {
  height: number;
  image: number;
};

export type WorkColumnDefinition = {
  left: string;
  width: string;
  speed: number;
  initialY: number;
  tiles: readonly WorkColumnTile[];
};

/** Virtual pixels for one full speed-percent travel unit (see `computeColumnTranslateVh`). */
export const WORK_VIRTUAL_SCROLL_DISTANCE = 1400;

/**
 * Nudges Work column tiles to match Create/Curate absolute grid shells at handoff.
 * Curate cell positions are the source of truth — only the Work gallery is adjusted.
 */
export const WORK_GALLERY_TRANSLATE_BIAS_VH = -0.5;

export const workColumns = [
  {
    left: "6vw",
    width: "24vw",
    speed: 10,
    // initialY derived so tile[0] top = 8vh at virtualOffset=0.
    // cycleHeight = 30 + (10+36) + (10+40) = 126vh
    // initialY = 8 + 126 + BIAS(0.5) = 134.5
    initialY: 134.5,
    tiles: [
      { height: 30, image: 0 },
      { height: 36, image: 1 },
      { height: 40, image: 7 },
    ],
  },
  {
    left: "38vw",
    width: "24vw",
    speed: 20,
    // initialY derived so tile[0] top = -4vh at virtualOffset=0.
    // cycleHeight = 32 + (10+44) + (10+30) + (10+38) = 174vh
    // initialY = -4 + 174 + BIAS(0.5) = 170.5
    initialY: 170.5,
    tiles: [
      { height: 32, image: 2 },
      { height: 44, image: 3 },
      { height: 30, image: 4 },
      { height: 38, image: 9 },
    ],
  },
  {
    left: "70vw",
    width: "24vw",
    speed: 30,
    // initialY derived so tile[0] top = 14vh at virtualOffset=0.
    // cycleHeight = 38 + (10+26) + (10+42) + (10+34) = 170vh
    // initialY = 14 + 170 + BIAS(0.5) = 184.5
    initialY: 184.5,
    tiles: [
      { height: 38, image: 5 },
      { height: 26, image: 6 },
      { height: 42, image: 10 },
      { height: 34, image: 8 },
    ],
  },
] as const satisfies readonly WorkColumnDefinition[];

/** Desktop Curate preview cells — Work gallery geometry is tuned to match these at handoff. */
// Varied grey tones for the grid shells, shared by the Create boxes and the
// Curate fill shells (index-aligned). Matching tones make the boxes look like
// they persist across the Create→Curate handoff and then get filled.
export const curateCellShellTones = [
  "#dbdbdb",
  "#b7b7b7",
  "#cfcfcf",
  "#aaaaaa",
  "#d6d6d6",
  "#b1b1b1",
  "#c5c5c5",
] as const;

// Boxes fill slowly in a shuffled order (not all at once). Each `start`/`end`
// is hand-spread across the Curate window so the grid populates one box at a
// time in a random-looking sequence: cell2 → cell5 → cell0 → cell6 → cell3 →
// cell1 → cell4.
export const desktopCurateReplacementCells = [
  {
    // col0, top 8vh, h 30vh
    className: "left-[6vw] top-[8vh] h-[30vh] w-[24vw]",
    start: 0.407,
    end: 0.45,
    origin: "42% 58%",
    columnIndex: 0,
    sampleVh: 23,
    imageIndex: 0,
  },
  {
    // col0, top 52vh, h 36vh
    className: "left-[6vw] top-[52vh] h-[36vh] w-[24vw]",
    start: 0.469,
    end: 0.512,
    origin: "58% 72%",
    columnIndex: 0,
    sampleVh: 70,
    imageIndex: 1,
  },
  {
    // col1, top -4vh, h 32vh
    className: "left-[38vw] -top-[4vh] h-[32vh] w-[24vw]",
    start: 0.365,
    end: 0.408,
    origin: "46% 48%",
    columnIndex: 1,
    sampleVh: 12,
    imageIndex: 2,
  },
  {
    // col1, top 42vh, h 44vh
    className: "left-[38vw] top-[42vh] h-[44vh] w-[24vw]",
    start: 0.448,
    end: 0.491,
    origin: "64% 34%",
    columnIndex: 1,
    sampleVh: 64,
    imageIndex: 3,
  },
  {
    // col1, top 100vh, h 30vh (below fold)
    className: "left-[38vw] top-[100vh] h-[30vh] w-[24vw]",
    start: 0.49,
    end: 0.535,
    origin: "38% 68%",
    columnIndex: 1,
    sampleVh: 115,
    imageIndex: 4,
  },
  {
    // col2, top 14vh, h 38vh
    className: "left-[70vw] top-[14vh] h-[38vh] w-[24vw]",
    start: 0.386,
    end: 0.429,
    origin: "52% 54%",
    columnIndex: 2,
    sampleVh: 33,
    imageIndex: 5,
  },
  {
    // col2, top 66vh, h 26vh
    className: "left-[70vw] top-[66vh] h-[26vh] w-[24vw]",
    start: 0.427,
    end: 0.47,
    origin: "36% 62%",
    columnIndex: 2,
    sampleVh: 79,
    imageIndex: 6,
  },
] as const;

export function columnCycleHeight(tiles: readonly { height: number }[]) {
  return tiles.reduce(
    (total, tile, index) => total + tile.height + (index > 0 ? 10 : 0),
    0,
  );
}

export function computeColumnTranslateVh(
  virtualOffset: number,
  column: WorkColumnDefinition,
) {
  const cycleHeight = columnCycleHeight(column.tiles);
  const speedFactor = column.speed / 100;
  const travel =
    (virtualOffset / WORK_VIRTUAL_SCROLL_DISTANCE) * speedFactor * cycleHeight;
  const rawOffset =
    ((travel % cycleHeight) + cycleHeight) % cycleHeight;

  return (
    column.initialY -
    cycleHeight -
    rawOffset +
    WORK_GALLERY_TRANSLATE_BIAS_VH
  );
}

export function workImageIndexAtColumnSample(
  virtualOffset: number,
  column: WorkColumnDefinition,
  sampleVh: number,
) {
  const translateVh = computeColumnTranslateVh(virtualOffset, column);
  const cycleHeight = columnCycleHeight(column.tiles);
  let yInColumn = sampleVh - translateVh;
  yInColumn = ((yInColumn % cycleHeight) + cycleHeight) % cycleHeight;

  let cursor = 0;

  for (const tile of column.tiles) {
    const tileEnd = cursor + tile.height;

    if (yInColumn >= cursor && yInColumn < tileEnd) {
      return tile.image;
    }

    cursor = tileEnd + 0.5;
  }

  return column.tiles[0]?.image ?? 0;
}
