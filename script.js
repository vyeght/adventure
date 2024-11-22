const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Adjusted for a larger scrolling level
const LEVEL_WIDTH = 2000;
const LEVEL_HEIGHT = 2000;

let viewport = { x: 0, y: 0, width: canvas.width, height: canvas.height };

// Load assets
const playerImage = new Image();
playerImage.src = "./assets/player.png";
const enemyImage = new Image();
enemyImage.src = "./assets/enemy.png";
const treasureImage = new Image();
treasureImage.src = "./assets/treasure.png";
const bossImage = new Image();
bossImage.src = "./assets/boss.png";
const launcherImage = new Image();
launcherImage.src = "./assets/launcher.png";
const bulletImage = new Image();
bulletImage.src = "./assets/bullet.png";

const hitSound = new Audio("./assets/hit.wav");
const gameOverSound = new Audio("./assets/gameover.wav");
const treasureSound = new Audio("./assets/treasure.wav");
const attackSound = new Audio("./assets/attack.wav");
const shootSound = new Audio("./assets/shoot.wav");

let player = {
  x: 50,
  y: 50,
  size: 40,
  health: 100,
  speed: 5,
  score: 0,
  attackRange: 50,
  hasLauncher: false,
};
let enemies = [];
let treasures = [];
let walls = [];
let bullets = [];
let boss = { x: 700, y: 500, size: 60, health: 20, active: false };
let launcher = { x: 400, y: 300, size: 30, pickedUp: false, active: false };
let keys = {};
let level = 1;
let gameOver = false;
let bossDefeated = false;

let mouseX = 0;
let mouseY = 0;

// Track mouse movement for aiming bullets
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

// Generate maze-like walls
function generateMaze() {
  const maze = [];
  const roomCount = Math.random() * 10 + 10;

  for (let i = 0; i < roomCount; i++) {
    const width = Math.random() * 200 + 100;
    const height = Math.random() * 200 + 100;
    const x = Math.random() * (LEVEL_WIDTH - width);
    const y = Math.random() * (LEVEL_HEIGHT - height);

    maze.push({ x, y, width, height });
  }
  return maze;
}

// Initialize level elements
function initLevel() {
  enemies = [];
  treasures = [];
  bullets = [];
  launcher.active = false;
  launcher.pickedUp = false;
  boss.active = false;
  boss.health = 20;

  walls = generateMaze();

  // Create enemies
  for (let i = 0; i < level * 3; i++) {
    enemies.push({
      x: Math.random() * LEVEL_WIDTH,
      y: Math.random() * LEVEL_HEIGHT,
      size: 40,
      health: 3,
      speed: 1.5,
      direction: Math.random() * 2 * Math.PI,
    });
  }

  // Create treasures
  for (let i = 0; i < level; i++) {
    treasures.push({
      x: Math.random() * (LEVEL_WIDTH - 50) + 25,
      y: Math.random() * (LEVEL_HEIGHT - 50) + 25,
      size: 30,
    });
  }
}

// Key listeners
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    attack();
  }
  if (e.key === "f" && player.hasLauncher) {
    shootBullet();
  }
});
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

// Update viewport to scroll with the player
function updateViewport() {
  if (player.x - viewport.x < viewport.width * 0.3) {
    viewport.x = Math.max(0, player.x - viewport.width * 0.3);
  }
  if (player.x - viewport.x > viewport.width * 0.7) {
    viewport.x = Math.min(LEVEL_WIDTH - viewport.width, player.x - viewport.width * 0.7);
  }
  if (player.y - viewport.y < viewport.height * 0.3) {
    viewport.y = Math.max(0, player.y - viewport.height * 0.3);
  }
  if (player.y - viewport.y > viewport.height * 0.7) {
    viewport.y = Math.min(LEVEL_HEIGHT - viewport.height, player.y - viewport.height * 0.7);
  }
}

// Check wall collisions
function checkWallCollision(entity) {
  walls.forEach((wall) => {
    if (
      entity.x < wall.x + wall.width &&
      entity.x + entity.size > wall.x &&
      entity.y < wall.y + wall.height &&
      entity.y + entity.size > wall.y
    ) {
      if (entity === player) {
        if (keys["ArrowUp"]) player.y += player.speed;
        if (keys["ArrowDown"]) player.y -= player.speed;
        if (keys["ArrowLeft"]) player.x += player.speed;
        if (keys["ArrowRight"]) player.x -= player.speed;
      } else {
        entity.x -= Math.cos(entity.direction) * entity.speed;
        entity.y -= Math.sin(entity.direction) * entity.speed;
        entity.direction = (entity.direction + Math.PI) % (2 * Math.PI);
      }
    }
  });
}

// Player attack
function attack() {
  // Melee attack logic...
}

// Shoot a bullet
function shootBullet() {
  // Bullet shooting logic...
}

// Update logic
function update() {
  // Player movement
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  checkWallCollision(player);

  // Update viewport for scrolling
  updateViewport();

  if (boss.active) {
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.x += Math.cos(angle) * 2;
    boss.y += Math.sin(angle) * 2;
    checkWallCollision(boss);
  }

  // Update other game elements...
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-viewport.x, -viewport.y);

  ctx.fillStyle = "#3b2f2f";
  ctx.fillRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

  ctx.fillStyle = "brown";
  walls.forEach((wall) => ctx.fillRect(wall.x, wall.y, wall.width, wall.height));

  // Draw player, enemies, bullets, treasures, and boss...

  ctx.restore();

  document.getElementById("player-health").innerText = player.health;
  document.getElementById("score").innerText = player.score;
}

// Start the game
document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  initLevel();
  gameLoop();
});

// Game loop
function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over! Refresh to Restart", 150, 300);
    return;
  }

  if (bossDefeated) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Congratulations! You defeated the boss!", 150, 300);
    return;
  }

  update();
  draw();
  requestAnimationFrame(gameLoop);
}
