const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restart');

const floorY = canvas.height - 54;
const gravity = 0.9;
const jumpForce = -14.5;
let speed = 6;
let gameOver = false;
let score = 0;
let best = Number(localStorage.getItem('mini-geometry-best') || 0);
bestEl.textContent = String(best);

const player = {
  x: 120,
  y: floorY - 32,
  w: 32,
  h: 32,
  vy: 0,
  rot: 0,
  grounded: true,
};

const obstacles = [];
let spawnTimer = 0;

function resetGame() {
  gameOver = false;
  score = 0;
  speed = 6;
  player.y = floorY - player.h;
  player.vy = 0;
  player.rot = 0;
  player.grounded = true;
  obstacles.length = 0;
  spawnTimer = 0;
  scoreEl.textContent = '0';
  restartBtn.hidden = true;
}

function jump() {
  if (gameOver) return;
  if (player.grounded) {
    player.vy = jumpForce;
    player.grounded = false;
  }
}

function spawnObstacle() {
  const h = 26 + Math.random() * 36;
  const w = 22 + Math.random() * 18;
  obstacles.push({
    x: canvas.width + 20,
    y: floorY - h,
    w,
    h,
  });
}

function update() {
  if (gameOver) return;

  player.vy += gravity;
  player.y += player.vy;

  if (player.y + player.h >= floorY) {
    player.y = floorY - player.h;
    player.vy = 0;
    player.rot = 0;
    player.grounded = true;
  } else {
    player.rot += 0.12;
  }

  spawnTimer -= 1;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = 50 + Math.random() * 65;
  }

  for (const obstacle of obstacles) {
    obstacle.x -= speed;
  }

  while (obstacles.length && obstacles[0].x + obstacles[0].w < -10) {
    obstacles.shift();
    score += 1;
    scoreEl.textContent = String(score);
    speed = Math.min(12, speed + 0.03);
  }

  for (const obstacle of obstacles) {
    if (
      player.x < obstacle.x + obstacle.w &&
      player.x + player.w > obstacle.x &&
      player.y < obstacle.y + obstacle.h &&
      player.y + player.h > obstacle.y
    ) {
      gameOver = true;
      restartBtn.hidden = false;
      if (score > best) {
        best = score;
        localStorage.setItem('mini-geometry-best', String(best));
        bestEl.textContent = String(best);
      }
      break;
    }
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4ee6ff22';
  for (let i = 0; i < 18; i += 1) {
    ctx.fillRect((i * 120 - (performance.now() * 0.08) % 120), 46 + (i % 4) * 28, 24, 8);
  }

  ctx.fillStyle = '#223f82';
  ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);

  ctx.strokeStyle = '#8bf4ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, floorY + 0.5);
  ctx.lineTo(canvas.width, floorY + 0.5);
  ctx.stroke();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
  ctx.rotate(player.rot);

  const gradient = ctx.createLinearGradient(-16, -16, 16, 16);
  gradient.addColorStop(0, '#9af9ff');
  gradient.addColorStop(1, '#00b8db');
  ctx.fillStyle = gradient;
  ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);

  ctx.fillStyle = '#02253f';
  ctx.fillRect(4, -8, 7, 7);
  ctx.restore();
}

function drawObstacles() {
  ctx.fillStyle = '#ff4f7a';
  for (const o of obstacles) {
    ctx.beginPath();
    ctx.moveTo(o.x, o.y + o.h);
    ctx.lineTo(o.x + o.w / 2, o.y);
    ctx.lineTo(o.x + o.w, o.y + o.h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGameOver() {
  if (!gameOver) return;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 46px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '22px Inter, sans-serif';
  ctx.fillText('Нажми кнопку ниже, чтобы начать заново', canvas.width / 2, canvas.height / 2 + 30);
}

function loop() {
  update();
  drawBackground();
  drawObstacles();
  drawPlayer();
  drawGameOver();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    jump();
  }
});
canvas.addEventListener('mousedown', jump);
canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  jump();
}, { passive: false });
restartBtn.addEventListener('click', resetGame);

resetGame();
loop();
