const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
const player = { x: 50, y: 50, size: 20, speed: 5, color: "blue" };
const enemies = [];
const treasures = [];
const boss = { x: 700, y: 500, size: 40, health: 10, color: "red" };
let bossActive = false;
let gameOver = false;

// Add enemies and treasures
for (let i = 0; i < 5; i++) {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 20,
    speed: 2,
    direction: Math.random() * 2 * Math.PI,
    color: "green",
  });
  treasures.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 15,
    color: "gold",
  });
}

// Player movement
const keys = {};
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

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

// Update game state
function update() {
  // Move player
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y < canvas.height - player.size) player.y += player.speed;
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.size) player.x += player.speed;

  // Move enemies
  enemies.forEach((enemy) => {
    enemy.x += Math.cos(enemy.direction) * enemy.speed;
    enemy.y += Math.sin(enemy.direction) * enemy.speed;

    // Bounce off walls
    if (enemy.x < 0 || enemy.x > canvas.width) enemy.direction = Math.PI - enemy.direction;
    if (enemy.y < 0 || enemy.y > canvas.height) enemy.direction = -enemy.direction;

    // Check collision with player
    if (collision(player, enemy)) gameOver = true;
  });

  // Check for treasure collection
  treasures.forEach((treasure, index) => {
    if (collision(player, treasure)) {
      treasures.splice(index, 1);
    }
  });

  // Activate boss if all treasures are collected
  if (treasures.length === 0 && !bossActive) {
    bossActive = true;
  }

  // Boss movement and collision
  if (bossActive) {
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.x += Math.cos(angle) * 2;
    boss.y += Math.sin(angle) * 2;

    if (collision(player, boss)) gameOver = true;
  }
}

// Draw game objects
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
  });

  // Draw treasures
  treasures.forEach((treasure) => {
    ctx.fillStyle = treasure.color;
    ctx.fillRect(treasure.x, treasure.y, treasure.size, treasure.size);
  });

  // Draw boss
  if (bossActive) {
    ctx.fillStyle = boss.color;
    ctx.fillRect(boss.x, boss.y, boss.size, boss.size);

    // Draw boss health
    ctx.fillStyle = "white";
    ctx.fillText(`Boss Health: ${boss.health}`, 10, 20);
  }
}

// Collision detection
function collision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.size &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + obj2.size &&
    obj1.y + obj1.size > obj2.y
  );
}

// Start the game loop
gameLoop();
