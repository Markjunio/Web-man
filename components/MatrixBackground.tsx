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
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    };
    
    resize();
    
    const controller = new AbortController();
    window.addEventListener('resize', resize, { passive: true, signal: controller.signal });

    const fontSize = 18;
    let columns = Math.ceil(width / fontSize);
    let drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);
    const chars = '01010101ELONFLASHER'; 

    let animReq: number;
    let lastTime = 0;
    // Lower FPS for a cinematic slow-running feel
    const fps = 6; 
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animReq = requestAnimationFrame(draw);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      // Trailing effect - dark background for cleaner contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      
      const colors = isProcessing ? ['#ffffff', '#0aff0a'] : ['#0aff0a33', '#0aff0a11', '#0aff0a22'];

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.995) {
          drops[i] = 0;
        }
        
        drops[i] += isProcessing ? 0.8 : 0.4;
      }
    };

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
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none transition-opacity duration-1000"
      style={{ 
        background: '#000000',
        filter: 'blur(4px)', // Applied blur for the atmospheric look
        opacity: 0.25 
      }}
    />
  );
};

export default MatrixBackground;