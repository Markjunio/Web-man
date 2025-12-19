import React, { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
  isProcessing?: boolean;
}

const MatrixBackground: React.FC<MatrixBackgroundProps> = ({ isProcessing = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 16;
    let columns = Math.ceil(canvas.width / fontSize);
    let drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);
    const chars = '01ELONFLASHER{}[]();:.,<>?/|\\!@#$%^&*~`+-=量子传输启动';

    const draw = () => {
      // Throttle to 30fps to prioritize main app loading
      if (frameId.current % 2 === 0) {
        ctx.fillStyle = 'rgba(0, 8, 5, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = '#0aff0a';

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

          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += isProcessing ? 1.5 : 1;
        }
      }
      
      frameId.current++;
      requestAnimationFrame(draw);
    };

    const animReq = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animReq);
      window.removeEventListener('resize', resize);
    };
  }, [isProcessing]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-30"
      style={{ background: '#000805' }}
    />
  );
};

export default MatrixBackground;