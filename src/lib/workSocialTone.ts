import { luminanceToNavTone } from "@/lib/sectionNavTone";

/** Approximate perceived luminance after grayscale + contrast (0 = dark, 1 = light). */
const WORK_IMAGE_LUMINANCE: Record<number, number> = {
  0: 0.54,
  1: 0.7,
  2: 0.46,
  3: 0.58,
  4: 0.5,
  5: 0.42,
  6: 0.56,
  7: 0.48,
  8: 0.64,
  9: 0.52,
};

const MOBILE_SCROLL_STEP = 88;
const HEADER_SAMPLE_VH = 14;

type WorkColumn = {
  left: string;
  width: string;
  speed: number;
  initialY: number;
  tiles: readonly { height: number; image: number }[];
};

function columnCycleHeight(tiles: readonly { height: number }[]) {
  return tiles.reduce(
    (total, tile, index) => total + tile.height + (index > 0 ? 0.5 : 0),
    0,
  );
}

function computeColumnTranslateVh(virtualOffset: number, column: WorkColumn) {
  const cycleHeight = columnCycleHeight(column.tiles);
  const travel = (virtualOffset / 900) * column.speed * cycleHeight;
  const rawOffset = ((travel % cycleHeight) + cycleHeight) % cycleHeight;

  return column.initialY - cycleHeight - rawOffset;
}

function imageIndexAtColumnSample(
  virtualOffset: number,
  column: WorkColumn,
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

export function workHeaderNavTone(
  virtualOffset: number,
  options: {
    isMobile: boolean;
    imageCount: number;
    leftColumn?: WorkColumn;
  },
) {
  const imageIndex = options.isMobile
    ? ((Math.round(virtualOffset / MOBILE_SCROLL_STEP) % options.imageCount) +
        options.imageCount) %
      options.imageCount
    : options.leftColumn
      ? imageIndexAtColumnSample(
          virtualOffset,
          options.leftColumn,
          HEADER_SAMPLE_VH,
        )
      : 0;

  const luminance = WORK_IMAGE_LUMINANCE[imageIndex] ?? 0.52;

  return luminanceToNavTone(luminance);
}
