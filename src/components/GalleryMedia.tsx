"use client";

import { motion } from "framer-motion";
import type { Ref, SyntheticEvent } from "react";

const colorTransition = {
  duration: 2.2,
  ease: [0.16, 1, 0.3, 1] as const,
};

const focusedFilter = "grayscale(0) contrast(1.1) brightness(1.03)";
const idleFilter = "grayscale(1) contrast(1.1) brightness(0.96)";

interface GalleryImageProps {
  src: string;
  alt: string;
  isFocused: boolean;
  className?: string;
  loading?: "eager" | "lazy";
  freezeTransitions?: boolean;
  srcSet?: string;
  sizes?: string;
}

export function GalleryImage({
  src,
  alt,
  isFocused,
  className = "object-contain",
  loading = "lazy",
  freezeTransitions = false,
  srcSet,
  sizes,
}: GalleryImageProps) {
  return (
    <motion.img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={
        className.includes("h-auto")
          ? className
          : `h-full w-full ${className}`
      }
      animate={{ filter: isFocused ? focusedFilter : idleFilter }}
      transition={freezeTransitions ? { duration: 0 } : colorTransition}
      loading={loading}
      decoding="async"
    />
  );
}

interface GalleryVideoProps {
  src: string;
  isFocused: boolean;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  onLoadedMetadata?: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onPlay?: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onPause?: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onTimeUpdate?: (event: SyntheticEvent<HTMLVideoElement>) => void;
  videoRef?: Ref<HTMLVideoElement>;
}

export function GalleryVideo({
  isFocused,
  className = "",
  videoRef,
  src,
  autoPlay,
  muted,
  loop,
  playsInline,
  onLoadedMetadata,
  onPlay,
  onPause,
  onTimeUpdate,
}: GalleryVideoProps) {
  return (
    <motion.video
      ref={videoRef}
      src={src}
      className={`pointer-events-none h-full w-full object-contain ${className}`}
      animate={{ filter: isFocused ? focusedFilter : idleFilter }}
      transition={colorTransition}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      onLoadedMetadata={onLoadedMetadata}
      onPlay={onPlay}
      onPause={onPause}
      onTimeUpdate={onTimeUpdate}
    />
  );
}
