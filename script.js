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

// Game variables
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
let launcher = { x: 400, y: 300, size: 30, pickedUp: false };
let keys = {};
let level = 1;
let gameOver = false;

// Initialize enemies, treasures, walls, and launcher
function initLevel() {
  enemies = [];
  treasures = [];
  walls = [];
  bullets = [];
  launcher.pickedUp = false;

  // Create enemies
  for (let i = 0; i < level * 3; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 40,
      health: 3,
      speed: 1.5,
      direction: Math.random() * 2 * Math.PI,
    });
  }

  // Create treasures
  for (let i = 0; i < level; i++) {
    treasures.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 30,
    });
  }

  // Create walls
  walls = [
    { x: 200, y: 200, width: 100, height: 20 },
    { x: 400, y: 400, width: 20, height: 100 },
    { x: 300, y: 100, width: 150, height: 20 },
  ];
}

// Key listeners
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    attack(); // Attack with melee
  }
  if (e.key === "f" && player.hasLauncher) {
    shootBullet(); // Fire a bullet
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

// Distance calculation
function distance(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Attack function
function attack() {
  attackSound.play();

  // Attack enemies
  enemies.forEach((enemy, index) => {
    if (distance(player, enemy) < player.attackRange) {
      enemy.health -= 1;
      hitSound.play();
      if (enemy.health <= 0) {
        enemies.splice(index, 1);
        player.score += 10;
      }
    }
  });

  // Attack boss
  if (boss.active && distance(player, boss) < player.attackRange) {
    boss.health -= 1;
    hitSound.play();
    if (boss.health <= 0) {
      boss.active = false;
      player.score += 50;
    }
  }
}

// Shoot a bullet
function shootBullet() {
  bullets.push({
    x: player.x + player.size / 2,
    y: player.y + player.size / 2,
    size: 10,
    speed: 8,
    direction: Math.atan2(keys.mouseY - player.y, keys.mouseX - player.x),
  });
  shootSound.play();
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
    const angle =
      Math.atan2(player.y - enemy.y, player.x - enemy.x) +
      (Math.random() - 0.5) * 0.5; // Add random offset for less accuracy
    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;

    if (collision(player, enemy)) {
      player.health -= 0.5; // Reduced damage
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

  // Pick up launcher
  if (collision(player, launcher) && !launcher.pickedUp) {
    launcher.pickedUp = true;
    player.hasLauncher = true;
  }

  // Boss logic
  if (treasures.length === 0 && !boss.active) {
    boss.active = true;
  }

  if (boss.active) {
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.x += Math.cos(angle) * 2;
    boss.y += Math.sin(angle) * 2;

    if (collision(player, boss)) {
      player.health -= 1; // Reduced boss damage
      if (player.health <= 0) {
        gameOver = true;
        gameOverSound.play();
      }
    }
  }

  // Bullet logic
  bullets.forEach((bullet, index) => {
    bullet.x += Math.cos(bullet.direction) * bullet.speed;
    bullet.y += Math.sin(bullet.direction) * bullet.speed;

    // Remove bullet if it leaves the canvas
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(index, 1);
    }

    // Bullet hits enemies
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

    // Bullet hits boss
    if (boss.active && collision(bullet, boss)) {
      boss.health -= 5;
      bullets.splice(index, 1);
      if (boss.health <= 0) {
        boss.active = false;
        player.score += 50;
      }
    }
  });
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.fillStyle = "#87CEEB"; // Light blue for sky
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw walls
  ctx.fillStyle = "brown";
  walls.forEach((wall) => {
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  });

  // Draw player
  ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);

  // Draw launcher
  if (!launcher.pickedUp) {
    ctx.drawImage(launcherImage, launcher.x, launcher.y, launcher.size, launcher.size);
  }

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.size, enemy.size);
    ctx.fillStyle = "red";
    ctx.fillText(`HP: ${enemy.health}`, enemy.x, enemy.y - 10);
  });

  // Draw treasures
  treasures.forEach((treasure) => {
    ctx.drawImage(treasureImage, treasure.x, treasure.y, treasure.size, treasure.size);
  });

  // Draw bullets
  bullets.forEach((bullet) => {
    ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.size, bullet.size);
  });

  // Draw boss
  if (boss.active) {
    ctx.drawImage(bossImage, boss.x, boss.y, boss.size, boss.size);
    ctx.fillStyle = "red";
    ctx.fillText(`Boss HP: ${boss.health}`, boss.x, boss.y - 10);
  }

  // Draw UI
  document.getElementById("player-health").innerText = player.health;
  document.getElementById("score").innerText = player.score;
}

// Start game
initLevel();
gameLoop();
