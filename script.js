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
const launcherImage = new Image();
launcherImage.src = "./assets/launcher.png";
const bulletImage = new Image();
bulletImage.src = "./assets/bullet.png";

const hitSound = new Audio("./assets/hit.wav");
const gameOverSound = new Audio("./assets/gameover.wav");
const treasureSound = new Audio("./assets/treasure.wav");
const attackSound = new Audio("./assets/attack.wav");
const shootSound = new Audio("./assets/shoot.wav");

// Game settings
const LEVEL_WIDTH = 3000; // Larger scrolling level
const LEVEL_HEIGHT = 3000;
const TILE_SIZE = 100; // For maze generation
const BULLET_SPEED = 8;
const ENEMY_FOLLOW_RANGE = 300;

// Game objects
let player = createPlayer();
let camera = { x: 0, y: 0 }; // Camera offset
let enemies = [];
let treasures = [];
let walls = [];
let bullets = [];
let boss = createBoss();
let launcher = createLauncher();

let keys = {};
let gameOver = false;
let bossDefeated = false;

let mouseX = 0;
let mouseY = 0;

// Event listeners
canvas.addEventListener("mousemove", updateMousePosition);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// Helper functions to create game objects
function createPlayer() {
  return {
    x: 150,
    y: 150,
    size: 40,
    health: 100,
    speed: 5,
    score: 0,
    attackRange: 50,
    hasLauncher: false,
  };
}

function createBoss() {
  return {
    x: 2800,
    y: 2800,
    size: 80,
    health: 50,
    active: false,
    speed: 2,
  };
}

function createLauncher() {
  return {
    x: 0,
    y: 0,
    size: 30,
    pickedUp: false,
    active: false,
  };
}

// Update mouse position for aiming
function updateMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left + camera.x;
  mouseY = e.clientY - rect.top + camera.y;
}

// Handle keyboard input
function handleKeyDown(e) {
  keys[e.key] = true;
  if (e.key === " ") attack(); // Melee attack
  if (e.key === "f" && player.hasLauncher) shootBullet(); // Fire projectile
}

function handleKeyUp(e) {
  keys[e.key] = false;
}

// Generate maze-like walls
function generateMaze() {
  walls = [];
  for (let x = 0; x < LEVEL_WIDTH; x += TILE_SIZE) {
    for (let y = 0; y < LEVEL_HEIGHT; y += TILE_SIZE) {
      if (Math.random() < 0.3) {
        walls.push({ x, y, width: TILE_SIZE, height: TILE_SIZE });
      }
    }
  }
  // Clear starting area for player
  walls = walls.filter(
    (wall) =>
      !(
        wall.x < player.x + 100 &&
        wall.x + wall.width > player.x - 100 &&
        wall.y < player.y + 100 &&
        wall.y + wall.height > player.y - 100
      )
  );
}

// Initialize level
function initLevel() {
  enemies = [];
  treasures = [];
  bullets = [];
  launcher = createLauncher();
  boss = createBoss();

  generateMaze();

  // Create enemies
  for (let i = 0; i < 30; i++) {
    enemies.push({
      x: Math.random() * LEVEL_WIDTH,
      y: Math.random() * LEVEL_HEIGHT,
      size: 40,
      health: 3,
      speed: 2,
      direction: Math.random() * 2 * Math.PI,
    });
  }

  // Create treasures
  for (let i = 0; i < 20; i++) {
    treasures.push({
      x: Math.random() * LEVEL_WIDTH,
      y: Math.random() * LEVEL_HEIGHT,
      size: 30,
    });
  }
}

// Detect collision
function collision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.size &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + obj2.size &&
    obj1.y + obj1.size > obj2.y
  );
}

// Calculate distance
function distance(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Player attack
function attack() {
  enemies.forEach((enemy, index) => {
    if (distance(player, enemy) < player.attackRange) {
      enemy.health -= 1;
      if (enemy.health <= 0) {
        enemies.splice(index, 1);
        player.score += 10;
      }
    }
  });

  if (boss.active && distance(player, boss) < player.attackRange) {
    boss.health -= 1;
    if (boss.health <= 0) bossDefeated = true;
  }
}

// Shoot bullet
function shootBullet() {
  const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
  bullets.push({
    x: player.x + player.size / 2,
    y: player.y + player.size / 2,
    size: 10,
    directionX: Math.cos(angle),
    directionY: Math.sin(angle),
    speed: BULLET_SPEED,
  });
}

// Update camera
function updateCamera() {
  camera.x = Math.max(0, Math.min(player.x - canvas.width / 2, LEVEL_WIDTH - canvas.width));
  camera.y = Math.max(0, Math.min(player.y - canvas.height / 2, LEVEL_HEIGHT - canvas.height));
}

// Update game logic
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  updateCamera();

  // Enemies follow player
  enemies.forEach((enemy) => {
    if (distance(player, enemy) < ENEMY_FOLLOW_RANGE) {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemy.x += Math.cos(angle) * enemy.speed;
      enemy.y += Math.sin(angle) * enemy.speed;
    }
  });

  // Boss follows player and respects walls
  if (boss.active) {
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.x += Math.cos(angle) * boss.speed;
    boss.y += Math.sin(angle) * boss.speed;

    walls.forEach((wall) => {
      if (
        boss.x < wall.x + wall.width &&
        boss.x + boss.size > wall.x &&
        boss.y < wall.y + wall.height &&
        boss.y + boss.size > wall.y
      ) {
        boss.x -= Math.cos(angle) * boss.speed;
        boss.y -= Math.sin(angle) * boss.speed;
      }
    });
  }

  // Bullets movement and collisions
  bullets.forEach((bullet, index) => {
    bullet.x += bullet.directionX * bullet.speed;
    bullet.y += bullet.directionY * bullet.speed;

    if (
      bullet.x < 0 ||
      bullet.x > LEVEL_WIDTH ||
      bullet.y < 0 ||
      bullet.y > LEVEL_HEIGHT
    ) {
      bullets.splice(index, 1);
    }

    enemies.forEach((enemy, enemyIndex) => {
      if (collision(bullet, enemy)) {
        enemy.health -= 5;
        bullets.splice(index, 1);
        if (enemy.health <= 0) {
          enemies.splice(enemyIndex, 1);
          player.score += 10;
        }
      }
    });

    if (boss.active && collision(bullet, boss)) {
      boss.health -= 5;
      bullets.splice(index, 1);
      if (boss.health <= 0) bossDefeated = true;
    }
  });

  // Check if launcher should appear
  if (enemies.length === 0 && !launcher.active) {
    launcher.active = true;
    launcher.x = Math.random() * LEVEL_WIDTH;
    launcher.y = Math.random() * LEVEL_HEIGHT;
  }

  // Check for launcher pickup
  if (launcher.active && collision(player, launcher)) {
    launcher.pickedUp = true;
    player.hasLauncher = true;
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  // Draw walls
  walls.forEach((wall) => {
    ctx.fillStyle = "brown";
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  });

  // Draw player
  ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.size, enemy.size);
  });

  // Draw boss
  if (boss.active) ctx.drawImage(bossImage, boss.x, boss.y, boss.size, boss.size);

  // Draw treasures
  treasures.forEach((treasure) => {
    ctx.drawImage(treasureImage, treasure.x, treasure.y, treasure.size, treasure.size);
  });

  // Draw launcher
  if (launcher.active && !launcher.pickedUp) {
    ctx.drawImage(launcherImage, launcher.x, launcher.y, launcher.size, launcher.size);
  }

  ctx.restore();
}

// Main game loop
function gameLoop() {
  if (gameOver || bossDefeated) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
initLevel();
gameLoop();
