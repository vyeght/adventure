const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const playerImage = new Image();
playerImage.src = "./assets/player.png";
const enemyImage = new Image();
enemyImage.src = "./assets/enemy.png";
const treasureImage = new Image();
treasureImage.src = "./assets/treasure.png";
const bossImage = new Image();
bossImage.src = "./assets/boss.png";
const hitSound = new Audio("./assets/hit.wav");
const gameOverSound = new Audio("./assets/gameover.wav");
const treasureSound = new Audio("./assets/treasure.wav");

// Game variables
let player = { x: 50, y: 50, size: 40, health: 100, speed: 5, score: 0 };
let enemies = [];
let treasures = [];
let boss = { x: 700, y: 500, size: 60, health: 20, active: false };
let keys = {};
let level = 1;
let gameOver = false;

// Initialize enemies and treasures
function initLevel() {
  enemies = [];
  treasures = [];
  for (let i = 0; i < level * 3; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 40,
      health: 3,
      speed: 2 + level,
    });
    treasures.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 30,
    });
  }
}

// Key listeners
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// Collision detection
function collision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.size &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + obj2.size &&
    obj1.y + obj1.size > obj2.y
  );
}

// Game loop
function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over! Refresh to Restart", 150, 300);
    return;
  }

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Update logic
function update() {
  // Move player
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y < canvas.height - player.size) player.y += player.speed;
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.size) player.x += player.speed;

  // Enemy logic
  enemies.forEach((enemy) => {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;

    if (collision(player, enemy)) {
      player.health -= 1;
      hitSound.play();
      if (player.health <= 0) {
        gameOver = true;
        gameOverSound.play();
      }
    }
  });

  // Treasure logic
  treasures.forEach((treasure, index) => {
    if (collision(player, treasure)) {
      treasures.splice(index, 1);
      player.score += 10;
      treasureSound.play();
    }
  });

  // Boss logic
  if (treasures.length === 0 && !boss.active) {
    boss.active = true;
  }

  if (boss.active) {
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.x += Math.cos(angle) * 2;
    boss.y += Math.sin(angle) * 2;

    if (collision(player, boss)) {
      player.health -= 2;
      hitSound.play();
      if (player.health <= 0) {
        gameOver = true;
        gameOverSound.play();
      }
    }
  }

  // Level progression
  if (boss.active && boss.health <= 0) {
    level++;
    player.health = 100;
    initLevel();
  }
}

// Draw game objects
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.size, enemy.size);
  });

  // Draw treasures
  treasures.forEach((treasure) => {
    ctx.drawImage(treasureImage, treasure.x, treasure.y, treasure.size, treasure.size);
  });

  // Draw boss
  if (boss.active) {
    ctx.drawImage(bossImage, boss.x, boss.y, boss.size, boss.size);
    ctx.fillStyle = "red";
    ctx.fillText(`Boss Health: ${boss.health}`, boss.x, boss.y - 10);
  }

  // UI
  document.getElementById("player-health").innerText = player.health;
  document.getElementById("score").innerText = player.score;
}

// Start game
initLevel();
gameLoop();


h1 {
  font-size: 24px;
  margin: 0 0 10px 0;
}
