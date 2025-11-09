// ==========================================
// GRAVITY WEAVER - Game Logic
// A hyper-casual gravity flip game
// ==========================================

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const maxWidth = 600;
    const maxHeight = 800;
    const aspectRatio = maxHeight / maxWidth;

    let width = Math.min(window.innerWidth, maxWidth);
    let height = width * aspectRatio;

    if (height > window.innerHeight) {
        height = window.innerHeight;
        width = height / aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==========================================
// SOUND EFFECTS (Web Audio API)
// ==========================================

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playFlipSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playScoreSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

function playGameOverSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// ==========================================
// GAME STATE
// ==========================================

const GameState = {
    START: 'start',
    PLAYING: 'playing',
    GAMEOVER: 'gameover',
    SHOP: 'shop'
};

let currentState = GameState.START;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

// ==========================================
// PLAYER / THREAD
// ==========================================

class Player {
    constructor() {
        this.x = canvas.width * 0.25;
        this.y = canvas.height / 2;
        this.radius = 8;
        this.velocityY = 0;
        this.gravity = 0.6;
        this.gravityDirection = 1; // 1 = down, -1 = up
        this.jumpForce = -12;
        this.maxVelocity = 12;
        this.trail = [];
        this.maxTrailLength = 20;
    }

    update() {
        // Apply gravity
        this.velocityY += this.gravity * this.gravityDirection;

        // Limit velocity
        if (Math.abs(this.velocityY) > this.maxVelocity) {
            this.velocityY = this.maxVelocity * Math.sign(this.velocityY);
        }

        this.y += this.velocityY;

        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Boundary check (top and bottom of screen = death)
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            gameOver();
        }
    }

    flipGravity() {
        this.gravityDirection *= -1;
        this.velocityY = this.jumpForce * this.gravityDirection;

        // Create particles on flip
        createParticles(this.x, this.y, 5);

        // Play flip sound
        playFlipSound();
    }

    draw() {
        // Draw trail
        const currentSkin = skins[activeSkin];
        const currentTrail = trails[activeTrail];

        ctx.strokeStyle = currentTrail.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);

            for (let i = 1; i < this.trail.length; i++) {
                const alpha = i / this.trail.length;
                ctx.globalAlpha = alpha * 0.5;
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }

            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Draw player
        ctx.fillStyle = currentSkin.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow effect
        ctx.shadowColor = currentSkin.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    reset() {
        this.y = canvas.height / 2;
        this.velocityY = 0;
        this.gravityDirection = 1;
        this.trail = [];
    }
}

// ==========================================
// OBSTACLES
// ==========================================

class Obstacle {
    constructor() {
        this.width = 60;
        this.gap = 200; // Gap between top and bottom obstacles
        this.x = canvas.width;

        // Random gap position
        const minY = 100;
        const maxY = canvas.height - this.gap - 100;
        this.gapY = Math.random() * (maxY - minY) + minY;

        this.speed = 4;
        this.passed = false;
        this.color = '#e74c3c';
    }

    update() {
        this.x -= this.speed;

        // Award points when player passes obstacle
        if (!this.passed && this.x + this.width < player.x) {
            this.passed = true;
            score++;
            updateScore();
            playScoreSound();

            // Increase difficulty gradually
            if (score % 5 === 0 && this.speed < 8) {
                obstacles.forEach(obs => obs.speed += 0.2);
            }
        }
    }

    draw() {
        // Top obstacle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, 0, this.width, this.gapY);

        // Bottom obstacle
        ctx.fillRect(this.x, this.gapY + this.gap, this.width, canvas.height - (this.gapY + this.gap));

        // Add some visual detail (stripes)
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 3;

        for (let i = 0; i < this.gapY; i += 20) {
            ctx.beginPath();
            ctx.moveTo(this.x, i);
            ctx.lineTo(this.x + this.width, i);
            ctx.stroke();
        }

        for (let i = this.gapY + this.gap; i < canvas.height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(this.x, i);
            ctx.lineTo(this.x + this.width, i);
            ctx.stroke();
        }
    }

    offScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(player) {
        // Check if player is within obstacle's x range
        if (player.x + player.radius > this.x && player.x - player.radius < this.x + this.width) {
            // Check if player is NOT in the gap
            if (player.y - player.radius < this.gapY || player.y + player.radius > this.gapY + this.gap) {
                return true;
            }
        }
        return false;
    }
}

// ==========================================
// PARTICLES
// ==========================================

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 3 + 1;
        this.color = color || '#667eea';
        this.velocityX = (Math.random() - 0.5) * 6;
        this.velocityY = (Math.random() - 0.5) * 6;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life -= this.decay;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

function createParticles(x, y, count) {
    const currentSkin = skins[activeSkin];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, currentSkin.color));
    }
}

// ==========================================
// SKINS & CUSTOMIZATION
// ==========================================

const skins = {
    classic: { name: 'Classic', color: '#667eea', unlocked: true, cost: 0 },
    lightning: { name: 'Lightning', color: '#f1c40f', unlocked: false, cost: 50 },
    fire: { name: 'Fire', color: '#e74c3c', unlocked: false, cost: 50 },
    ice: { name: 'Ice', color: '#3498db', unlocked: false, cost: 50 },
    toxic: { name: 'Toxic', color: '#2ecc71', unlocked: false, cost: 75 },
    galaxy: { name: 'Galaxy', color: '#9b59b6', unlocked: false, cost: 100 }
};

const trails = {
    none: { name: 'None', color: 'rgba(255, 255, 255, 0.3)', unlocked: true, cost: 0 },
    spark: { name: 'Spark', color: 'rgba(241, 196, 15, 0.5)', unlocked: false, cost: 30 },
    smoke: { name: 'Smoke', color: 'rgba(149, 165, 166, 0.6)', unlocked: false, cost: 30 },
    rainbow: { name: 'Rainbow', color: 'rgba(155, 89, 182, 0.5)', unlocked: false, cost: 50 }
};

let activeSkin = localStorage.getItem('activeSkin') || 'classic';
let activeTrail = localStorage.getItem('activeTrail') || 'none';
let totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0;

// Load unlocked items
Object.keys(skins).forEach(key => {
    const unlocked = localStorage.getItem(`skin_${key}`);
    if (unlocked === 'true') skins[key].unlocked = true;
});

Object.keys(trails).forEach(key => {
    const unlocked = localStorage.getItem(`trail_${key}`);
    if (unlocked === 'true') trails[key].unlocked = true;
});

// ==========================================
// GAME OBJECTS
// ==========================================

let player = new Player();
let obstacles = [];
let particles = [];
let obstacleSpawnTimer = 0;
let obstacleSpawnInterval = 120; // frames

// ==========================================
// INPUT HANDLING
// ==========================================

let isHolding = false;

function handleInputStart(e) {
    e.preventDefault();

    if (currentState === GameState.PLAYING) {
        isHolding = true;
        player.flipGravity();
    }
}

function handleInputEnd(e) {
    e.preventDefault();

    if (currentState === GameState.PLAYING) {
        isHolding = false;
        player.flipGravity();
    }
}

// Mouse events
canvas.addEventListener('mousedown', handleInputStart);
canvas.addEventListener('mouseup', handleInputEnd);

// Touch events
canvas.addEventListener('touchstart', handleInputStart);
canvas.addEventListener('touchend', handleInputEnd);

// ==========================================
// GAME FUNCTIONS
// ==========================================

function startGame() {
    currentState = GameState.PLAYING;
    score = 0;
    obstacles = [];
    particles = [];
    obstacleSpawnTimer = 0;
    player.reset();

    // Hide start screen
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('ui-overlay').style.display = 'flex';

    updateScore();
}

function gameOver() {
    if (currentState !== GameState.PLAYING) return;

    currentState = GameState.GAMEOVER;

    // Play game over sound
    playGameOverSound();

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }

    // Award coins (1 coin per point)
    totalCoins += score;
    localStorage.setItem('totalCoins', totalCoins);

    // Create explosion particles
    createParticles(player.x, player.y, 30);

    // Show game over screen
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-high-score').textContent = highScore;
    document.getElementById('gameover-screen').classList.remove('hidden');
}

function updateScore() {
    document.getElementById('current-score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    if (currentState === GameState.PLAYING) {
        // Update player
        player.update();

        // Spawn obstacles
        obstacleSpawnTimer++;
        if (obstacleSpawnTimer >= obstacleSpawnInterval) {
            obstacles.push(new Obstacle());
            obstacleSpawnTimer = 0;
        }

        // Update and draw obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].draw();

            // Check collision
            if (obstacles[i].collidesWith(player)) {
                gameOver();
            }

            // Remove off-screen obstacles
            if (obstacles[i].offScreen()) {
                obstacles.splice(i, 1);
            }
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }

        // Draw player
        player.draw();

    } else {
        // Still draw particles in other states
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }

        // Draw player (static)
        player.draw();
    }

    requestAnimationFrame(gameLoop);
}

// ==========================================
// UI EVENT HANDLERS
// ==========================================

document.getElementById('start-btn').addEventListener('click', () => {
    startGame();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('gameover-screen').classList.add('hidden');
    startGame();
});

document.getElementById('shop-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('shop-screen').classList.remove('hidden');
    currentState = GameState.SHOP;
    renderShop();
});

document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('shop-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    currentState = GameState.START;
});

document.getElementById('share-btn').addEventListener('click', () => {
    const text = `I scored ${score} points in Gravity Weaver! Can you beat that?`;

    if (navigator.share) {
        navigator.share({
            title: 'Gravity Weaver',
            text: text,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text + ' ' + window.location.href)
            .then(() => alert('Score copied to clipboard!'))
            .catch(err => console.log('Error copying:', err));
    }
});

// ==========================================
// SHOP RENDERING
// ==========================================

function renderShop() {
    const skinContainer = document.getElementById('skin-options');
    const trailContainer = document.getElementById('trail-options');

    skinContainer.innerHTML = '';
    trailContainer.innerHTML = '';

    // Render skins
    Object.keys(skins).forEach(key => {
        const skin = skins[key];
        const div = document.createElement('div');
        div.className = 'option-item';

        if (key === activeSkin) div.classList.add('selected');
        if (!skin.unlocked) div.classList.add('locked');

        div.innerHTML = `
            <div class="option-preview" style="background: ${skin.color};"></div>
            <div class="option-name">${skin.name}</div>
            <div class="option-cost">${skin.unlocked ? 'Unlocked' : skin.cost + ' coins'}</div>
        `;

        div.addEventListener('click', () => selectSkin(key));
        skinContainer.appendChild(div);
    });

    // Render trails
    Object.keys(trails).forEach(key => {
        const trail = trails[key];
        const div = document.createElement('div');
        div.className = 'option-item';

        if (key === activeTrail) div.classList.add('selected');
        if (!trail.unlocked) div.classList.add('locked');

        div.innerHTML = `
            <div class="option-preview" style="background: ${trail.color};"></div>
            <div class="option-name">${trail.name}</div>
            <div class="option-cost">${trail.unlocked ? 'Unlocked' : trail.cost + ' coins'}</div>
        `;

        div.addEventListener('click', () => selectTrail(key));
        trailContainer.appendChild(div);
    });

    // Update coin display
    updateCoinDisplay();
}

function selectSkin(key) {
    const skin = skins[key];

    if (!skin.unlocked) {
        if (totalCoins >= skin.cost) {
            totalCoins -= skin.cost;
            skin.unlocked = true;
            localStorage.setItem('totalCoins', totalCoins);
            localStorage.setItem(`skin_${key}`, 'true');
        } else {
            alert(`Not enough coins! You need ${skin.cost - totalCoins} more.`);
            return;
        }
    }

    activeSkin = key;
    localStorage.setItem('activeSkin', key);
    renderShop();
}

function selectTrail(key) {
    const trail = trails[key];

    if (!trail.unlocked) {
        if (totalCoins >= trail.cost) {
            totalCoins -= trail.cost;
            trail.unlocked = true;
            localStorage.setItem('totalCoins', totalCoins);
            localStorage.setItem(`trail_${key}`, 'true');
        } else {
            alert(`Not enough coins! You need ${trail.cost - totalCoins} more.`);
            return;
        }
    }

    activeTrail = key;
    localStorage.setItem('activeTrail', key);
    renderShop();
}

function updateCoinDisplay() {
    // You could add a coin counter in the shop UI if desired
}

// ==========================================
// INITIALIZE GAME
// ==========================================

updateScore();
gameLoop();

console.log('🎮 Gravity Weaver loaded! Tap/Hold to flip gravity and avoid obstacles.');
