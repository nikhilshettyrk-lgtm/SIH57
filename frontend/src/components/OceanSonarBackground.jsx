import React, { useEffect, useRef } from 'react';

/**
 * OceanSonarBackground
 * 
 * Deep underwater acoustic theme for Home/Workflow view:
 * - Full-bleed background: deep navy-to-black gradient (#0a1628 → #000814)
 * - Faint acoustic grid/mesh pattern overlay (~5% cyan lines)
 * - Subtle animated side-scan sonar sweep effect: concentric semi-transparent arcs
 *   radiating downward/outward from transducer origin on a 5.2s loop (rgba(100, 200, 255, 0.15))
 *   plus downward-scrolling horizontal sonar scan line
 * - Soft-glow floating particles (sediment / micro-bubbles) drifting gently
 * - Sits strictly behind the white dashboard cards with pointer-events-none
 */
export default function OceanSonarBackground() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = 0;
    let height = 0;

    // Initialize 32 drifting sediment / micro-bubble particles
    const particleCount = 32;
    const particles = [];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * (width || 1000),
          y: Math.random() * (height || 800),
          radius: 1.0 + Math.random() * 2.2,
          vy: -(0.12 + Math.random() * 0.28), // slow upward drift
          vx: (Math.random() - 0.5) * 0.1,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.0008 + Math.random() * 0.0012,
          swayAmp: 0.2 + Math.random() * 0.4,
          baseAlpha: 0.15 + Math.random() * 0.25,
          pulseSpeed: 0.001 + Math.random() * 0.002,
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = Math.max(rect.height, window.innerHeight);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        initParticles();
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Sonar sweep wave parameters
    const arcCycleSeconds = 5.2; // 5.2s loop
    const arcWaveCount = 3;      // 3 staggered expanding concentric arcs
    const scanlineCycleSeconds = 6.5; // slow horizontal scanline sweep

    const render = (timestamp) => {
      ctx.clearRect(0, 0, width, height);

      const timeSec = timestamp / 1000;

      // 1. Concentric Sonar Arc Sweeps (radiating from top-center survey origin)
      const originX = width / 2;
      const originY = -30;
      const maxRadius = Math.hypot(width / 2, height + 40) + 60;

      for (let i = 0; i < arcWaveCount; i++) {
        const offset = (i * arcCycleSeconds) / arcWaveCount;
        const elapsed = (timeSec + offset) % arcCycleSeconds;
        const progress = elapsed / arcCycleSeconds; // 0 to 1

        // Radius expands smoothly
        const r = progress * maxRadius;

        // Opacity curve: soft fade-in, peak around 0.35 progress, fade-out toward edge
        // Max opacity kept around 0.15 as specified
        const alpha = Math.sin(progress * Math.PI) * 0.15;

        if (alpha > 0.005) {
          // Primary acoustic arc
          ctx.beginPath();
          ctx.arc(originX, originY, r, 0, Math.PI);
          ctx.strokeStyle = `rgba(100, 200, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Secondary faint harmonic echo arc (slightly inside)
          if (r > 30) {
            ctx.beginPath();
            ctx.arc(originX, originY, r - 16, 0, Math.PI);
            ctx.strokeStyle = `rgba(56, 189, 248, ${(alpha * 0.4).toFixed(3)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 2. Subtle Horizontal Side-Scan Sonar Sweep Line (downward scrolling)
      const scanProgress = (timeSec % scanlineCycleSeconds) / scanlineCycleSeconds;
      const scanY = scanProgress * height;
      const scanAlpha = Math.sin(scanProgress * Math.PI) * 0.14;

      if (scanAlpha > 0.005) {
        // Sweep line
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.strokeStyle = `rgba(100, 200, 255, ${scanAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Subtle gradient band trailing the sweep
        const sweepGrad = ctx.createLinearGradient(0, scanY - 35, 0, scanY);
        sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        sweepGrad.addColorStop(1, `rgba(56, 189, 248, ${(scanAlpha * 0.25).toFixed(3)})`);
        ctx.fillStyle = sweepGrad;
        ctx.fillRect(0, Math.max(0, scanY - 35), width, 35);
      }

      // 3. Drifting Soft-Glow Sediment / Bubble Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.vy;
        p.x += p.vx + Math.sin(timestamp * p.swaySpeed + p.swayPhase) * p.swayAmp;

        // Wrap around boundaries
        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }
        if (p.x < -15) p.x = width + 15;
        if (p.x > width + 15) p.x = -15;

        // Subtle pulsing opacity
        const pulse = Math.sin(timestamp * p.pulseSpeed + p.pulsePhase);
        const currentAlpha = Math.max(0.05, p.baseAlpha + pulse * 0.08);

        // Soft radial glow
        const glowRadius = p.radius * 2.8;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, `rgba(130, 220, 255, ${currentAlpha.toFixed(3)})`);
        grad.addColorStop(0.4, `rgba(56, 189, 248, ${(currentAlpha * 0.5).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(14, 165, 233, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none"
      aria-hidden="true"
    >
      {/* Deep navy-to-black ocean gradient (#0a1628 → #000814) */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #061120 40%, #030c18 70%, #000814 100%)'
        }}
      />

      {/* Faint acoustic survey grid/mesh overlay (~5% opacity cyan lines) */}
      <div 
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px'
        }}
      />

      {/* Top acoustic transducer ambient radial glow */}
      <div 
        className="absolute inset-x-0 top-0 h-[450px]"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(56, 189, 248, 0.12), transparent 70%)'
        }}
      />

      {/* Canvas layer for animated sonar ping arcs, scanline sweep, and drifting sediment particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 block w-full h-full"
      />

      {/* Subtle depth vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 8, 20, 0.45) 100%)'
        }}
      />
    </div>
  );
}
