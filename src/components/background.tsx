'use client';

import React, { useRef, useEffect } from 'react';
import { useGame } from './providers/game';
import { useBlock } from './providers/block';

interface RenderState {
  width: number;
  height: number;
  fontSize: number;
  columns: number;
  drops: number[];
  hexChars: string;
  lastTime: DOMHighResTimeStamp;
  crashed?: DOMHighResTimeStamp;
  speed: number;
  mode: 'idle' | 'running';
  progress: number;
}

const MatrixRainBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderState = useRef<RenderState>({
    width: 0,
    height: 0,
    fontSize: 0,
    columns: 0,
    drops: [] as number[],
    hexChars: '0123456789ABCDEF',
    lastTime: performance.now(),
    speed: 50,
    mode: 'idle',
    progress: 0,
  });
  const { number } = useBlock();
  const { state } = useGame();

  useEffect(() => {
    if (!state || !number) return;

    if (state.end === number - 1) {
      renderState.current.crashed = performance.now();
      renderState.current.mode = 'idle';
    }

    if (state.start && !state.end && state.start <= number) {
      renderState.current.mode = 'running';
    }
  }, [state, number]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas dimensions
    renderState.current.width = canvas.width = window.innerWidth;
    renderState.current.height = canvas.height = window.innerHeight;

    renderState.current.fontSize = renderState.current.width < 640 ? 10 : 16;
    const columns = Math.floor(renderState.current.width / renderState.current.fontSize);
    renderState.current.drops = Array.from(
      { length: columns },
      () => (Math.random() * renderState.current.height) / renderState.current.fontSize
    );

    // Handle window resizing
    const handleResize = () => {
      renderState.current.width = canvas.width = window.innerWidth;
      renderState.current.height = canvas.height = window.innerHeight;
      renderState.current.fontSize = renderState.current.width < 640 ? 10 : 16;
      const newColumns = Math.floor(renderState.current.width / renderState.current.fontSize);
      renderState.current.drops = Array.from(
        { length: newColumns },
        () => (Math.random() * renderState.current.height) / renderState.current.fontSize
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (time: DOMHighResTimeStamp) => {
      const delta = time - renderState.current.lastTime;
      renderState.current.lastTime = time;
      renderState.current.progress += delta;

      // ramp the speed up and down
      if (renderState.current.mode === 'running') {
        // faster animation by decreasing the speed value
        renderState.current.speed -= delta / 100;
        renderState.current.speed = Math.max(renderState.current.speed, 15);
      } else {
        // slower animation by increasing the speed value
        renderState.current.speed += delta / 100;
        renderState.current.speed = Math.min(renderState.current.speed, 70);
      }

      if (renderState.current.progress < renderState.current.speed) {
        requestAnimationFrame(draw);
        return;
      } else {
        renderState.current.progress = 0;
      }

      // Fade the previous frame for a trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, renderState.current.width, renderState.current.height);

      if (renderState.current.crashed && time - renderState.current.crashed < 3000) {
        // Red text for crash state
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      } else if (renderState.current.crashed) {
        // Reset the crash state
        renderState.current.crashed = undefined;
      } else if (renderState.current.mode === 'running') {
        // Set the console-green text style
        ctx.fillStyle = 'rgba(0, 255, 70, 0.8)';
      } else {
        // Set the console-gray text style
        ctx.fillStyle = 'rgba(82, 82, 82, 0.8)';
      }
      ctx.font = `${renderState.current.fontSize}px monospace`;

      renderState.current.drops.forEach((y, i) => {
        // Pick a random hex character
        const text = renderState.current.hexChars.charAt(
          Math.floor(Math.random() * renderState.current.hexChars.length)
        );
        const x = i * renderState.current.fontSize;
        ctx.fillText(text, x, y * renderState.current.fontSize);

        // Reset drop to top at random
        if (
          y * renderState.current.fontSize > renderState.current.height &&
          Math.random() > 0.975
        ) {
          renderState.current.drops[i] = 0;
        }

        // Move drop down
        renderState.current.drops[i]++;
      });

      requestAnimationFrame(draw);
    };

    draw(renderState.current.lastTime);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-10 h-full"
      style={{
        WebkitMaskImage: 'radial-gradient(ellipse at center, #0000001A 50%, black)',
        maskImage: 'radial-gradient(ellipse at center, #0000001A 50%, black)',
      }}
    />
  );
};

export default MatrixRainBackground;
