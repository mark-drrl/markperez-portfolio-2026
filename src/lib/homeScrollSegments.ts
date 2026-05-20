export type HomeScrollSegment = "hero" | "convey" | "create" | "curate";

export type HomeSegmentMountState = Record<HomeScrollSegment, boolean>;

/** Mount buffers around each section’s scroll window (mobile). */
export const HOME_SEGMENT_MOUNT: Record<
  HomeScrollSegment,
  { enterBelow: number; exitAbove: number }
> = {
  hero: { enterBelow: 1, exitAbove: 0.14 },
  convey: { enterBelow: 0.08, exitAbove: 0.46 },
  create: { enterBelow: 0.36, exitAbove: 0.62 },
  curate: { enterBelow: 0.54, exitAbove: 0.72 },
};

export function getHomeSegmentMountState(progress: number): HomeSegmentMountState {
  return {
    hero: progress < HOME_SEGMENT_MOUNT.hero.exitAbove,
    convey:
      progress > HOME_SEGMENT_MOUNT.convey.enterBelow &&
      progress < HOME_SEGMENT_MOUNT.convey.exitAbove,
    create:
      progress > HOME_SEGMENT_MOUNT.create.enterBelow &&
      progress < HOME_SEGMENT_MOUNT.create.exitAbove,
    curate:
      progress > HOME_SEGMENT_MOUNT.curate.enterBelow &&
      progress < HOME_SEGMENT_MOUNT.curate.exitAbove,
  };
}

export function segmentMountStateChanged(
  previous: HomeSegmentMountState,
  next: HomeSegmentMountState,
) {
  return (
    previous.hero !== next.hero ||
    previous.convey !== next.convey ||
    previous.create !== next.create ||
    previous.curate !== next.curate
  );
}
