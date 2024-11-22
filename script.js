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

let mouseX = 0;
let mouseY = 0;

// Track mouse movement for aiming bullets
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

// Initialize level elements
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
    { x: 100, y: 100, width: 200, height: 20 },
    { x: 300, y: 300, width: 20, height: 150 },
    { x: 500, y: 200, width: 100, height: 20 },
  ];
}

// Key listeners
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    attack(); // Melee attack
  }
  if (e.key === "f" && player.hasLauncher) {
    shootBullet(); // Fire projectile
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

// Player attack (melee)
function attack() {
  try {
    attackSound.play();
  } catch (e) {
    console.warn("Attack sound playback failed.");
  }

  enemies.forEach((enemy, index) => {
    if (distance(player, enemy) < player.attackRange) {
      enemy.health -= 1;
      try {
        hitSound.play();
      } catch (e) {
        console.warn("Hit sound playback failed.");
      }
      if (enemy.health <= 0) {
        enemies.splice(index, 1);
        player.score += 10;
      }
    }
  });

  if (boss.active && distance(player, boss) < player.attackRange) {
    boss.health -= 1;
    try {
      hitSound.play();
    } catch (e) {
      console.warn("Hit sound playback failed.");
    }
    if (boss.health <= 0) {
      boss.active = false;
      player.score += 50;
    }
  }
}

// Shoot a bullet
function shootBullet() {
  const bulletSpeed = 8;
  const angle = Math.atan2(
    mouseY - (player.y + player.size / 2),
    mouseX - (player.x + player.size / 2)
  );
  bullets.push({
    x: player.x + player.size / 2 - 5,
    y: player.y + player.size / 2 - 5,
    size: 10,
    speed: bulletSpeed,
    directionX: Math.cos(angle),
    directionY: Math.sin(angle),
  });

  try {
    shootSound.play();
  } catch (e) {
    console.warn("Shoot sound playback failed.");
  }
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
  // Player movement
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y < canvas.height - player.size) player.y += player.speed;
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.size) player.x += player.speed;

  // Wall collision for player
  walls.forEach((wall) => {
    if (
      player.x < wall.x + wall.width &&
      player.x + player.size > wall.x &&
      player.y < wall.y + wall.height &&
      player.y + player.size > wall.y
    ) {
      if (keys["ArrowUp"]) player.y += player.speed;
      if (keys["ArrowDown"]) player.y -= player.speed;
      if (keys["ArrowLeft"]) player.x += player.speed;
      if (keys["ArrowRight"]) player.x -= player.speed;
    }
  });

  // Launcher pickup
  if (collision(player, launcher) && !launcher.pickedUp) {
    launcher.pickedUp = true;
    player.hasLauncher = true; // Player now has the launcher
    console.log("Launcher picked up!");
  }

  // Enemy movement and collision
  enemies.forEach((enemy) => {
    walls.forEach((wall) => {
      if (
        enemy.x < wall.x + wall.width &&
        enemy.x + enemy.size > wall.x &&
        enemy.y < wall.y + wall.height &&
        enemy.y + enemy.size > wall.y
      ) {
        enemy.direction = (enemy.direction + Math.PI) % (2 * Math.PI); // Bounce off walls
      }
    });

    if (enemy.x <= 0 || enemy.x + enemy.size >= canvas.width) {
      enemy.direction = Math.PI - enemy.direction; // Bounce off edges
    }
    if (enemy.y <= 0 || enemy.y + enemy.size >= canvas.height) {
      enemy.direction = -enemy.direction;
    }

    enemy.x += Math.cos(enemy.direction) * enemy.speed;
    enemy.y += Math.sin(enemy.direction) * enemy.speed;

    if (collision(player, enemy)) {
      player.health -= 1;
      if (player.health <= 0) {
        gameOver = true;
        try {
          gameOverSound.play();
        } catch (e) {
          console.warn("Game over sound playback failed.");
        }
      }
    }
  });

  // Bullets
  bullets.forEach((bullet, index) => {
    bullet.x += bullet.directionX * bullet.speed;
    bullet.y += bullet.directionY * bullet.speed;

    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
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
      if (boss.health <= 0) {
        boss.active = false;
        player.score += 50;
      }
    }
  });

  // Boss movement and collision
  if (boss.active) {
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.x += Math.cos(angle) * 2;
    boss.y += Math.sin(angle) * 2;

    if (collision(player, boss)) {
      player.health -= 1;
      if (player.health <= 0) {
        gameOver = true;
        try {
          gameOverSound.play();
        } catch (e) {
          console.warn("Game over sound playback failed.");
        }
      }
    }
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Walls
  ctx.fillStyle = "brown";
  walls.forEach((wall) => {
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  });

  // Player
  if (playerImage.complete && playerImage.naturalHeight !== 0) {
    ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);
  }

  // Launcher
  if (!launcher.pickedUp) {
    ctx.drawImage(launcherImage, launcher.x, launcher.y, launcher.size, launcher.size);
  }

  // Enemies
  enemies.forEach((enemy) => {
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.size, enemy.size);
  });

  // Bullets
  bullets.forEach((bullet) => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
  });

  // Boss
  if (boss.active) {
    ctx.drawImage(bossImage, boss.x, boss.y, boss.size, boss.size);
  }

  // UI
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
