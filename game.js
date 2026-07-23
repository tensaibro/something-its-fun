const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

let player = {
  x: 400,
  y: 250,
  r: 12,
  speed: 3,
  aimX: 0,
  aimY: -1, // default aim up
  hp: 100
};

let bullets = [];
let enemies = [];
let score = 0;
let wave = 1;
let gameOver = false;

function spawnWave() {
  const count = 4 + wave * 2;
  for (let i = 0; i < count; i++) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = 0; y = Math.random() * canvas.height; }
    else if (side === 1) { x = canvas.width; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = 0; }
    else { x = Math.random() * canvas.width; y = canvas.height; }

    enemies.push({
      x,
      y,
      r: 10,
      speed: 1.2 + wave * 0.2,
      hp: 20 + wave * 5
    });
  }
}

function shoot() {
  bullets.push({
    x: player.x,
    y: player.y,
    r: 4,
    vx: player.aimX * 7,
    vy: player.aimY * 7
  });
}

let shootCooldown = 0;

function update() {
  if (gameOver) return;

  // Movement (arrow keys)
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // Aim (IJKL)
  if (keys["i"]) { player.aimX = 0; player.aimY = -1; }
  if (keys["k"]) { player.aimX = 0; player.aimY = 1; }
  if (keys["j"]) { player.aimX = -1; player.aimY = 0; }
  if (keys["l"]) { player.aimX = 1; player.aimY = 0; }

  // Shoot (Space)
  if (keys[" "] && shootCooldown <= 0) {
    shoot();
    shootCooldown = 10;
  }
  shootCooldown--;

  // Bullets
  bullets.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
  });
  bullets = bullets.filter(b =>
    b.x > -20 && b.x < canvas.width + 20 &&
    b.y > -20 && b.y < canvas.height + 20
  );

  // Enemies
  enemies.forEach(e => {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;

    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < e.r + player.r) {
      player.hp -= 0.4;
    }
  });

  // Bullet hits enemy
  bullets.forEach(b => {
    enemies.forEach((e, i) => {
      const dx = e.x - b.x;
      const dy = e.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < e.r + b.r) {
        e.hp -= 15;
        b.x = -9999;
        if (e.hp <= 0) {
          enemies.splice(i, 1);
          score += 10;
        }
      }
    });
  });

  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  if (player.hp <= 0) {
    gameOver = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.fillStyle = "#4af";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // Aim indicator
  ctx.strokeStyle = "#4af";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + player.aimX * 25, player.y + player.aimY * 25);
  ctx.stroke();

  // Bullets
  ctx.fillStyle = "#ff0";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = "#f44";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // UI
  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`HP: ${Math.max(0, player.hp.toFixed(0))}`, 10, 20);
  ctx.fillText(`Score: ${score}`, 10, 40);
  ctx.fillText(`Wave: ${wave}`, 10, 60);

  if (gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = "40px monospace";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

spawnWave();
loop();

