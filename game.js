// Game constants
const CELL_SIZE = 30;
const ROWS = 20;
const COLS = 20;

// Game state
let canvas, ctx;
let score = 0;
let lives = 3;
let gameRunning = true;
let pacman = { x: 1, y: 1, direction: 'right' };
let dots = [];
let walls = [];
let ghosts = [];
let ghostMoveCounter = 0; // Add counter to slow down ghost movement

// Game maze layout (1 = wall, 0 = empty, 2 = dot)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,1,1],
    [0,0,0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
    [1,1,1,1,2,1,0,1,1,0,0,1,1,0,1,2,1,1,1,1],
    [0,0,0,0,2,0,0,1,0,0,0,0,1,0,0,2,0,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,1,0,1,2,1,1,1,1],
    [0,0,0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
    [1,1,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Initialize game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize dots and walls
    dots = [];
    walls = [];
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 1) {
                walls.push({ x: col, y: row });
            } else if (maze[row][col] === 2) {
                dots.push({ x: col, y: row });
            }
        }
    }
    
    // Reset game state
    score = 0;
    lives = 3;
    gameRunning = true;
    pacman = { x: 1, y: 1, direction: 'right' };
    ghostMoveCounter = 0;
    
    // Initialize ghosts
    ghosts = [
        { x: 9, y: 9, direction: 'up', color: '#ff0000' },    // Red ghost
        { x: 10, y: 9, direction: 'up', color: '#ffb8ff' },  // Pink ghost
        { x: 9, y: 10, direction: 'left', color: '#00ffff' }, // Cyan ghost
        { x: 10, y: 10, direction: 'left', color: '#ffb852' } // Orange ghost
    ];
    
    updateUI();
    gameLoop();
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Check for dot collection
    for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        if (dot.x === pacman.x && dot.y === pacman.y) {
            dots.splice(i, 1);
            score += 10;
            updateUI();
        }
    }
    
    // Update ghosts (move them slower than Pacman)
    ghostMoveCounter++;
    if (ghostMoveCounter >= 15) { // Move ghosts every 15 frames (slower than Pacman)
        ghostMoveCounter = 0;
        
        ghosts.forEach(ghost => {
            // Simple AI: try to move towards Pacman, or move randomly
            const directions = ['up', 'down', 'left', 'right'];
            let possibleMoves = [];
            
            // Check all possible moves
            directions.forEach(dir => {
                let newX = ghost.x;
                let newY = ghost.y;
                
                switch (dir) {
                    case 'up': newY--; break;
                    case 'down': newY++; break;
                    case 'left': newX--; break;
                    case 'right': newX++; break;
                }
                
                if (isValidMove(newX, newY)) {
                    possibleMoves.push({ direction: dir, x: newX, y: newY });
                }
            });
            
            if (possibleMoves.length > 0) {
                // Try to move towards Pacman
                let bestMove = possibleMoves[0];
                let shortestDistance = Math.abs(bestMove.x - pacman.x) + Math.abs(bestMove.y - pacman.y);
                
                possibleMoves.forEach(move => {
                    const distance = Math.abs(move.x - pacman.x) + Math.abs(move.y - pacman.y);
                    if (distance < shortestDistance) {
                        shortestDistance = distance;
                        bestMove = move;
                    }
                });
                
                // Add some randomness (40% chance to move randomly)
                if (Math.random() < 0.4) {
                    bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
                
                ghost.x = bestMove.x;
                ghost.y = bestMove.y;
                ghost.direction = bestMove.direction;
            }
        });
    }
    
    // Check ghost collision with Pacman
    for (const ghost of ghosts) {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            lives--;
            updateUI();
            
            if (lives <= 0) {
                endGame(false);
                return;
            } else {
                // Reset positions after collision
                pacman.x = 1;
                pacman.y = 1;
                pacman.direction = 'right';
                
                // Reset ghosts to starting positions
                ghosts[0] = { x: 9, y: 9, direction: 'up', color: '#ff0000' };
                ghosts[1] = { x: 10, y: 9, direction: 'up', color: '#ffb8ff' };
                ghosts[2] = { x: 9, y: 10, direction: 'left', color: '#00ffff' };
                ghosts[3] = { x: 10, y: 10, direction: 'left', color: '#ffb852' };
                
                // Brief pause after collision
                setTimeout(() => {}, 500);
            }
            break;
        }
    }
    
    // Check win condition
    if (dots.length === 0) {
        endGame(true);
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw walls
    ctx.fillStyle = '#0000ff';
    walls.forEach(wall => {
        ctx.fillRect(wall.x * CELL_SIZE, wall.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
    
    // Draw dots
    ctx.fillStyle = '#fff';
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(
            dot.x * CELL_SIZE + CELL_SIZE / 2,
            dot.y * CELL_SIZE + CELL_SIZE / 2,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
    
    // Draw Pacman
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    
    const centerX = pacman.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = pacman.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 3;
    
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    // Create mouth based on direction
    switch (pacman.direction) {
        case 'right':
            startAngle = Math.PI * 0.2;
            endAngle = Math.PI * 1.8;
            break;
        case 'left':
            startAngle = Math.PI * 1.2;
            endAngle = Math.PI * 0.8;
            break;
        case 'up':
            startAngle = Math.PI * 1.7;
            endAngle = Math.PI * 1.3;
            break;
        case 'down':
            startAngle = Math.PI * 0.7;
            endAngle = Math.PI * 0.3;
            break;
    }
    
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
    
    // Draw ghosts
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        
        const ghostCenterX = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const ghostCenterY = ghost.y * CELL_SIZE + CELL_SIZE / 2;
        const ghostRadius = CELL_SIZE / 2 - 3;
        
        // Draw ghost body (circle)
        ctx.arc(ghostCenterX, ghostCenterY, ghostRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw ghost eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ghostCenterX - 6, ghostCenterY - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ghostCenterX + 6, ghostCenterY - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(ghostCenterX - 6, ghostCenterY - 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ghostCenterX + 6, ghostCenterY - 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Handle keyboard input
function handleKeyPress(event) {
    if (!gameRunning) return;
    
    let newX = pacman.x;
    let newY = pacman.y;
    let newDirection = pacman.direction;
    
    switch (event.key) {
        case 'ArrowUp':
            newY = pacman.y - 1;
            newDirection = 'up';
            break;
        case 'ArrowDown':
            newY = pacman.y + 1;
            newDirection = 'down';
            break;
        case 'ArrowLeft':
            newX = pacman.x - 1;
            newDirection = 'left';
            break;
        case 'ArrowRight':
            newX = pacman.x + 1;
            newDirection = 'right';
            break;
        default:
            return;
    }
    
    // Check if move is valid (not into a wall)
    if (isValidMove(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
        pacman.direction = newDirection;
    } else {
        // Just update direction even if can't move
        pacman.direction = newDirection;
    }
}

// Check if a position is valid (not a wall and within bounds)
function isValidMove(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
        return false;
    }
    
    return maze[y][x] !== 1;
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// End game
function endGame(won) {
    gameRunning = false;
    const gameOverElement = document.getElementById('gameOver');
    const gameOverText = document.getElementById('gameOverText');
    
    if (won) {
        gameOverText.textContent = 'You Win!';
        gameOverText.style.color = '#00ff00';
    } else {
        gameOverText.textContent = 'Game Over';
        gameOverText.style.color = '#ff0000';
    }
    
    gameOverElement.style.display = 'block';
}

// Restart game
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    initGame();
}

// Event listeners
document.addEventListener('keydown', handleKeyPress);

// Start the game when page loads
window.onload = initGame;