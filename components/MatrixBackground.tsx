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
    // Set a lower FPS for that "slow running" cinematic feel
    const fps = 8; 
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animReq = requestAnimationFrame(draw);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      // Trailing effect - completely dark with faint trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; 
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      
      // Slightly different green colors for variety
      const colors = isProcessing ? ['#ffffff', '#0aff0a'] : ['#0aff0a', '#004400', '#0a880a'];

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillText(char, x, y);

        // Slow movement logic
        if (y > height && Math.random() > 0.99) {
          drops[i] = 0;
        }
        
        // Very slow vertical increment
        drops[i] += isProcessing ? 1.0 : 0.6;
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
        filter: 'blur(3px)', // Apply the requested blur effect
        opacity: 0.35 // Slightly increased visibility since it is blurred
      }}
    />
  );
};

export default MatrixBackground;