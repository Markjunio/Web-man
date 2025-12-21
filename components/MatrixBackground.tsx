import React, { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
  isProcessing?: boolean;
}

const MatrixBackground: React.FC<MatrixBackgroundProps> = ({ isProcessing = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true // Hint for lower latency
    });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#000805';
      ctx.fillRect(0, 0, width, height);
    };
    
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const fontSize = 16;
    let columns = Math.ceil(width / fontSize);
    let drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);
    const chars = '01ELONFLASHER{}[]();:.,<>?/|\\!@#$%^&*~`+-=量子传输启动';

    let animReq: number;
    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animReq = requestAnimationFrame(draw);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      ctx.fillStyle = 'rgba(0, 8, 5, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (isProcessing && Math.random() > 0.95) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#0aff0a';
        }

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += isProcessing ? 1.5 : 1;
      }
    };

    // Use a delay to ensure the main UI has hydrated and rendered before the canvas heavy lifting starts
    const timer = setTimeout(() => {
      animReq = requestAnimationFrame(draw);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (animReq) cancelAnimationFrame(animReq);
      window.removeEventListener('resize', resize);
    };
  }, [isProcessing]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ background: '#000805' }}
    />
  );
};

export default MatrixBackground;