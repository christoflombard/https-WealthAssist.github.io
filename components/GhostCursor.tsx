'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  age: number;
}

export default function GhostCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points: Point[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Add new point
      points.push({
        x: mouseX,
        y: mouseY,
        age: 0
      });

      // Limit points
      if (points.length > 50) {
        points.shift();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw points
      for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];
        point.age += 0.02;

        if (point.age > 1) {
          points.splice(i, 1);
          continue;
        }

        const alpha = 1 - point.age;
        const size = (1 - point.age) * 20 + 5;

        // Draw ghost-like glow
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size * 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        gradient.addColorStop(0.4, `rgba(220, 220, 255, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(200, 200, 255, 0)`);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw main cursor glow
      if (points.length > 0) {
        const mainGradient = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, 40
        );
        mainGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        mainGradient.addColorStop(0.3, 'rgba(230, 230, 255, 0.5)');
        mainGradient.addColorStop(0.6, 'rgba(200, 200, 255, 0.2)');
        mainGradient.addColorStop(1, 'rgba(180, 180, 255, 0)');

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 40, 0, Math.PI * 2);
        ctx.fillStyle = mainGradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
