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

interface SpecialItem {
  x: number;
  y: number;
  type: 'steak' | 'coke' | 'iphone' | 'dollar';
  collected: boolean;
}

interface TennisBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bounces: number;
}

interface Level {
  platforms: Platform[];
  bones: Bone[];
  specialItems: SpecialItem[];
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
    specialItems: [
      { x: 1400, y: 500, type: 'steak', collected: false },
    ],
    goal: { x: 1800, y: 500, width: 120, height: 50 }
  },
  {
    platforms: [
      { x: 0, y: 550, width: 2500, height: 50, color: '#4d2d18', type: 'static' },
      { x: 100, y: 400, width: 120, height: 20, color: '#2d5a27', type: 'static' },
      { x: 300, y: 300, width: 120, height: 20, color: '#2d5a27', type: 'vertical', range: 200, speed: 2, initialX: 300, initialY: 300 },
      { x: 500, y: 450, width: 120, height: 20, color: '#2d5a27', type: 'static' },
      { x: 700, y: 350, width: 150, height: 20, color: '#2d5a27', type: 'horizontal', range: 300, speed: 3, initialX: 700, initialY: 350 },
      { x: 1100, y: 250, width: 120, height: 20, color: '#2d5a27', type: 'static' },
      { x: 1300, y: 400, width: 120, height: 20, color: '#2d5a27', type: 'vertical', range: 120, speed: 2, initialX: 1300, initialY: 400 },
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
    specialItems: [
      { x: 600, y: 200, type: 'coke', collected: false },
      { x: 1900, y: 200, type: 'iphone', collected: false },
    ],
    goal: { x: 2300, y: 500, width: 120, height: 50 }
  },
  {
    platforms: [
      { x: 0, y: 550, width: 4000, height: 50, color: '#4d2d18', type: 'static' },
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
    specialItems: [
      { x: 1400, y: 100, type: 'dollar', collected: false },
    ],
    goal: { x: 2800, y: 500, width: 120, height: 50 }
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

  const playSound = (type: 'jump' | 'collect' | 'victory' | 'bounce' | 'engine') => {
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
      const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; // C5, E5, G5, C6, G5, C6
      notes.forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
      });
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'bounce') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'engine') {
      // Subtle, smooth engine "Purr"
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      
      // Soft noise for texture
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(300, now);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.03, now + 0.1);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      // Use Triangle waves for a much smoother, less aggressive sound
      osc.type = 'triangle';
      osc2.type = 'triangle';
      
      // Mid-low frequencies that are pleasant
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.4);
      osc.frequency.linearRampToValueAtTime(100, now + 1.2);
      
      osc2.frequency.setValueAtTime(82, now); // Slight detune for warmth
      osc2.frequency.linearRampToValueAtTime(122, now + 0.4);
      osc2.frequency.linearRampToValueAtTime(102, now + 1.2);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.06, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.connect(gain);
      osc2.connect(gain2);
      
      osc.start(now);
      osc2.start(now);
      noise.start(now);
      
      osc.stop(now + 1.2);
      osc2.stop(now + 1.2);
      noise.stop(now + 1.2);
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
    jumpBuffer: 0,
    coyoteTime: 0,
    platforms: JSON.parse(JSON.stringify(LEVELS[0].platforms)) as Platform[],
    bones: JSON.parse(JSON.stringify(LEVELS[0].bones)) as Bone[],
    specialItems: JSON.parse(JSON.stringify(LEVELS[0].specialItems)) as SpecialItem[],
    goal: LEVELS[0].goal,
    tennisBalls: [] as TennisBall[],
    distraction: {
      active: false,
      timer: 0,
      direction: 0, // 1 for right, -1 for left
    },
    floatingTexts: [] as { x: number, y: number, text: string, life: number }[],
    cameraX: 0,
    gravity: 0.6,
    friction: 0.8,
    levelTimer: 0,
    score: 0,
    currentLevelIdx: 0,
    victoryAnimation: {
      active: false,
      timer: 0,
      otherDogX: 0,
      otherDogY: 0,
      otherDogVy: 0,
      soundCount: 0,
    },
    goalAnimation: {
      active: false,
      timer: 0,
      shake: 0,
      driveOff: 0,
      exhaust: [] as {x: number, y: number, size: number, life: number}[],
    }
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
    gameState.current.specialItems = JSON.parse(JSON.stringify(level.specialItems));
    gameState.current.goal = level.goal;
    gameState.current.tennisBalls = [];
    gameState.current.distraction = { active: false, timer: 0, direction: 0 };
    gameState.current.player.x = 50;
    gameState.current.player.y = 300;
    gameState.current.player.vx = 0;
    gameState.current.player.vy = 0;
    gameState.current.cameraX = 0;
    gameState.current.currentLevelIdx = currentLevelIdx;
    gameState.current.victoryAnimation = { active: false, timer: 0, otherDogX: 0, otherDogY: 0, otherDogVy: 0, soundCount: 0 };
    gameState.current.goalAnimation = { active: false, timer: 0, shake: 0, driveOff: 0, exhaust: [] };
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
      if (gameOver) return;
      const { player, keys, platforms, bones, goal, floatingTexts, gravity, friction, tennisBalls, distraction, victoryAnimation } = gameState.current;
      const stats = STATS[character];
      const levelIdx = gameState.current.currentLevelIdx;
      gameState.current.levelTimer += 0.02;

      // Victory Animation Logic
      if (victoryAnimation.active) {
        victoryAnimation.timer--;
        
        // Celebration: synchronized jumps
        if (gameState.current.levelTimer % 0.6 < 0.02) {
          player.vy = -10;
          victoryAnimation.otherDogVy = -10;
          if (victoryAnimation.soundCount < 3) {
            playSound('victory');
            victoryAnimation.soundCount++;
          }
        }
        
        // Gravity for other dog
        victoryAnimation.otherDogY += victoryAnimation.otherDogVy;
        victoryAnimation.otherDogVy += gravity;
        
        // Ground for other dog
        const otherType = character === 'Chiara' ? 'Brego' : 'Chiara';
        const groundY = goal.y + goal.height - STATS[otherType].height;
        if (victoryAnimation.otherDogY > groundY) {
          victoryAnimation.otherDogY = groundY;
          victoryAnimation.otherDogVy = 0;
        }

        // Gravity for player
        player.y += player.vy;
        player.vy += gravity;
        const playerGroundY = goal.y + goal.height - player.height;
        if (player.y > playerGroundY) {
            player.y = playerGroundY;
            player.vy = 0;
        }

        if (victoryAnimation.timer <= 0) {
          setGameOver(true);
        }
        return; // Skip normal update
      }

      // Spawn Tennis Balls (Starting from Level 2 / Index 1)
      if (levelIdx >= 1) {
        const spawnChance = levelIdx >= 2 ? 0.015 : 0.008; // Level 3+ is more frequent
        const maxBalls = levelIdx >= 2 ? 3 : 2;
        
        if (Math.random() < spawnChance && tennisBalls.length < maxBalls) {
          tennisBalls.push({
            x: player.x + (Math.random() * 800 - 400) + 400, // Spawn ahead or around player
            y: -50,
            vx: (Math.random() - 0.5) * 4,
            vy: 2,
            radius: 10,
            bounces: 0
          });
        }
      }

      // Update Tennis Balls
      for (let i = tennisBalls.length - 1; i >= 0; i--) {
        const ball = tennisBalls[i];
        ball.vy += gravity * 0.5;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce on platforms
        for (const plat of platforms) {
          if (
            ball.x + ball.radius > plat.x &&
            ball.x - ball.radius < plat.x + plat.width &&
            ball.y + ball.radius > plat.y &&
            ball.y - ball.radius < plat.y + plat.height
          ) {
            if (ball.vy > 0 && ball.y < plat.y) {
              ball.y = plat.y - ball.radius;
              ball.vy *= -0.7; // Bounce
              ball.bounces++;
            }
          }
        }

        // Collision with player
        const dx = player.x + player.width / 2 - ball.x;
        const dy = player.y + player.height / 2 - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ball.radius + 20) {
          // Distract dog!
          distraction.active = true;
          distraction.timer = 60; // ~1 second at 60fps
          
          // Determine direction: always try to flip current movement or go away from ball
          if (Math.abs(player.vx) > 0.2) {
            distraction.direction = -Math.sign(player.vx);
          } else {
            distraction.direction = ball.x < player.x + player.width / 2 ? 1 : -1;
          }
          
          // Immediate velocity kick to ensure direction change is felt
          player.vx = distraction.direction * stats.speed * 1.2;
          
          // Remove ball
          tennisBalls.splice(i, 1);
          floatingTexts.push({ x: player.x, y: player.y - 20, text: '¡PELOTA!', life: 2.0 });
          playSound('bounce');
          continue;
        }

        // Remove if off screen
        if (ball.y > 800 || ball.x < gameState.current.cameraX - 200 || ball.x > gameState.current.cameraX + 1200) {
          tennisBalls.splice(i, 1);
        }
      }

      // Update distraction
      if (distraction.active) {
        distraction.timer--;
        if (distraction.timer <= 0) {
          distraction.active = false;
        }
      }

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
      const isMobile = window.innerWidth < 768;
      const accel = stats.speed * (isMobile ? 0.22 : 0.18);
      
      if (distraction.active) {
        // Distraction pull is strong, but player can still influence it slightly
        // though the distraction force is higher than player acceleration
        player.vx += distraction.direction * accel * 2.0;
        
        // Allow player to fight it, but they won't fully overcome it easily
        if (keys.left) player.vx -= accel * 0.5;
        if (keys.right) player.vx += accel * 0.5;
      } else {
        if (keys.left) player.vx -= accel;
        if (keys.right) player.vx += accel;
      }
      
      player.vx *= friction;

      // Vertical movement
      player.vy += gravity;

      // Coyote time update
      if (player.grounded) {
        gameState.current.coyoteTime = 6; // 6 frames of grace
      } else {
        if (gameState.current.coyoteTime > 0) gameState.current.coyoteTime--;
      }

      // Jump buffer update
      if (gameState.current.jumpBuffer > 0) gameState.current.jumpBuffer--;

      // Jump logic (Double for Chiara, Triple for Brego)
      const maxJumps = character === 'Brego' ? 3 : 2;
      
      if (keys.upPressed || gameState.current.jumpBuffer > 0) {
        const canJump = player.grounded || gameState.current.coyoteTime > 0;
        
        if (canJump) {
          player.vy = stats.jumpForce;
          player.grounded = false;
          player.jumpCount = 1;
          gameState.current.coyoteTime = 0;
          gameState.current.jumpBuffer = 0;
          playSound('jump');
        } else if (keys.upPressed && player.jumpCount < maxJumps) {
          // Double/Triple jump doesn't use buffer, it must be an active press
          player.vy = stats.jumpForce * 0.9;
          player.jumpCount++;
          playSound('jump');
        } else if (keys.upPressed && !player.grounded) {
          // Buffer the jump if we pressed up but couldn't jump yet
          gameState.current.jumpBuffer = 8;
        }
        keys.upPressed = false;
      }

      // Update position
      player.x += player.vx;
      player.y += player.vy;

      // Collision detection with platforms
      player.grounded = false;
      const hitboxPadding = 4; // Forgiving hitbox
      for (const plat of platforms) {
        if (
          player.x + hitboxPadding < plat.x + plat.width &&
          player.x + player.width - hitboxPadding > plat.x &&
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
            floatingTexts.push({ x: bone.x, y: bone.y, text: '+10', life: 2.0 });
            playSound('collect');
          }
        }
      }

      // Collision detection with special items
      for (const item of gameState.current.specialItems) {
        if (!item.collected) {
          const dx = player.x + player.width / 2 - item.x;
          const dy = player.y + player.height / 2 - item.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 40) {
            item.collected = true;
            let points = 50;
            let text = '+50';
            if (item.type === 'steak') { points = 100; text = '¡BIFE! +100'; }
            if (item.type === 'coke') { points = 75; text = 'COCA! +75'; }
            if (item.type === 'iphone') { points = 150; text = 'iPHONE! +150'; }
            if (item.type === 'dollar') { points = 200; text = '$$$ +200'; }
            
            gameState.current.score += points;
            setScore(gameState.current.score);
            floatingTexts.push({ x: item.x, y: item.y, text, life: 2.5 });
            playSound('collect');
          }
        }
      }

      // Goal detection
      if (
        player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y &&
        !gameState.current.goalAnimation.active &&
        !gameState.current.victoryAnimation.active
      ) {
        gameState.current.goalAnimation.active = true;
        gameState.current.goalAnimation.timer = 120; // 2 seconds
        playSound('engine');
        playSound('victory');
      }

      // Update goal animation
      if (gameState.current.goalAnimation.active) {
        const ga = gameState.current.goalAnimation;
        ga.timer--;
        
        // Shake effect
        if (ga.timer > 60) {
          ga.shake = Math.sin(ga.timer * 0.5) * 3;
          // Exhaust particles
          if (ga.timer % 5 === 0) {
            ga.exhaust.push({
              x: goal.x - 10,
              y: goal.y + 30,
              size: 5 + Math.random() * 10,
              life: 1.0
            });
          }
        } else {
          ga.shake = 0;
          const isLastLevel = gameState.current.currentLevelIdx === LEVELS.length - 1;
          
          if (isLastLevel) {
            // Drive to the other dog
            const targetX = goal.x + 400;
            if (goal.x + ga.driveOff < targetX) {
              ga.driveOff += 8;
            }
          } else {
            ga.driveOff += 15; // Drive off screen
          }

          // Update player position to match car so camera follows
          player.x = goal.x + ga.driveOff + 60;
          player.y = goal.y;

          // More exhaust when driving off
          ga.exhaust.push({
            x: goal.x - 10 + ga.driveOff,
            y: goal.y + 30,
            size: 8 + Math.random() * 12,
            life: 1.0
          });
        }

        // Update exhaust particles
        ga.exhaust.forEach(p => {
          p.x -= 2;
          p.y -= 1;
          p.life -= 0.02;
        });
        ga.exhaust = ga.exhaust.filter(p => p.life > 0);

        if (ga.timer <= 0) {
          if (gameState.current.currentLevelIdx < LEVELS.length - 1) {
            setCurrentLevelIdx(prev => prev + 1);
          } else {
            // Trigger victory animation for Level 3
            gameState.current.victoryAnimation.active = true;
            gameState.current.victoryAnimation.timer = 300; // Longer celebration
            gameState.current.victoryAnimation.otherDogX = goal.x + 600;
            const otherType = character === 'Chiara' ? 'Brego' : 'Chiara';
            gameState.current.victoryAnimation.otherDogY = goal.y + goal.height - STATS[otherType].height;
            
            // Position player dog next to other dog for celebration
            player.x = gameState.current.victoryAnimation.otherDogX - 60;
            player.y = goal.y + goal.height - player.height;
          }
          ga.active = false;
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
      const { player, platforms, bones, goal, floatingTexts, cameraX, tennisBalls, victoryAnimation, goalAnimation } = gameState.current;
      const stats = STATS[character];

      const drawDog = (x: number, y: number, width: number, height: number, type: CharacterType, direction: number) => {
        const dogStats = STATS[type];
        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        if (direction === -1) ctx.scale(-1, 1);
        
        ctx.fillStyle = dogStats.color;
        ctx.fillRect(-width / 2, -height / 2 + 5, width, height - 10);
        
        ctx.fillStyle = dogStats.secondaryColor;
        ctx.fillRect(-width / 2 + 5, height / 2 - 10, width - 10, 5);
        ctx.fillRect(0, -height / 2 + 8, width / 2, height - 15);

        ctx.fillStyle = dogStats.color;
        const legW = 6;
        const legH = 8;
        ctx.fillRect(-width / 2 + 2, height / 2 - 5, legW, legH);
        ctx.fillRect(-width / 2 + 12, height / 2 - 5, legW, legH);
        ctx.fillRect(width / 2 - 18, height / 2 - 5, legW, legH);
        ctx.fillRect(width / 2 - 8, height / 2 - 5, legW, legH);

        ctx.fillRect(width / 2 - 10, -height / 2 - 8, 20, 18);
        ctx.fillRect(width / 2 + 5, -height / 2, 10, 8);
        ctx.fillStyle = 'black';
        ctx.fillRect(width / 2 + 13, -height / 2 + 1, 3, 3);

        ctx.fillStyle = 'white';
        ctx.fillRect(width / 2 + 2, -height / 2 - 4, 4, 4);
        ctx.fillStyle = 'black';
        ctx.fillRect(width / 2 + 4, -height / 2 - 3, 2, 2);

        ctx.fillStyle = dogStats.color;
        ctx.fillRect(width / 2 - 6, -height / 2 - 14, 8, 10);
        ctx.fillRect(width / 2 + 4, -height / 2 - 14, 8, 10);
        ctx.fillStyle = type === 'Chiara' ? '#000' : '#8b5a2b';
        ctx.fillRect(width / 2 - 4, -height / 2 - 16, 4, 4);
        ctx.fillRect(width / 2 + 6, -height / 2 - 16, 4, 4);

        ctx.fillStyle = dogStats.color;
        const tailAngle = Math.sin(Date.now() / 100) * 0.3;
        ctx.save();
        ctx.translate(-width / 2, 0);
        ctx.rotate(tailAngle);
        ctx.fillRect(-10, -2, 12, 4);
        ctx.fillStyle = 'white';
        ctx.fillRect(-12, -2, 4, 4);
        ctx.restore();

        ctx.fillStyle = 'white';
        ctx.fillRect(width / 2 + 6, -height / 2 + 2, 3, 3);
        ctx.fillRect(width / 2 + 9, -height / 2 + 4, 3, 3);
        ctx.fillRect(width / 2 + 7, -height / 2 + 6, 3, 3);

        ctx.restore();
      };

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

      // Exhaust particles (World Space)
      goalAnimation.exhaust.forEach(p => {
        ctx.fillStyle = `rgba(150, 150, 150, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Goal (Ferrari F1 Car - Facing Right)
      ctx.save();
      ctx.translate(goal.x + goalAnimation.driveOff, goal.y + goalAnimation.shake);

      // Draw Dog inside the car if animation is active
      if (goalAnimation.active) {
        ctx.save();
        // Position dog in the cockpit - slightly adjusted for better fit
        ctx.translate(60, 18);
        // Scale down the dog to fit in the car
        ctx.scale(0.5, 0.5);
        drawDog(-STATS[character].width / 2, -STATS[character].height / 2, STATS[character].width, STATS[character].height, character, 1);
        ctx.restore();
      }
      
      // Chassis (Darker Ferrari Red)
      ctx.fillStyle = '#991b1b'; // Darker Ferrari Red
      // Main body
      ctx.fillRect(10, 25, 100, 15);
      // Cockpit / Engine cover (Flipped)
      ctx.beginPath();
      ctx.moveTo(30, 25);
      ctx.lineTo(40, 10);
      ctx.lineTo(70, 10);
      ctx.lineTo(80, 25);
      ctx.fill();
      
      // Rear Wing (Now on the left)
      ctx.fillStyle = '#000000';
      ctx.fillRect(-5, 5, 25, 5); // Wing top
      ctx.fillRect(5, 5, 5, 30); // Wing support
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(-5, 2, 25, 3);
      
      // Front Wing (Now on the right)
      ctx.fillStyle = '#000000';
      ctx.fillRect(100, 35, 30, 6);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(100, 32, 30, 3);
      
      // Wheels (Flipped positions)
      const wheelVib = goalAnimation.active ? Math.sin(Date.now() / 20) * 1 : 0;
      const wheelRot = goalAnimation.active ? (Date.now() / 50) : 0;
      
      ctx.fillStyle = '#1a1a1a';
      // Rear wheel (Left)
      ctx.save();
      ctx.translate(25, 40 + wheelVib);
      ctx.rotate(wheelRot);
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      // Rim detail
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, 0); ctx.lineTo(14, 0);
      ctx.moveTo(0, -14); ctx.lineTo(0, 14);
      ctx.stroke();
      ctx.restore();

      // Front wheel (Right)
      ctx.save();
      ctx.translate(100, 40 + wheelVib);
      ctx.rotate(wheelRot);
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      // Rim detail
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, 0); ctx.lineTo(12, 0);
      ctx.moveTo(0, -12); ctx.lineTo(0, 12);
      ctx.stroke();
      ctx.restore();
      
      // Rims (Yellow)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(25, 40 + wheelVib, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(100, 40 + wheelVib, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Ferrari Logo (Yellow Shield - Flipped position slightly)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(52, 15);
      ctx.lineTo(60, 15);
      ctx.lineTo(56, 22);
      ctx.closePath();
      ctx.fill();
      
      // Driver Helmet (Facing Right) - Only if dog is not inside
      if (!goalAnimation.active) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(65, 12, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000'; // Visor
        ctx.fillRect(65, 10, 7, 3);
      }
      
      ctx.restore();

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
          ctx.save();
          const floatY = Math.sin(Date.now() / 200 + bone.x) * 5;
          ctx.translate(bone.x, bone.y + floatY);
          
          ctx.fillStyle = 'white';
          ctx.fillRect(-10, -2, 20, 4);
          ctx.fillRect(-12, -5, 4, 4);
          ctx.fillRect(-12, 1, 4, 4);
          ctx.fillRect(8, -5, 4, 4);
          ctx.fillRect(8, 1, 4, 4);
          ctx.restore();
        }
      }

      // Draw Special Items
      for (const item of gameState.current.specialItems) {
        if (!item.collected) {
          ctx.save();
          ctx.translate(item.x, item.y);
          
          // Add a subtle glow/float effect
          const floatY = Math.sin(Date.now() / 200) * 5;
          ctx.translate(0, floatY);

          if (item.type === 'steak') {
            // Steak - Clean meat with small bone on left
            ctx.fillStyle = '#2d1414'; // Outline
            ctx.fillRect(-18, -12, 36, 24);
            ctx.fillStyle = '#8b0000'; // Meat base
            ctx.fillRect(-16, -10, 32, 20);
            // Small oval bone on the left
            ctx.fillStyle = '#fdf5e6';
            ctx.beginPath();
            ctx.ellipse(-8, 0, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e5e5e5'; // Bone detail
            ctx.fillRect(-9, -2, 2, 4);
          } else if (item.type === 'coke') {
            // Retro Curvy Bottle - More pixels below label
            ctx.fillStyle = '#100'; // Outline
            // Neck
            ctx.fillRect(-4, -22, 8, 12);
            // Shoulder
            ctx.fillRect(-7, -12, 14, 8);
            // Label Area
            ctx.fillRect(-9, -4, 18, 12);
            // Lower Body (The "botellita" curve)
            ctx.fillRect(-7, 8, 14, 10);
            // Base
            ctx.fillRect(-9, 18, 18, 5);
            
            ctx.fillStyle = '#3e0000'; // Liquid
            ctx.fillRect(-2, -20, 4, 10);
            ctx.fillRect(-5, -10, 10, 6);
            ctx.fillRect(-7, -4, 14, 12);
            ctx.fillRect(-5, 8, 10, 10);
            ctx.fillRect(-7, 18, 14, 3);
            
            // Label
            ctx.fillStyle = '#e11';
            ctx.fillRect(-9, -2, 18, 8);
            ctx.fillStyle = '#fff';
            ctx.fillRect(-7, 1, 14, 2);
            
            // Cap
            ctx.fillStyle = '#aaa';
            ctx.fillRect(-5, -24, 10, 4);
          } else if (item.type === 'iphone') {
            // Modern Phone - Keep as is
            ctx.fillStyle = '#333'; // Frame
            ctx.fillRect(-12, -21, 24, 42);
            ctx.fillStyle = '#000'; // Screen
            ctx.fillRect(-10, -19, 20, 38);
            // Dynamic Island
            ctx.fillStyle = '#111';
            ctx.fillRect(-5, -17, 10, 4);
            // App Grid
            const iconColors = ['#ff3b30', '#4cd964', '#007aff', '#ffcc00', '#5856d6', '#ff9500', '#af52de', '#ff2d55'];
            for(let i=0; i<4; i++) {
              for(let j=0; j<2; j++) {
                ctx.fillStyle = iconColors[(i*2 + j) % iconColors.length];
                ctx.fillRect(-7 + j*9, -10 + i*7, 5, 5);
              }
            }
          } else if (item.type === 'dollar') {
            // Dollar Bill - Reverted to simpler version
            ctx.fillStyle = '#1b4332'; // Border
            ctx.fillRect(-18, -10, 36, 20);
            ctx.fillStyle = '#d8f3dc'; // Paper
            ctx.fillRect(-16, -8, 32, 16);
            // Center Portrait (Oval)
            ctx.fillStyle = '#74c69d';
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#40916c';
            ctx.fillRect(-3, -3, 6, 6);
            // Corner Numbers
            ctx.fillStyle = '#1b4332';
            ctx.fillRect(-14, -6, 2, 2);
            ctx.fillRect(12, -6, 2, 2);
            ctx.fillRect(-14, 4, 2, 2);
            ctx.fillRect(12, 4, 2, 2);
          }
          
          ctx.restore();
        }
      }

      // Draw Tennis Balls
      for (const ball of tennisBalls) {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.x / 20); // Rotation based on position
        
        // Ball body
        ctx.fillStyle = '#ccff00'; // Tennis yellow
        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Tennis lines
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ball.radius * 0.8, 0, ball.radius * 0.8, Math.PI * 0.7, Math.PI * 1.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-ball.radius * 0.8, 0, ball.radius * 0.8, Math.PI * 1.7, Math.PI * 0.3);
        ctx.stroke();
        
        ctx.restore();
      }

      // Draw Floating Texts
      for (const ft of floatingTexts) {
        ctx.font = '10px "Press Start 2P"';
        // Stroke for contrast
        ctx.strokeStyle = `rgba(0, 0, 0, ${ft.life})`;
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        // Fill (Vibrant Yellow/White)
        ctx.fillStyle = `rgba(255, 255, 255, ${ft.life})`;
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      // Draw Player
      if (!goalAnimation.active) {
        const dir = player.vx >= 0 ? 1 : -1;
        drawDog(player.x, player.y, player.width, player.height, character, dir);
      }

      // Draw Other Dog during Victory Animation or final goal animation
      if (victoryAnimation.active || (gameState.current.currentLevelIdx === LEVELS.length - 1 && goalAnimation.active)) {
        const otherType = character === 'Chiara' ? 'Brego' : 'Chiara';
        const otherStats = STATS[otherType];
        const otherX = victoryAnimation.active ? victoryAnimation.otherDogX : goal.x + 600;
        const otherY = victoryAnimation.active ? victoryAnimation.otherDogY : goal.y + goal.height - otherStats.height;
        drawDog(otherX, otherY, otherStats.width, otherStats.height, otherType, -1);
      }

      ctx.restore(); // Restore from camera transform

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
      ctx.fillText(`SCORE: ${gameState.current.score}`, 20, 70);
      
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

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        // Attempt to lock orientation if supported (usually requires fullscreen)
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape');
        }
      } catch (e) {
        // Silently fail as it's a best-effort optimization
      }
    };
    lockOrientation();
  }, []);

  const toggleCharacter = () => {
    setCharacter(prev => (prev === 'Chiara' ? 'Brego' : 'Chiara'));
  };

  // Mobile controls handlers
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const isRightSide = touchX > rect.width / 2;

    if (isRightSide) {
      // Right side is for jumping
      if (!gameState.current.keys.up) {
        gameState.current.keys.upPressed = true;
      }
      gameState.current.keys.up = true;
    } else {
      // Left side is for movement
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    
    // Sensitivity adjustment for mobile
    const threshold = 15; 
    if (dx > threshold) {
      gameState.current.keys.right = true;
      gameState.current.keys.left = false;
    } else if (dx < -threshold) {
      gameState.current.keys.left = true;
      gameState.current.keys.right = false;
    } else {
      gameState.current.keys.left = false;
      gameState.current.keys.right = false;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // If all touches are gone, reset everything
    if (e.touches.length === 0) {
      touchStartPos.current = null;
      gameState.current.keys.left = false;
      gameState.current.keys.right = false;
      gameState.current.keys.up = false;
      gameState.current.keys.upPressed = false;
    } else {
      // If some touches remain, check if the movement touch is still there
      // This is a bit complex with React events, so we'll just check if 
      // any touch is on the left side. If not, reset movement.
      let movementTouchExists = false;
      const rect = e.currentTarget.getBoundingClientRect();
      for (let i = 0; i < e.touches.length; i++) {
        const touchX = e.touches[i].clientX - rect.left;
        if (touchX <= rect.width / 2) {
          movementTouchExists = true;
          break;
        }
      }
      
      if (!movementTouchExists) {
        touchStartPos.current = null;
        gameState.current.keys.left = false;
        gameState.current.keys.right = false;
      }

      // Check for jump touch
      let jumpTouchExists = false;
      for (let i = 0; i < e.touches.length; i++) {
        const touchX = e.touches[i].clientX - rect.left;
        if (touchX > rect.width / 2) {
          jumpTouchExists = true;
          break;
        }
      }
      if (!jumpTouchExists) {
        gameState.current.keys.up = false;
        gameState.current.keys.upPressed = false;
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden touch-none flex items-center justify-center">
      {/* Landscape Warning Overlay */}
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center md:hidden portrait:flex landscape:hidden">
        <div className="w-16 h-16 border-4 border-white rounded-2xl mb-4 flex items-center justify-center animate-[spin_3s_linear_infinite]">
          <span className="text-3xl">📱</span>
        </div>
        <h2 className="text-base font-bold mb-1 uppercase tracking-widest">Gira tu pantalla</h2>
        <p className="text-[8px] text-stone-500 uppercase">Para jugar, usa el modo horizontal</p>
      </div>

      {/* Game Container: Always 4:3, fits within viewport */}
      <div 
        className="relative w-full h-full max-w-[133.33vh] max-h-[75vw] aspect-[4/3] bg-black shadow-[0_0_100px_rgba(0,255,0,0.1)] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full block touch-none"
        />
        
        {/* Mobile Controls Overlay (Visual Only) */}
        <div className="absolute inset-0 pointer-events-none flex md:hidden opacity-20">
          <div className="flex-1 border-r border-white/30 flex items-end justify-center pb-8">
            <span className="text-[4vw] uppercase font-bold tracking-tighter">Mover</span>
          </div>
          <div className="flex-1 flex items-end justify-center pb-8">
            <span className="text-[4vw] uppercase font-bold tracking-tighter">Saltar</span>
          </div>
        </div>
        
        {/* Game Over Screen - Scaled with container */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-[5%] text-center border-[4px] md:border-[8px] border-double border-white m-[2%]">
            <h2 className="text-[6vw] md:text-[4vw] font-bold text-white mb-[4%] tracking-widest uppercase">
              GAME OVER
            </h2>
            <p className="text-[4vw] md:text-[2.5vw] text-[#fbbf24] mb-[3%] uppercase animate-float-80s">¡Feliz Cumple Chicho!</p>
            <p className="text-[2.5vw] md:text-[1.5vw] text-stone-400 mb-[5%] uppercase">16 de marzo 2026</p>
            
            <div className="border-2 md:border-4 border-white p-[3%] mb-[5%] bg-stone-900/80">
              <p className="text-white text-[3vw] md:text-[2vw] uppercase">
                SCORE: <span className="text-[#fbbf24]">{score}</span>
              </p>
            </div>

            <p className="text-white text-[2vw] md:text-[1.2vw] mb-[6%] animate-pulse uppercase">Te quiero mucho, Lilin.</p>

            <button 
              onClick={() => window.location.reload()}
              className="px-[6%] py-[3%] bg-white text-black hover:bg-emerald-400 font-bold text-[3vw] md:text-[1.5vw] transition-all active:scale-95 border-b-[0.5vw] border-r-[0.5vw] border-stone-500 hover:border-emerald-600 uppercase"
            >
              RETRY
            </button>
          </div>
        )}
        
        {/* UI Overlay - Character Selection */}
        <div className="absolute top-[3%] right-[3%] z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              toggleCharacter();
            }}
            className="px-[1.5vw] py-[0.8vw] bg-black/50 border-[0.2vw] border-white/50 hover:bg-white hover:text-black transition-all text-[1.5vw] md:text-[1vw] font-bold uppercase backdrop-blur-sm"
          >
            SELECT: {character === 'Chiara' ? 'BREGO' : 'CHIARA'}
          </button>
        </div>

      </div>
    </div>
  );
}
