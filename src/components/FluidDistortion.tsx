"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_progress;
uniform float u_intensity;

varying vec2 v_uv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.02 + vec2(7.13, 3.71);
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  float slowTime = u_time * 0.085;
  float current = fbm(p * 3.8 + vec2(slowTime, -slowTime * 0.7) + u_progress * 2.0);
  float counter = fbm(p * 8.5 + vec2(-slowTime * 1.4, slowTime) - u_progress);
  float ribbons = sin((uv.y + current * 0.075 - u_progress * 0.18) * 42.0 + counter * 4.5);
  float caustic = smoothstep(0.42, 1.0, current) * 0.55 + smoothstep(0.58, 0.96, ribbons) * 0.45;

  float vignette = smoothstep(0.0, 0.14, uv.y) * smoothstep(1.0, 0.14, uv.y);
  float alpha = u_intensity * vignette * (0.08 + caustic * 0.18);

  vec3 glass = mix(vec3(0.88, 0.88, 0.84), vec3(0.56, 0.06, 0.10), caustic * 0.32);
  gl_FragColor = vec4(glass, alpha);
}
`;

function transitionStrength(progress: number) {
  const windows = [
    [0.003, 0.018, 0.052],
    [0.14, 0.16, 0.18],
    [0.34, 0.38, 0.42],
    [0.56, 0.6, 0.64],
  ];

  return Math.max(
    ...windows.map(([start, peak, end]) => {
      if (progress <= start || progress >= end) {
        return 0;
      }

      if (progress <= peak) {
        return (progress - start) / (peak - start);
      }

      return (end - progress) / (end - peak);
    }),
  );
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

interface FluidDistortionProps {
  progress: MotionValue<number>;
}

export default function FluidDistortion({ progress }: FluidDistortionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const intensityRef = useRef(0);

  useMotionValueEvent(progress, "change", (latest) => {
    progressRef.current = latest;
    intensityRef.current = transitionStrength(latest);
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const canvasElement = canvas;
    const gl = canvasElement.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });

    if (!gl) {
      return;
    }

    const glContext = gl;
    const program = createProgram(glContext);

    if (!program) {
      return;
    }

    const positionLocation = glContext.getAttribLocation(program, "a_position");
    const resolutionLocation = glContext.getUniformLocation(program, "u_resolution");
    const timeLocation = glContext.getUniformLocation(program, "u_time");
    const progressLocation = glContext.getUniformLocation(program, "u_progress");
    const intensityLocation = glContext.getUniformLocation(program, "u_intensity");
    const positionBuffer = glContext.createBuffer();
    let animationFrameId = 0;
    let wasActive = false;

    glContext.bindBuffer(glContext.ARRAY_BUFFER, positionBuffer);
    glContext.bufferData(
      glContext.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      glContext.STATIC_DRAW,
    );

    function resize() {
      const dpr = 1;
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);

      if (canvasElement.width !== width || canvasElement.height !== height) {
        canvasElement.width = width;
        canvasElement.height = height;
      }

      glContext.viewport(0, 0, canvasElement.width, canvasElement.height);
    }

    function render(time: number) {
      resize();
      const intensity = intensityRef.current;

      if (intensity <= 0.001) {
        if (wasActive) {
          glContext.clearColor(0, 0, 0, 0);
          glContext.clear(glContext.COLOR_BUFFER_BIT);
          wasActive = false;
        }

        animationFrameId = requestAnimationFrame(render);
        return;
      }

      wasActive = true;
      glContext.clearColor(0, 0, 0, 0);
      glContext.clear(glContext.COLOR_BUFFER_BIT);
      glContext.useProgram(program);
      glContext.enable(glContext.BLEND);
      glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);
      glContext.bindBuffer(glContext.ARRAY_BUFFER, positionBuffer);
      glContext.enableVertexAttribArray(positionLocation);
      glContext.vertexAttribPointer(positionLocation, 2, glContext.FLOAT, false, 0, 0);
      glContext.uniform2f(resolutionLocation, canvasElement.width, canvasElement.height);
      glContext.uniform1f(timeLocation, time * 0.001);
      glContext.uniform1f(progressLocation, progressRef.current);
      glContext.uniform1f(intensityLocation, intensity);
      glContext.drawArrays(glContext.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      glContext.deleteBuffer(positionBuffer);
      glContext.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[54] h-screen w-full opacity-90 mix-blend-overlay"
      aria-hidden="true"
    />
  );
}
