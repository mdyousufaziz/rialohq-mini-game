/* RialoHQ Mini Game - Runner/Dodge */
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const scoreEl = document.getElementById('score');

  const W = canvas.width;  // 720
  const H = canvas.height; // 420
  const GROUND_H = 60;
  const GRAVITY = 1800; // px/s^2
  const JUMP_V = 820;   // px/s
  const OB_MIN_GAP = 480;
  const OB_MAX_GAP = 860;
  const OB_MIN_H = 30;
  const OB_MAX_H = 80;

  // Random integer in [min, max]
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let lastTime = 0;
  let running = false;
  let gameOver = false;
  let score = 0;
  let highScore = 0;

  const characterImg = new Image();
  let charReady = false;
  characterImg.onload = () => { charReady = true; };
  characterImg.onerror = () => { charReady = false; };
  characterImg.src = 'assets/character.png';

  const player = {
    x: 80,
    y: H - GROUND_H - 64,
    w: 56,
    h: 64,
    vy: 0,
    onGround: true,
    jump() {
      if (this.onGround) {
        this.vy = -JUMP_V;
        this.onGround = false;
      }
    },
    update(dt) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      const floorY = H - GROUND_H - this.h;
      if (this.y >= floorY) {
        this.y = floorY;
        this.vy = 0;
        this.onGround = true;
      }
    },
    draw() {
      const px = Math.round(this.x);
      const py = Math.round(this.y);
      if (charReady) {
        // Draw image centered on player rect width/height
        ctx.drawImage(characterImg, px - 4, py - 8, this.w + 8, this.h + 12);
      } else {
        // Fallback: cute capsule character
        const r = 14;
        ctx.fillStyle = '#6ee7ff';
        roundRect(ctx, px, py, this.w, this.h, r, true, false);
        // eyes
        ctx.fillStyle = '#0b1020';
        ctx.beginPath(); ctx.arc(px + this.w*0.35, py + this.h*0.38, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + this.w*0.65, py + this.h*0.38, 4, 0, Math.PI*2); ctx.fill();
        // smile
        ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(px + this.w*0.5, py + this.h*0.58, 10, 0.1*Math.PI, 0.9*Math.PI);
        ctx.stroke();
      }
    }
  };

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (r > w/2) r = w/2; if (r > h/2) r = h/2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  const obstacles = [];
  let obTimer = 0;
  let speed = 280; // px/s

  function spawnObstacle() {
    const h = rand(OB_MIN_H, OB_MAX_H);
    const w = rand(28, 40);
    obstacles.push({ x: W + 20, y: H - GROUND_H - h, w, h });
  }

  function updateObstacles(dt) {
    obTimer -= dt * 1000; // timer in ms for variability with min/max gap
    if (obstacles.length === 0 || obTimer <= 0) {
      spawnObstacle();
      obTimer = rand(OB_MIN_GAP, OB_MAX_GAP) / (speed / 280); // dynamic based on speed
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.x -= speed * dt;
      if (ob.x + ob.w < -40) obstacles.splice(i, 1);
      if (aabb(player, ob)) {
        endGame();
        break;
      }
    }
    // Gradually ramp difficulty
    speed += 6 * dt;
  }

  function drawObstacles() {
    ctx.fillStyle = '#ff5d73';
    obstacles.forEach(ob => {
      const r = 8;
      roundRect(ctx, Math.round(ob.x), Math.round(ob.y), ob.w, ob.h, r, true, false);
      // top shine
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      roundRect(ctx, Math.round(ob.x)+3, Math.round(ob.y)+3, ob.w-6, Math.max(6, ob.h*0.18), 6, true, false);
      ctx.fillStyle = '#ff5d73';
    });
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Background layers
  const stars = new Array(80).fill(0).map(() => ({
    x: Math.random() * W,
    y: Math.random() * (H - 120),
    s: Math.random() * 1.2 + 0.3,
    sp: Math.random() * 20 + 10,
  }));
  const hills = new Array(5).fill(0).map((_, i) => ({
    x: i * 220,
    y: H - GROUND_H - 40,
    w: 240,
    h: 80,
  }));

  function drawBackground(dt) {
    // sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0c1224');
    g.addColorStop(1, '#0a0f1c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // brand halo
    const halo = ctx.createRadialGradient(120, 90, 10, 120, 90, 180);
    halo.addColorStop(0, 'rgba(110,231,255,0.25)');
    halo.addColorStop(1, 'rgba(110,231,255,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(120, 90, 180, 0, Math.PI*2);
    ctx.fill();

    // stars parallax
    stars.forEach(st => {
      st.x -= st.sp * dt * 0.25;
      if (st.x < -2) st.x = W + Math.random() * 40;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(Math.round(st.x), Math.round(st.y), st.s, st.s);
    });

    // hills
    ctx.fillStyle = '#122036';
    hills.forEach(h => {
      h.x -= speed * dt * 0.25;
      if (h.x + h.w < 0) h.x += 220 * hills.length;
      ctx.beginPath();
      ctx.moveTo(h.x, h.y + h.h);
      ctx.quadraticCurveTo(h.x + h.w/2, h.y - 20, h.x + h.w, h.y + h.h);
      ctx.lineTo(h.x + h.w, H - GROUND_H);
      ctx.lineTo(h.x, H - GROUND_H);
      ctx.closePath();
      ctx.fill();
    });

    // ground
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
    // ground stripes
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    for (let x = (performance.now()/8)%40; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, H - GROUND_H + 8);
      ctx.lineTo(x + 20, H - 10);
      ctx.stroke();
    }
  }

  function startGame() {
    running = true;
    gameOver = false;
    obstacles.length = 0;
    obTimer = 0;
    speed = 280;
    score = 0;
    player.x = 80;
    player.y = H - GROUND_H - player.h;
    player.vy = 0;
    player.onGround = true;
    overlay.style.display = 'none';
    restartBtn.hidden = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    gameOver = true;
    highScore = Math.max(highScore, Math.floor(score));
    restartBtn.hidden = false;
    // Show overlay text for game over
    overlay.innerHTML = `
      <h2 class="title">Game Over</h2>
      <p class="subtitle">Score: ${Math.floor(score)} · Best: ${highScore}</p>
      <button id="restartInline" class="primary">Restart</button>
    `;
    overlay.style.display = 'grid';
    const btn = document.getElementById('restartInline');
    btn?.addEventListener('click', startGame, { once: true });
  }

  function loop(now) {
    const dt = Math.min(0.032, (now - lastTime) / 1000);
    lastTime = now;

    // update
    drawBackground(dt);
    if (running) {
      player.update(dt);
      updateObstacles(dt);
      score += dt * (20 + speed/10);
      scoreEl.textContent = String(Math.floor(score));
    }

    // draw
    drawObstacles();
    player.draw();

    if (running) requestAnimationFrame(loop);
  }

  // Input
  function onJump() {
    if (!running) return;
    player.jump();
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      onJump();
    }
    if (gameOver && (e.code === 'Space' || e.code === 'Enter')) {
      startGame();
    }
  });
  canvas.addEventListener('pointerdown', onJump);

  startBtn?.addEventListener('click', startGame);
  restartBtn?.addEventListener('click', startGame);

  // Initial render
  drawBackground(0);
  player.draw();
})();
