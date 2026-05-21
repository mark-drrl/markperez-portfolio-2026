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

export const workColumns = [
  {
    left: "0%",
    width: "calc((100% - 1vh) / 3)",
    speed: 10,
    initialY: 0,
    tiles: [
      { height: 60.5, image: 0 },
      { height: 60.5, image: 1 },
      { height: 60.5, image: 7 },
    ],
  },
  {
    left: "calc((100% - 1vh) / 3 + 0.5vh)",
    width: "calc((100% - 1vh) / 3)",
    speed: 20,
    initialY: -48,
    tiles: [
      { height: 60.5, image: 3 },
      { height: 60.5, image: 2 },
      { height: 60.5, image: 4 },
      { height: 60.5, image: 9 },
    ],
  },
  {
    left: "calc(((100% - 1vh) / 3) * 2 + 1vh)",
    width: "calc((100% - 1vh) / 3)",
    speed: 30,
    initialY: 0,
    tiles: [
      { height: 57.5, image: 5 },
      { height: 41.5, image: 6 },
      { height: 57.5, image: 8 },
    ],
  },
] as const satisfies readonly WorkColumnDefinition[];

/** Desktop Curate preview cells — same positions as Work tiles at virtual offset 0. */
export const desktopCurateReplacementCells = [
  {
    className: "left-0 top-0 h-[60.5vh] w-[calc((100%-1vh)/3)]",
    start: 0.33,
    end: 0.42,
    origin: "42% 58%",
    columnIndex: 0,
    sampleVh: 30.25,
    imageIndex: 0,
  },
  {
    className:
      "left-0 top-[calc(60.5vh+0.5vh)] h-[60.5vh] w-[calc((100%-1vh)/3)]",
    start: 0.36,
    end: 0.45,
    origin: "58% 72%",
    columnIndex: 0,
    sampleVh: 91.25,
    imageIndex: 1,
  },
  {
    className:
      "left-[calc((100%-1vh)/3+0.5vh)] top-[13vh] h-[60.5vh] w-[calc((100%-1vh)/3)]",
    start: 0.39,
    end: 0.48,
    origin: "46% 48%",
    columnIndex: 1,
    sampleVh: 43.25,
    imageIndex: 2,
  },
  {
    className:
      "left-[calc((100%-1vh)/3+0.5vh)] -top-[48vh] h-[60.5vh] w-[calc((100%-1vh)/3)]",
    start: 0.42,
    end: 0.51,
    origin: "64% 34%",
    columnIndex: 1,
    sampleVh: -17.75,
    imageIndex: 3,
  },
  {
    className:
      "left-[calc((100%-1vh)/3+0.5vh)] top-[74vh] h-[60.5vh] w-[calc((100%-1vh)/3)]",
    start: 0.45,
    end: 0.54,
    origin: "38% 68%",
    columnIndex: 1,
    sampleVh: 89,
    imageIndex: 4,
  },
  {
    className:
      "left-[calc(((100%-1vh)/3)*2+1vh)] top-0 h-[57.5vh] w-[calc((100%-1vh)/3)]",
    start: 0.48,
    end: 0.57,
    origin: "52% 54%",
    columnIndex: 2,
    sampleVh: 28.75,
    imageIndex: 5,
  },
  {
    className:
      "left-[calc(((100%-1vh)/3)*2+1vh)] top-[calc(57.5vh+0.5vh)] h-[41.5vh] w-[calc((100%-1vh)/3)]",
    start: 0.51,
    end: 0.6,
    origin: "36% 62%",
    columnIndex: 2,
    sampleVh: 68.25,
    imageIndex: 6,
  },
] as const;

/** Precomputed at virtual scroll 0 — kept in sync with cells above. */
export const desktopCurateHandoffImageIndices =
  desktopCurateReplacementCells.map((cell) => cell.imageIndex);

export function columnCycleHeight(tiles: readonly { height: number }[]) {
  return tiles.reduce(
    (total, tile, index) => total + tile.height + (index > 0 ? 0.5 : 0),
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

  return column.initialY - cycleHeight - rawOffset;
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
