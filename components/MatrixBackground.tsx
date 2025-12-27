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
      desynchronized: true 
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
    
    const controller = new AbortController();
    window.addEventListener('resize', resize, { passive: true, signal: controller.signal });

    const fontSize = 16;
    let columns = Math.ceil(width / fontSize);
    let drops: number[] = Array(columns).fill(0).map(() => Math.random() * -50);
    const chars = '01ELONFLASHER'; 

    let animReq: number;
    let lastTime = 0;
    const fps = 10; // Slightly higher for smoother but still light animation
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animReq = requestAnimationFrame(draw);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      ctx.fillStyle = 'rgba(0, 8, 5, 0.2)'; // More transparency for smoother fading
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = isProcessing ? '#ffffff' : '#0aff0a';
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += isProcessing ? 1.5 : 1.0;
      }
    };

    // Reduced delay for immediate feedback
    const timer = setTimeout(() => {
      animReq = requestAnimationFrame(draw);
    }, 100);

    return () => {
      clearTimeout(timer);
      controller.abort();
      if (animReq) cancelAnimationFrame(animReq);
    };
  }, [isProcessing]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-25 transition-opacity duration-1000"
      style={{ background: '#000805' }}
    />
  );
};

export default MatrixBackground;