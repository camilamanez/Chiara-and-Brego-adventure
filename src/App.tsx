/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

// --- Types & Constants ---

type CharacterType = 'Chiara' | 'Brego';

interface CharacterStats {
  width: number;
  height: number;
  color: string;
  secondaryColor: string;
  jumpForce: number;
  speed: number;
}

const STATS: Record<CharacterType, CharacterStats> = {
  Chiara: {
    width: 40,
    height: 30,
    color: '#1a1a1a', // Black
    secondaryColor: '#ffffff', // White
    jumpForce: -12,
    speed: 7,
  },
  Brego: {
    width: 30,
    height: 22,
    color: '#c68e17', // Sable/Brown
    secondaryColor: '#ffffff', // White
    jumpForce: -10,
    speed: 9,
  },
};

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Platform extends Entity {
  color: string;
  type?: 'static' | 'horizontal' | 'vertical';
  range?: number;
  speed?: number;
  offset?: number;
  initialX?: number;
  initialY?: number;
}

interface Bone {
  x: number;
  y: number;
  collected: boolean;
}

interface Level {
  platforms: Platform[];
  bones: Bone[];
  goal: Entity;
}

const LEVELS: Level[] = [
  {
    platforms: [
      { x: 0, y: 550, width: 2000, height: 50, color: '#4d2d18', type: 'static' },
      { x: 300, y: 450, width: 150, height: 20, color: '#2d5a27', type: 'static' },
      { x: 550, y: 350, width: 150, height: 20, color: '#2d5a27', type: 'static' },
      { x: 200, y: 250, width: 150, height: 20, color: '#2d5a27', type: 'static' },
      { x: 450, y: 150, width: 150, height: 20, color: '#2d5a27', type: 'static' },
      { x: 800, y: 400, width: 200, height: 20, color: '#2d5a27', type: 'horizontal', range: 200, speed: 2, initialX: 800, initialY: 400 },
      { x: 1100, y: 300, width: 150, height: 20, color: '#2d5a27', type: 'vertical', range: 150, speed: 1.5, initialX: 1100, initialY: 300 },
    ],
    bones: [
      { x: 350, y: 420, collected: false },
      { x: 600, y: 320, collected: false },
      { x: 250, y: 220, collected: false },
      { x: 500, y: 120, collected: false },
      { x: 850, y: 370, collected: false },
      { x: 1150, y: 270, collected: false },
    ],
    goal: { x: 1800, y: 450, width: 60, height: 100 }
  },
  {
    platforms: [
      { x: 0, y: 550, width: 2500, height: 50, color: '#4d2d18', type: 'static' },
      { x: 100, y: 400, width: 120, height: 20, color: '#2d5a27', type: 'static' },
      { x: 300, y: 300, width: 120, height: 20, color: '#2d5a27', type: 'vertical', range: 200, speed: 2, initialX: 300, initialY: 300 },
      { x: 500, y: 450, width: 120, height: 20, color: '#2d5a27', type: 'static' },
      { x: 700, y: 350, width: 150, height: 20, color: '#2d5a27', type: 'horizontal', range: 300, speed: 3, initialX: 700, initialY: 350 },
      { x: 1100, y: 250, width: 120, height: 20, color: '#2d5a27', type: 'static' },
      { x: 1300, y: 400, width: 120, height: 20, color: '#2d5a27', type: 'vertical', range: 150, speed: 2, initialX: 1300, initialY: 400 },
      { x: 1500, y: 200, width: 150, height: 20, color: '#2d5a27', type: 'static' },
      { x: 1800, y: 350, width: 150, height: 20, color: '#2d5a27', type: 'horizontal', range: 200, speed: 2, initialX: 1800, initialY: 350 },
    ],
    bones: [
      { x: 150, y: 370, collected: false },
      { x: 350, y: 250, collected: false },
      { x: 550, y: 420, collected: false },
      { x: 800, y: 320, collected: false },
      { x: 1150, y: 220, collected: false },
      { x: 1350, y: 370, collected: false },
      { x: 1550, y: 170, collected: false },
    ],
    goal: { x: 2300, y: 450, width: 60, height: 100 }
  },
  {
    platforms: [
      { x: 0, y: 550, width: 3000, height: 50, color: '#4d2d18', type: 'static' },
      { x: 200, y: 400, width: 100, height: 20, color: '#2d5a27', type: 'static' },
      { x: 400, y: 300, width: 100, height: 20, color: '#2d5a27', type: 'vertical', range: 200, speed: 2.5, initialX: 400, initialY: 300 },
      { x: 700, y: 200, width: 100, height: 20, color: '#2d5a27', type: 'horizontal', range: 300, speed: 3.5, initialX: 700, initialY: 200 },
      { x: 1100, y: 350, width: 100, height: 20, color: '#2d5a27', type: 'static' },
      { x: 1300, y: 250, width: 100, height: 20, color: '#2d5a27', type: 'vertical', range: 150, speed: 3, initialX: 1300, initialY: 250 },
      { x: 1600, y: 400, width: 100, height: 20, color: '#2d5a27', type: 'horizontal', range: 400, speed: 4, initialX: 1600, initialY: 400 },
      { x: 2100, y: 300, width: 100, height: 20, color: '#2d5a27', type: 'static' },
      { x: 2400, y: 200, width: 100, height: 20, color: '#2d5a27', type: 'static' },
    ],
    bones: [
      { x: 250, y: 370, collected: false },
      { x: 450, y: 150, collected: false },
      { x: 750, y: 170, collected: false },
      { x: 1150, y: 320, collected: false },
      { x: 1350, y: 150, collected: false },
      { x: 1650, y: 370, collected: false },
      { x: 2150, y: 270, collected: false },
      { x: 2450, y: 170, collected: false },
    ],
    goal: { x: 2800, y: 450, width: 60, height: 100 }
  }
];

// --- Main Component ---

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [character, setCharacter] = useState<CharacterType>('Chiara');
  const [score, setScore] = useState(0);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Audio Context for retro sounds
  const audioCtx = useRef<AudioContext | null>(null);

  const playSound = (type: 'jump' | 'collect' | 'victory') => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'collect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'victory') {
      osc.type = 'triangle';
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
      });
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  // Game state refs to avoid re-renders in the loop
  const gameState = useRef({
    player: {
      x: 50,
      y: 300,
      vx: 0,
      vy: 0,
      width: STATS.Chiara.width,
      height: STATS.Chiara.height,
      grounded: false,
      jumpCount: 0,
    },
    keys: {
      left: false,
      right: false,
      up: false,
      upPressed: false,
    },
    platforms: JSON.parse(JSON.stringify(LEVELS[0].platforms)) as Platform[],
    bones: JSON.parse(JSON.stringify(LEVELS[0].bones)) as Bone[],
    goal: LEVELS[0].goal,
    floatingTexts: [] as { x: number, y: number, text: string, life: number }[],
    cameraX: 0,
    gravity: 0.6,
    friction: 0.8,
    levelTimer: 0,
    score: 0,
    currentLevelIdx: 0,
  });

  // Update player stats when character changes
  useEffect(() => {
    gameState.current.player.width = STATS[character].width;
    gameState.current.player.height = STATS[character].height;
  }, [character]);

  // Handle level change
  useEffect(() => {
    const level = LEVELS[currentLevelIdx];
    if (!level) return;
    gameState.current.platforms = JSON.parse(JSON.stringify(level.platforms));
    gameState.current.bones = JSON.parse(JSON.stringify(level.bones));
    gameState.current.goal = level.goal;
    gameState.current.player.x = 50;
    gameState.current.player.y = 300;
    gameState.current.player.vx = 0;
    gameState.current.player.vy = 0;
    gameState.current.cameraX = 0;
    gameState.current.currentLevelIdx = currentLevelIdx;
  }, [currentLevelIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        if (!gameState.current.keys.up) {
          gameState.current.keys.upPressed = true;
        }
        gameState.current.keys.up = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        gameState.current.keys.up = false;
        gameState.current.keys.upPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = () => {
      const { player, keys, platforms, bones, goal, floatingTexts, gravity, friction } = gameState.current;
      const stats = STATS[character];
      gameState.current.levelTimer += 0.02;

      // Update floating texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].y -= 1;
        floatingTexts[i].life -= 0.02;
        if (floatingTexts[i].life <= 0) {
          floatingTexts[i] = floatingTexts[floatingTexts.length - 1];
          floatingTexts.pop();
        }
      }

      // Update moving platforms
      for (const plat of platforms) {
        if (plat.type === 'horizontal' && plat.range && plat.speed && plat.initialX !== undefined) {
          const oldX = plat.x;
          plat.x = plat.initialX + Math.sin(gameState.current.levelTimer * plat.speed) * plat.range;
          // If player is on this platform, move them with it
          if (player.grounded && player.y + player.height === plat.y && player.x + player.width > plat.x && player.x < plat.x + plat.width) {
            player.x += (plat.x - oldX);
          }
        } else if (plat.type === 'vertical' && plat.range && plat.speed && plat.initialY !== undefined) {
          const oldY = plat.y;
          plat.y = plat.initialY + Math.sin(gameState.current.levelTimer * plat.speed) * plat.range;
          // If player is on this platform, move them with it
          if (player.grounded && player.y + player.height === oldY && player.x + player.width > plat.x && player.x < plat.x + plat.width) {
            player.y = plat.y - player.height;
          }
        }
      }

      // Horizontal movement
      const accel = stats.speed * 0.18;
      if (keys.left) player.vx -= accel;
      if (keys.right) player.vx += accel;
      player.vx *= friction;

      // Vertical movement
      player.vy += gravity;

      // Jump logic (Double for Chiara, Triple for Brego)
      const maxJumps = character === 'Brego' ? 3 : 2;
      if (keys.upPressed) {
        if (player.grounded) {
          player.vy = stats.jumpForce;
          player.grounded = false;
          player.jumpCount = 1;
          playSound('jump');
        } else if (player.jumpCount < maxJumps) {
          player.vy = stats.jumpForce * 0.9;
          player.jumpCount++;
          playSound('jump');
        }
        keys.upPressed = false;
      }

      // Update position
      player.x += player.vx;
      player.y += player.vy;

      // Collision detection with platforms
      player.grounded = false;
      for (const plat of platforms) {
        if (
          player.x < plat.x + plat.width &&
          player.x + player.width > plat.x &&
          player.y < plat.y + plat.height &&
          player.y + player.height > plat.y
        ) {
          // Check if falling onto platform
          if (player.vy > 0 && player.y + player.height - player.vy <= plat.y + 10) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.grounded = true;
            player.jumpCount = 0;
          }
        }
      }

      // Collision detection with bones
      for (const bone of bones) {
        if (!bone.collected) {
          const dx = player.x + player.width / 2 - bone.x;
          const dy = player.y + player.height / 2 - bone.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 30) {
            bone.collected = true;
            gameState.current.score += 10;
            setScore(gameState.current.score);
            floatingTexts.push({ x: bone.x, y: bone.y, text: '+10', life: 1.0 });
            playSound('collect');
          }
        }
      }

      // Goal detection
      if (
        player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y
      ) {
        if (gameState.current.currentLevelIdx < LEVELS.length - 1) {
          setCurrentLevelIdx(prev => prev + 1);
          playSound('victory');
        } else {
          setGameOver(true);
          playSound('victory');
        }
      }

      // Boundaries
      if (player.x < 0) player.x = 0;
      if (player.y > canvas.height) {
        // Reset if fall off
        player.x = 50;
        player.y = 300;
        player.vx = 0;
        player.vy = 0;
      }

      // Camera follow
      gameState.current.cameraX = player.x - canvas.width / 3;
      if (gameState.current.cameraX < 0) gameState.current.cameraX = 0;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { player, platforms, bones, goal, floatingTexts, cameraX } = gameState.current;
      const stats = STATS[character];

      ctx.save();
      ctx.translate(-cameraX, 0);

      // Draw Background (Sky)
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(cameraX, 0, canvas.width, canvas.height);

      // Draw Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      const drawCloud = (x: number, y: number) => {
        ctx.fillRect(x, y, 60, 20);
        ctx.fillRect(x + 10, y - 10, 40, 10);
      };
      drawCloud(200, 100);
      drawCloud(600, 150);
      drawCloud(1000, 80);
      drawCloud(1400, 120);
      drawCloud(1800, 100);
      drawCloud(2200, 150);
      drawCloud(2600, 80);

      // Draw Goal (House/Finish)
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(goal.x - 10, goal.y);
      ctx.lineTo(goal.x + goal.width / 2, goal.y - 40);
      ctx.lineTo(goal.x + goal.width + 10, goal.y);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(goal.x + 15, goal.y + 40, 30, 60); // Door

      // Draw Platforms
      for (const plat of platforms) {
        ctx.fillStyle = plat.color;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#3e8e41';
        ctx.fillRect(plat.x, plat.y, plat.width, 5);
      }

      // Draw Bones
      for (const bone of bones) {
        if (!bone.collected) {
          ctx.fillStyle = 'white';
          ctx.fillRect(bone.x - 10, bone.y - 2, 20, 4);
          ctx.fillRect(bone.x - 12, bone.y - 5, 4, 4);
          ctx.fillRect(bone.x - 12, bone.y + 1, 4, 4);
          ctx.fillRect(bone.x + 8, bone.y - 5, 4, 4);
          ctx.fillRect(bone.x + 8, bone.y + 1, 4, 4);
        }
      }

      // Draw Floating Texts
      for (const ft of floatingTexts) {
        ctx.fillStyle = `rgba(251, 191, 36, ${ft.life})`;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      // Draw Player
      const dir = player.vx >= 0 ? 1 : -1;
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      if (dir === -1) ctx.scale(-1, 1);
      
      ctx.fillStyle = stats.color;
      ctx.fillRect(-player.width / 2, -player.height / 2 + 5, player.width, player.height - 10);
      
      ctx.fillStyle = stats.secondaryColor;
      ctx.fillRect(-player.width / 2 + 5, player.height / 2 - 10, player.width - 10, 5);
      ctx.fillRect(0, -player.height / 2 + 8, player.width / 2, player.height - 15);

      ctx.fillStyle = stats.color;
      const legW = 6;
      const legH = 8;
      ctx.fillRect(-player.width / 2 + 2, player.height / 2 - 5, legW, legH);
      ctx.fillRect(-player.width / 2 + 12, player.height / 2 - 5, legW, legH);
      ctx.fillRect(player.width / 2 - 18, player.height / 2 - 5, legW, legH);
      ctx.fillRect(player.width / 2 - 8, player.height / 2 - 5, legW, legH);

      ctx.fillStyle = stats.color;
      ctx.fillRect(player.width / 2 - 10, -player.height / 2 - 8, 20, 18);
      
      ctx.fillStyle = stats.color;
      ctx.fillRect(player.width / 2 + 5, -player.height / 2, 10, 8);
      ctx.fillStyle = 'black';
      ctx.fillRect(player.width / 2 + 13, -player.height / 2 + 1, 3, 3);

      ctx.fillStyle = 'white';
      ctx.fillRect(player.width / 2 + 2, -player.height / 2 - 4, 4, 4);
      ctx.fillStyle = 'black';
      ctx.fillRect(player.width / 2 + 4, -player.height / 2 - 3, 2, 2);

      // Ears
      ctx.fillStyle = stats.color;
      // Semi-erect/pointy ears for both
      ctx.fillRect(player.width / 2 - 6, -player.height / 2 - 14, 8, 10);
      ctx.fillRect(player.width / 2 + 4, -player.height / 2 - 14, 8, 10);
      // Tips (Darker)
      ctx.fillStyle = character === 'Chiara' ? '#000' : '#8b5a2b';
      ctx.fillRect(player.width / 2 - 4, -player.height / 2 - 16, 4, 4);
      ctx.fillRect(player.width / 2 + 6, -player.height / 2 - 16, 4, 4);

      ctx.fillStyle = stats.color;
      const tailAngle = Math.sin(Date.now() / 100) * 0.3;
      ctx.save();
      ctx.translate(-player.width / 2, 0);
      ctx.rotate(tailAngle);
      ctx.fillRect(-10, -2, 12, 4);
      // White tip for BOTH
      ctx.fillStyle = 'white';
      ctx.fillRect(-12, -2, 4, 4);
      ctx.restore();

      ctx.restore();

      // Snout details (on top of the head/body transform)
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      if (dir === -1) ctx.scale(-1, 1);
      
      // White pixels on snout/face (Three pixels now)
      ctx.fillStyle = 'white';
      ctx.fillRect(player.width / 2 + 6, -player.height / 2 + 2, 3, 3);
      ctx.fillRect(player.width / 2 + 9, -player.height / 2 + 4, 3, 3);
      ctx.fillRect(player.width / 2 + 7, -player.height / 2 + 6, 3, 3);
      
      ctx.restore();

      ctx.restore();

      // UI
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 300, 80);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 300, 80);
      
      ctx.fillStyle = 'white';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`PLAYER: ${character}`, 20, 40);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`BONES: ${gameState.current.score}`, 20, 70);
      
      ctx.fillStyle = 'white';
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText(`WORLD ${gameState.current.currentLevelIdx + 1}`, canvas.width / 2 - 60, 40);
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [character]);

  const toggleCharacter = () => {
    setCharacter(prev => (prev === 'Chiara' ? 'Brego' : 'Chiara'));
  };

  // Mobile controls handlers
  const setKey = (key: 'left' | 'right' | 'up', value: boolean) => {
    if (key === 'up' && value && !gameState.current.keys.up) {
      gameState.current.keys.upPressed = true;
    }
    gameState.current.keys[key] = value;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-sans overflow-hidden">
      <div className="relative w-full max-w-4xl aspect-video bg-black shadow-[0_0_50px_rgba(0,255,0,0.2)] overflow-hidden border-8 border-stone-800">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full block"
        />
        
        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 p-8 text-center border-[16px] border-double border-white m-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 tracking-widest uppercase">
              GAME OVER
            </h2>
            <p className="text-lg md:text-xl text-emerald-400 mb-6 uppercase">¡Feliz Cumple Chicho!</p>
            <p className="text-sm text-stone-400 mb-8 uppercase">16 de marzo 2026</p>
            
            <div className="border-4 border-white p-6 mb-8 bg-stone-900">
              <p className="text-white text-sm md:text-base uppercase">
                SCORE: <span className="text-amber-400">{score} BONES</span>
              </p>
            </div>

            <p className="text-white text-xs mb-10 animate-pulse uppercase">Te quiero mucho, Lilin.</p>

            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-white text-black hover:bg-emerald-400 font-bold text-sm transition-all active:scale-95 border-b-8 border-r-8 border-stone-500 hover:border-emerald-600"
            >
              RETRY
            </button>
          </div>
        )}
        
        {/* UI Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={toggleCharacter}
            className="px-4 py-2 bg-black border-4 border-white hover:bg-stone-800 transition-all text-[10px] font-bold uppercase"
          >
            SELECT: {character === 'Chiara' ? 'BREGO' : 'CHIARA'}
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none md:hidden">
          <div className="flex gap-4 pointer-events-auto">
            <button
              onTouchStart={() => setKey('left', true)}
              onTouchEnd={() => setKey('left', false)}
              onMouseDown={() => setKey('left', true)}
              onMouseUp={() => setKey('left', false)}
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center active:scale-90 transition-transform border border-white/30"
            >
              <span className="text-2xl">←</span>
            </button>
            <button
              onTouchStart={() => setKey('right', true)}
              onTouchEnd={() => setKey('right', false)}
              onMouseDown={() => setKey('right', true)}
              onMouseUp={() => setKey('right', false)}
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center active:scale-90 transition-transform border border-white/30"
            >
              <span className="text-2xl">→</span>
            </button>
          </div>
          <div className="pointer-events-auto">
            <button
              onTouchStart={() => setKey('up', true)}
              onTouchEnd={() => setKey('up', false)}
              onMouseDown={() => setKey('up', true)}
              onMouseUp={() => setKey('up', false)}
              className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center active:scale-90 transition-transform border border-white/40"
            >
              <span className="text-2xl font-bold">SALTAR</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center max-w-md px-4">
        <h1 className="text-xl font-bold mb-4 text-emerald-400 uppercase tracking-tighter">HAPPY BIRTHDAY!</h1>
        <p className="text-stone-500 text-[10px] leading-loose uppercase">
          CHIARA & BREGO ADVENTURE
        </p>
      </div>
    </div>
  );
}
