import { getMobileFocusedImageIndex } from "@/lib/mobileWorkScroll";
import {
  workColumns,
  workImageIndexAtColumnSample,
  type WorkColumnDefinition,
} from "@/lib/workColumnLayout";
import { luminanceToNavTone } from "@/lib/sectionNavTone";

/** Approximate perceived luminance after grayscale + contrast (0 = dark, 1 = light). */
const WORK_IMAGE_LUMINANCE: Record<number, number> = {
  0: 0.46,
  1: 0.7,
  2: 0.58,
  3: 0.54,
  4: 0.5,
  5: 0.42,
  6: 0.56,
  7: 0.48,
  8: 0.64,
  9: 0.52,
};

const HEADER_SAMPLE_VH = 14;

export function workHeaderNavTone(
  virtualOffset: number,
  options: {
    isMobile: boolean;
    imageCount: number;
    leftColumn?: WorkColumnDefinition;
  },
) {
  const imageIndex = options.isMobile
    ? getMobileFocusedImageIndex(virtualOffset)
    : options.leftColumn
      ? workImageIndexAtColumnSample(
          virtualOffset,
          options.leftColumn,
          HEADER_SAMPLE_VH,
        )
      : 0;

  const luminance = WORK_IMAGE_LUMINANCE[imageIndex] ?? 0.52;

  return luminanceToNavTone(luminance);
}
