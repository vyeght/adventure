const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ensure canvas dimensions are set
canvas.width = 800; // Default game viewport width
canvas.height = 600; // Default game viewport height

// Game dimensions
const LEVEL_WIDTH = 2000;
const LEVEL_HEIGHT = 2000;

// Viewport for scrolling
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

// Game objects
let player = {
  x: 100,
  y: 100,
  size: 40,
  health: 100,
  speed: 5,
  score: 0,
  hasLauncher: false,
};

let enemies = [];
let treasures = [];
let walls = [];
let boss = { x: 1800, y: 1800, size: 80, health: 20, active: false };
let launcher = { x: 0, y: 0, size: 30, pickedUp: false };

let bullets = [];
let keys = {};
let gameOver = false;
let bossDefeated = false;

// Mouse position for aiming
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left + viewport.x;
  mouseY = e.clientY - rect.top + viewport.y;
});

// Initialize the level
function initLevel() {
  enemies = [];
  treasures = [];
  bullets = [];
  walls = generateMaze();
  boss.active = false;

  // Add enemies
  for (let i = 0; i < 10; i++) {
    enemies.push({
      x: Math.random() * LEVEL_WIDTH,
      y: Math.random() * LEVEL_HEIGHT,
      size: 40,
      speed: 2,
    });
  }

  // Add treasures
  for (let i = 0; i < 5; i++) {
    treasures.push({
      x: Math.random() * LEVEL_WIDTH,
      y: Math.random() * LEVEL_HEIGHT,
      size: 30,
    });
  }
}

// Generate maze-like walls
function generateMaze() {
  let maze = [];
  for (let i = 0; i < 15; i++) {
    maze.push({
      x: Math.random() * LEVEL_WIDTH,
      y: Math.random() * LEVEL_HEIGHT,
      width: 100,
      height: 100,
    });
  }
  return maze;
}

// Handle keyboard input
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Check collision
function collision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.size &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + obj2.size &&
    obj1.y + obj1.size > obj2.y
  );
}

// Update the viewport to follow the player
function updateViewport() {
  viewport.x = Math.min(
    Math.max(0, player.x - viewport.width / 2),
    LEVEL_WIDTH - viewport.width
  );
  viewport.y = Math.min(
    Math.max(0, player.y - viewport.height / 2),
    LEVEL_HEIGHT - viewport.height
  );
}

// Update the game state
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  updateViewport();

  // Check for collisions with walls
  walls.forEach((wall) => {
    if (collision(player, wall)) {
      if (keys["ArrowUp"]) player.y += player.speed;
      if (keys["ArrowDown"]) player.y -= player.speed;
      if (keys["ArrowLeft"]) player.x += player.speed;
      if (keys["ArrowRight"]) player.x -= player.speed;
    }
  });

  // Check collisions with treasures
  treasures = treasures.filter((treasure) => {
    if (collision(player, treasure)) {
      player.score += 10;
      return false;
    }
    return true;
  });
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-viewport.x, -viewport.y);

  // Draw background
  ctx.fillStyle = "#3b2f2f";
  ctx.fillRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

  // Draw walls
  ctx.fillStyle = "brown";
  walls.forEach((wall) => ctx.fillRect(wall.x, wall.y, wall.width, wall.height));

  // Draw player
  ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);

  // Draw treasures
  treasures.forEach((treasure) =>
    ctx.drawImage(
      treasureImage,
      treasure.x,
      treasure.y,
      treasure.size,
      treasure.size
    )
  );

  // Draw enemies
  enemies.forEach((enemy) =>
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.size, enemy.size)
  );

  ctx.restore();

  // UI
  document.getElementById("player-health").innerText = `Health: ${player.health}`;
  document.getElementById("score").innerText = `Score: ${player.score}`;
}

// Game loop
function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over! Refresh to Restart", canvas.width / 2 - 150, canvas.height / 2);
    return;
  }

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  initLevel();
  gameLoop();
});
