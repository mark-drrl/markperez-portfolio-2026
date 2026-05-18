"use client";

import { motion, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

const FRAME_INTERVAL = 58;
const GRAIN_ALPHA = 96;

interface ProceduralGrainProps {
  opacity?: MotionValue<number> | number;
}

function nextNoise(seed: number) {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

export default function ProceduralGrain({ opacity = 0.25 }: ProceduralGrainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const canvasElement = canvas;
    const context = canvasElement.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    const grainContext = context;
    let animationFrameId = 0;
    let seed = 0x8f3d9a2b;
    let lastRender = 0;
    let imageData: ImageData | null = null;
    let pixelBuffer: Uint32Array | null = null;

    function resize() {
      const width = Math.max(1, Math.floor(window.innerWidth));
      const height = Math.max(1, Math.floor(window.innerHeight));

      if (
        canvasElement.width === width &&
        canvasElement.height === height &&
        imageData &&
        pixelBuffer
      ) {
        return;
      }

      canvasElement.width = width;
      canvasElement.height = height;
      imageData = grainContext.createImageData(
        canvasElement.width,
        canvasElement.height,
      );
      pixelBuffer = new Uint32Array(imageData.data.buffer);
      grainContext.imageSmoothingEnabled = false;
      drawGrain();
    }

    function drawGrain() {
      if (!imageData || !pixelBuffer) {
        return;
      }

      let localSeed = seed;

      for (let index = 0; index < pixelBuffer.length; index += 1) {
        localSeed = nextNoise(localSeed);

        const noise = localSeed >>> 24;
        const lifted = Math.max(
          0,
          Math.min(255, Math.floor(78 + (noise / 255) * 112)),
        );

        pixelBuffer[index] =
          (GRAIN_ALPHA << 24) | (lifted << 16) | (lifted << 8) | lifted;
      }

      seed = nextNoise(localSeed);
      grainContext.putImageData(imageData, 0, 0);
    }

    function render(time: number) {
      if (document.visibilityState === "visible" && time - lastRender > FRAME_INTERVAL) {
        lastRender = time;
        drawGrain();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    resize();
    drawGrain();
    animationFrameId = requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[55] h-screen w-full mix-blend-multiply"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
