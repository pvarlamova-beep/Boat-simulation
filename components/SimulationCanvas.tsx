import React, { useRef, useEffect, useCallback } from 'react';
import { SimulationConfig, SimulationStats } from '../types';

interface SimulationCanvasProps {
  config: SimulationConfig;
  isPlaying: boolean;
  shouldReset: boolean;
  onResetComplete: () => void;
  onStatsUpdate: (stats: SimulationStats) => void;
}

// Physics Constants
const PIXELS_PER_METER = 5; // 1m = 5px
const RIVER_WIDTH_METERS = 80; // River is 80m wide
const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 800;
const RIVER_Y_START = 50;
const RIVER_HEIGHT = RIVER_WIDTH_METERS * PIXELS_PER_METER;

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  config,
  isPlaying,
  shouldReset,
  onResetComplete,
  onStatsUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  
  // Physics State (Refs for mutable data without re-renders)
  const posRef = useRef({ x: 50, y: RIVER_Y_START + RIVER_HEIGHT }); // Start at bottom bank
  const timeRef = useRef(0);
  const trailRef = useRef<{x: number, y: number, opacity: number}[]>([]);
  const waveOffsetRef = useRef(0);
  const isFinishedRef = useRef(false);

  // Helper to reset simulation state
  const resetSimulation = useCallback(() => {
    posRef.current = { x: 50, y: RIVER_Y_START + RIVER_HEIGHT };
    timeRef.current = 0;
    trailRef.current = [];
    isFinishedRef.current = false;
    onStatsUpdate({
      time: 0,
      displacementX: 0,
      displacementY: 0,
      isFinished: false
    });
  }, [onStatsUpdate]);

  useEffect(() => {
    if (shouldReset) {
      resetSimulation();
      onResetComplete();
    }
  }, [shouldReset, resetSimulation, onResetComplete]);

  // Drawing Helpers
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    label: string
  ) => {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = color;
    ctx.fill();

    // Label
    ctx.fillStyle = '#1e293b'; // Slate 800
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(label, toX + 5, toY - 5);
  };

  const drawBoat = (ctx: CanvasRenderingContext2D, x: number, y: number, angleDeg: number) => {
    ctx.save();
    ctx.translate(x, y);
    // Visual rotation should match the boat's "heading", which is config.angle
    // In canvas, 0 is right, -90 is up.
    // Our input: 0 is Right (Downstream), 90 is Up (Cross). 
    // So Canvas Rotation = -Angle (in radians)
    ctx.rotate(-config.angle * (Math.PI / 180));

    // Simple Boat Shape
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 10, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b'; // Amber 500
    ctx.strokeStyle = '#78350f'; // Amber 900
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Bow indicator
    ctx.beginPath();
    ctx.moveTo(10, -5);
    ctx.lineTo(20, 0);
    ctx.lineTo(10, 5);
    ctx.stroke();

    ctx.restore();
  };

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = (time - lastTimeRef.current) / 1000; // seconds since last frame
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- PHYSICS UPDATE ---
    if (isPlaying && !isFinishedRef.current) {
      // Inputs
      const theta = config.angle * (Math.PI / 180); // Radians
      
      // Velocity Components (m/s)
      // Standard coordinate system: x right, y up.
      // Canvas coordinate system: x right, y down.
      // We need to invert Y for drawing.
      
      const vBx = config.boatSpeed * Math.cos(theta); // Boat x component
      const vBy = config.boatSpeed * Math.sin(theta); // Boat y component
      
      const vRx = config.riverSpeed; // River always flows +x
      const vRy = 0;

      const vGx = vBx + vRx; // Ground velocity x
      const vGy = vBy + vRy; // Ground velocity y

      // Simulation Time Step
      // Use config.simSpeed to speed up/slow down time
      // 60FPS roughly implies dt is small. 
      const dt = deltaTime * config.simSpeed;

      // Update Physics Position (Meters relative to start)
      // Note: We don't store "meters from origin" in posRef, we store canvas pixels.
      // Let's calculate displacement in meters first.
      const dx = vGx * dt;
      const dy = vGy * dt;

      timeRef.current += dt;

      // Update Canvas Position
      // x increases (right), y decreases (up) in canvas
      posRef.current.x += dx * PIXELS_PER_METER;
      posRef.current.y -= dy * PIXELS_PER_METER; // Subtract because Y goes UP in physics but DOWN in canvas

      // Add trail point
      if (timeRef.current * 100 % 5 < 1) { // Optimize: don't add every frame
          trailRef.current.push({ x: posRef.current.x, y: posRef.current.y, opacity: 1 });
      }

      // Check Boundary (Reached other side)
      if (posRef.current.y <= RIVER_Y_START) {
        posRef.current.y = RIVER_Y_START; // Clamp
        isFinishedRef.current = true;
      }
      
      // Boundary check X
      if (posRef.current.x > CANVAS_WIDTH) {
          // Wrap around or stop? Usually in these sims, wrapping is confusing. 
          // Let's just let it go off screen, but maybe clamp for the view or let cam follow?
          // For simplicity, we let it go off screen.
      }

      // Update Stats
      const startYPixels = RIVER_Y_START + RIVER_HEIGHT;
      const currentYPixels = posRef.current.y;
      const dispY = (startYPixels - currentYPixels) / PIXELS_PER_METER;
      
      const startXPixels = 50;
      const currentXPixels = posRef.current.x;
      const dispX = (currentXPixels - startXPixels) / PIXELS_PER_METER;

      onStatsUpdate({
        time: timeRef.current,
        displacementX: dispX,
        displacementY: dispY,
        isFinished: isFinishedRef.current
      });
    }

    // --- DRAWING ---

    // 1. Draw Banks
    ctx.fillStyle = '#22c55e'; // Green 500
    ctx.fillRect(0, 0, CANVAS_WIDTH, RIVER_Y_START); // Top Bank
    ctx.fillRect(0, RIVER_Y_START + RIVER_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - (RIVER_Y_START + RIVER_HEIGHT)); // Bottom Bank

    // 2. Draw River
    ctx.fillStyle = '#3b82f6'; // Blue 500
    ctx.fillRect(0, RIVER_Y_START, CANVAS_WIDTH, RIVER_HEIGHT);

    // 3. Draw Waves
    ctx.strokeStyle = '#60a5fa'; // Blue 400
    ctx.lineWidth = 2;
    waveOffsetRef.current += config.riverSpeed * 0.5; // Animate waves based on river speed
    for (let y = RIVER_Y_START + 20; y < RIVER_Y_START + RIVER_HEIGHT; y += 40) {
      ctx.beginPath();
      for (let x = 0; x <= CANVAS_WIDTH; x += 10) {
        const waveY = y + Math.sin((x - waveOffsetRef.current) * 0.05) * 5;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }

    // 4. Draw Trail
    if (config.showTrajectory) {
        ctx.beginPath();
        if (trailRef.current.length > 0) {
            ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
            for (const point of trailRef.current) {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // 5. Draw Boat
    drawBoat(ctx, posRef.current.x, posRef.current.y, config.angle);

    // 6. Draw Vectors
    if (config.showVectors) {
      const originX = posRef.current.x;
      const originY = posRef.current.y;
      const scale = 20; // Scale factor for vector visualization

      const theta = config.angle * (Math.PI / 180);
      const vBx = config.boatSpeed * Math.cos(theta);
      const vBy = -config.boatSpeed * Math.sin(theta); // Negative because canvas Y is down

      const vRx = config.riverSpeed;
      const vRy = 0;

      const vGx = vBx + vRx;
      const vGy = vBy + vRy;

      // Boat Velocity (Relative to water) - Green
      drawArrow(ctx, originX, originY, originX + vBx * scale, originY + vBy * scale, '#16a34a', 'Vb');

      // River Velocity - Blue
      // We draw this from the tip of Vb if we want to show head-to-tail, 
      // OR from the boat center if we just want to show components acting on the object.
      // Prompt says: "Vectors drawn from the boat, not from a corner".
      // Usually, concurrent vectors are best drawn from the center of mass.
      drawArrow(ctx, originX, originY, originX + vRx * scale, originY + vRy * scale, '#0ea5e9', 'Vr');

      // Resultant Velocity - Red
      drawArrow(ctx, originX, originY, originX + vGx * scale, originY + vGy * scale, '#dc2626', 'Vtot');
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying, config, onStatsUpdate, drawBoat, drawArrow]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="relative w-full h-full bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain bg-slate-100"
      />
      
      {/* Overlay Scale Indicator */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-slate-600">
        River Width: {RIVER_WIDTH_METERS}m
      </div>
    </div>
  );
};

export default SimulationCanvas;
