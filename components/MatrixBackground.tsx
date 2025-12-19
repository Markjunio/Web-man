import React, { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
  isProcessing?: boolean;
}

const MatrixBackground: React.FC<MatrixBackgroundProps> = ({ isProcessing = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const mouseVelocity = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const frameCount = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Performance optimization
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const chars = '01ELONFLASHER{}[]();:.,<>?/|\\!@#$%^&*~`+-=量子传输启动';
    const charArray = chars.split('');
    const fontSize = 16;
    let columns = Math.ceil(canvas.width / fontSize);
    let drops: number[] = Array(columns).fill(1);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      const dx = mousePos.current.x - lastMousePos.current.x;
      const dy = mousePos.current.y - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      mouseVelocity.current = Math.min(dist * 0.5, 15);
      lastMousePos.current = { ...mousePos.current };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      // Throttle to 30fps for background to save CPU for main thread
      if (frameCount.current % 2 === 0) {
        ctx.fillStyle = isProcessing ? 'rgba(0, 15, 8, 0.15)' : 'rgba(0, 8, 5, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = charArray[Math.floor(Math.random() * charArray.length)];
          
          const dropX = i * fontSize;
          const dropY = drops[i] * fontSize;
          const distToMouse = Math.sqrt(Math.pow(dropX - mousePos.current.x, 2) + Math.pow(dropY - mousePos.current.y, 2));
          
          if (distToMouse < 150) {
            ctx.fillStyle = '#ffffff'; 
          } else if (isProcessing && Math.random() > 0.98) {
            ctx.fillStyle = '#00ffaa'; 
          } else {
            ctx.fillStyle = '#0aff0a'; 
          }

          ctx.fillText(text, dropX, dropY);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          
          const moveStep = isProcessing ? 1.5 : 1;
          drops[i] += moveStep;
        }
      }

      mouseVelocity.current *= 0.95;
      frameCount.current++;
      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      resize();
      const newColumns = Math.ceil(canvas.width / fontSize);
      if (newColumns > drops.length) {
        const extra = Array(newColumns - drops.length).fill(1);
        drops.push(...extra);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isProcessing]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full -z-10 pointer-events-none transition-opacity duration-1000 ${isProcessing ? 'opacity-60' : 'opacity-30'}`}
      style={{ background: '#000805' }}
    />
  );
};

export default MatrixBackground;