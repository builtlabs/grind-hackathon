'use client';

import React, { useRef, useEffect } from 'react';

const MatrixRainBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas dimensions
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const fontSize = width < 640 ? 10 : 16;
    const columns = Math.floor(width / fontSize);
    let drops: number[] = Array.from(
      { length: columns },
      () => (Math.random() * height) / fontSize
    );

    const hexChars = '0123456789ABCDEF';

    let lastTime = performance.now();
    let progress = 0;
    const speed = 50; // TODO: change speed depending on the game state
    const draw = (time: DOMHighResTimeStamp) => {
      const delta = time - lastTime;
      lastTime = time;
      progress += delta;

      if (progress < speed) {
        requestAnimationFrame(draw);
        return;
      } else {
        progress = 0;
      }

      // Fade the previous frame for a trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Set the console-green text style
      ctx.fillStyle = 'rgba(0, 255, 70, 0.8)';
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        // Pick a random hex character
        const text = hexChars.charAt(Math.floor(Math.random() * hexChars.length));
        const x = i * fontSize;
        ctx.fillText(text, x, y * fontSize);

        // Reset drop to top at random
        if (y * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      });

      requestAnimationFrame(draw);
    };

    draw(lastTime);

    // Handle window resizing
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const fontSize = width < 640 ? 10 : 16;
      const newColumns = Math.floor(width / fontSize);
      drops = Array.from({ length: newColumns }, () => (Math.random() * height) / fontSize);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
