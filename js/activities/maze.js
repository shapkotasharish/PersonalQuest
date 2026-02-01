// Memory Lane Maze Activity - Rebuilt with real maze, portal, and willow forest
const MazeActivity = {
    canvas: null,
    ctx: null,
    player: null,
    player2: null,
    mode: 'solo',
    mazeGrid: null,
    memories: [],
    collectedMemories: [],
    keys: {},
    gamePhase: 'forest', // 'forest', 'maze'
    portalAnimation: 0,
    animationFrame: null,

    // Maze settings
    mazeRows: 15,
    mazeCols: 21,
    cellSize: 40,

    // Forest scene
    willowTrees: [],
    portalX: 0,
    portalY: 0,
    forestParticles: [],

    // Trail particles
    trailParticles: [],

    avatarOptions: {
        type: '❤️',
        color: '#ff6b9d',
        trail: 'sparkles'
    },

    avatarTypes: ['❤️', '✨', '🦋', '⭐', '🌸', '🐦', '👤'],
    colors: ['#ff6b9d', '#ffd700', '#ff8c42', '#87CEEB', '#DDA0DD', '#98FB98'],

    init(container) {
        container.innerHTML = `
            <div class="maze-container">
                <div class="avatar-customization" id="customization">
                    <h2>Customize Your Character</h2>

                    <div class="customization-options">
                        <div class="option-group">
                            <label>Character Type:</label>
                            <div class="option-buttons" id="type-options"></div>
                        </div>

                        <div class="option-group">
                            <label>Color:</label>
                            <div class="color-options" id="color-options"></div>
                        </div>

                        <div class="option-group">
                            <label>Trail Effect:</label>
                            <div class="option-buttons" id="trail-options">
                                <button class="avatar-option selected" data-trail="sparkles">✨ Sparkles</button>
                                <button class="avatar-option" data-trail="glow">💫 Glow</button>
                                <button class="avatar-option" data-trail="petals">🌸 Petals</button>
                                <button class="avatar-option" data-trail="stars">⭐ Stars</button>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 30px; display: flex; gap: 20px;">
                        <button class="action-btn" id="solo-btn">Solo Mode</button>
                        <button class="action-btn" id="duet-btn">Duet Mode</button>
                    </div>
                </div>
            </div>
        `;

        this.setupCustomization();
    },

    setupCustomization() {
        // Avatar types
        const typeContainer = document.getElementById('type-options');
        this.avatarTypes.forEach((type, i) => {
            const btn = document.createElement('button');
            btn.className = 'avatar-option' + (i === 0 ? ' selected' : '');
            btn.dataset.type = type;
            btn.textContent = type;
            btn.addEventListener('click', () => {
                typeContainer.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.avatarOptions.type = type;
            });
            typeContainer.appendChild(btn);
        });

        // Colors
        const colorContainer = document.getElementById('color-options');
        this.colors.forEach((color, i) => {
            const btn = document.createElement('button');
            btn.className = 'color-option' + (i === 0 ? ' selected' : '');
            btn.style.background = color;
            btn.dataset.color = color;
            btn.addEventListener('click', () => {
                colorContainer.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.avatarOptions.color = color;
            });
            colorContainer.appendChild(btn);
        });

        // Trail options
        document.querySelectorAll('#trail-options .avatar-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#trail-options .avatar-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.avatarOptions.trail = btn.dataset.trail;
            });
        });

        // Mode buttons
        document.getElementById('solo-btn').addEventListener('click', () => {
            this.mode = 'solo';
            this.startGame();
        });

        document.getElementById('duet-btn').addEventListener('click', () => {
            this.mode = 'duet';
            this.startGame();
        });
    },

    startGame() {
        const container = document.getElementById('activity-content');

        container.innerHTML = `
            <div class="maze-container">
                <canvas id="maze-canvas"></canvas>
                <div class="maze-controls" id="maze-controls">
                    ${this.mode === 'solo' ?
                        'Use Arrow Keys or WASD to move' :
                        'Player 1: WASD | Player 2: Arrow Keys'}
                </div>
                <div class="memory-counter" id="memory-counter">
                    Memories: 0/${MemoryData.length}
                </div>
                <button class="reset-btn maze-reset" id="maze-reset-btn">Reset Maze</button>
            </div>
        `;

        this.showInstructions(() => {
            this.setupCanvas();
            this.gamePhase = 'forest';
            this.createForestScene();
            this.setupPlayers();
            this.attachControls();
            this.animate();
        });

        document.getElementById('maze-reset-btn').addEventListener('click', () => this.resetMaze());
    },

    showInstructions(callback) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const text = document.getElementById('modal-text');
        const closeBtn = document.getElementById('modal-close');

        title.textContent = 'Memory Lane Maze';
        text.innerHTML = `
            Navigate through our memory lane and collect precious moments!<br><br>
            <strong>How to play:</strong><br>
            • ${this.mode === 'solo' ? 'Use Arrow Keys or WASD to move' : 'Player 1: WASD, Player 2: Arrow Keys'}<br>
            • Walk through the willow forest to find the portal<br>
            • Enter the portal to access the memory maze<br>
            • ${this.mode === 'duet' ? 'Both players start at opposite ends - meet in the middle!' : 'Navigate the maze and collect all memories'}<br>
            • Find glowing orbs to reveal memories<br><br>
            💕 Let's walk down memory lane together!
        `;

        modal.classList.remove('hidden');

        const handleClose = () => {
            modal.classList.add('hidden');
            closeBtn.removeEventListener('click', handleClose);
            callback();
        };

        closeBtn.addEventListener('click', handleClose);
    },

    setupCanvas() {
        this.canvas = document.getElementById('maze-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        window.addEventListener('resize', () => this.resizeCanvas());
    },

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createForestScene() {
        // Create willow trees
        this.willowTrees = [];
        const numTrees = 12;

        for (let i = 0; i < numTrees; i++) {
            // Trees on left and right sides, leaving path in middle
            const side = i < numTrees / 2 ? 'left' : 'right';
            const x = side === 'left' ?
                50 + Math.random() * (this.canvas.width * 0.3) :
                this.canvas.width * 0.7 + Math.random() * (this.canvas.width * 0.25);
            const y = 100 + Math.random() * (this.canvas.height - 200);

            this.willowTrees.push({
                x,
                y,
                height: 150 + Math.random() * 100,
                branches: this.generateWillowBranches(),
                swayOffset: Math.random() * Math.PI * 2
            });
        }

        // Portal at the end of the forest path
        this.portalX = this.canvas.width / 2;
        this.portalY = 150;

        // Forest particles (fireflies)
        this.forestParticles = [];
        for (let i = 0; i < 30; i++) {
            this.forestParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 3,
                speed: 0.5 + Math.random() * 1,
                angle: Math.random() * Math.PI * 2,
                brightness: Math.random()
            });
        }
    },

    generateWillowBranches() {
        const branches = [];
        const numBranches = 8 + Math.floor(Math.random() * 6);

        for (let i = 0; i < numBranches; i++) {
            const angle = (i / numBranches) * Math.PI - Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            const length = 60 + Math.random() * 80;
            const strands = [];

            // Hanging strands
            const numStrands = 3 + Math.floor(Math.random() * 4);
            for (let j = 0; j < numStrands; j++) {
                strands.push({
                    startT: 0.3 + Math.random() * 0.5,
                    length: 30 + Math.random() * 50,
                    sway: Math.random() * Math.PI * 2
                });
            }

            branches.push({ angle, length, strands });
        }

        return branches;
    },

    generateMaze() {
        // Use DFS algorithm to generate a proper maze
        const rows = this.mazeRows;
        const cols = this.mazeCols;

        // Initialize grid with all walls
        this.mazeGrid = [];
        for (let r = 0; r < rows; r++) {
            this.mazeGrid[r] = [];
            for (let c = 0; c < cols; c++) {
                this.mazeGrid[r][c] = {
                    visited: false,
                    walls: { top: true, right: true, bottom: true, left: true }
                };
            }
        }

        // DFS maze generation
        const stack = [];
        const startR = Math.floor(rows / 2);
        const startC = Math.floor(cols / 2);

        this.mazeGrid[startR][startC].visited = true;
        stack.push({ r: startR, c: startC });

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.r, current.c);

            if (neighbors.length === 0) {
                stack.pop();
            } else {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWall(current.r, current.c, next.r, next.c);
                this.mazeGrid[next.r][next.c].visited = true;
                stack.push(next);
            }
        }

        // Create entrance and exit openings
        // Player 1 entrance (left side)
        this.mazeGrid[Math.floor(rows / 2)][0].walls.left = false;

        // Player 2 entrance (right side) or exit for solo
        this.mazeGrid[Math.floor(rows / 2)][cols - 1].walls.right = false;

        // Make some extra openings to make it slightly easier
        for (let i = 0; i < 10; i++) {
            const r = 1 + Math.floor(Math.random() * (rows - 2));
            const c = 1 + Math.floor(Math.random() * (cols - 2));
            const wallToRemove = ['top', 'right', 'bottom', 'left'][Math.floor(Math.random() * 4)];
            this.mazeGrid[r][c].walls[wallToRemove] = false;

            // Remove corresponding wall from neighbor
            if (wallToRemove === 'top' && r > 0) this.mazeGrid[r-1][c].walls.bottom = false;
            if (wallToRemove === 'bottom' && r < rows-1) this.mazeGrid[r+1][c].walls.top = false;
            if (wallToRemove === 'left' && c > 0) this.mazeGrid[r][c-1].walls.right = false;
            if (wallToRemove === 'right' && c < cols-1) this.mazeGrid[r][c+1].walls.left = false;
        }

        // Setup memories in the maze
        this.setupMemories();
    },

    getUnvisitedNeighbors(r, c) {
        const neighbors = [];
        const rows = this.mazeRows;
        const cols = this.mazeCols;

        if (r > 0 && !this.mazeGrid[r-1][c].visited) neighbors.push({ r: r-1, c });
        if (r < rows-1 && !this.mazeGrid[r+1][c].visited) neighbors.push({ r: r+1, c });
        if (c > 0 && !this.mazeGrid[r][c-1].visited) neighbors.push({ r, c: c-1 });
        if (c < cols-1 && !this.mazeGrid[r][c+1].visited) neighbors.push({ r, c: c+1 });

        return neighbors;
    },

    removeWall(r1, c1, r2, c2) {
        if (r2 < r1) {
            this.mazeGrid[r1][c1].walls.top = false;
            this.mazeGrid[r2][c2].walls.bottom = false;
        } else if (r2 > r1) {
            this.mazeGrid[r1][c1].walls.bottom = false;
            this.mazeGrid[r2][c2].walls.top = false;
        } else if (c2 < c1) {
            this.mazeGrid[r1][c1].walls.left = false;
            this.mazeGrid[r2][c2].walls.right = false;
        } else if (c2 > c1) {
            this.mazeGrid[r1][c1].walls.right = false;
            this.mazeGrid[r2][c2].walls.left = false;
        }
    },

    setupMemories() {
        this.memories = [];
        this.collectedMemories = [];

        const rows = this.mazeRows;
        const cols = this.mazeCols;

        // Calculate maze offset to center it
        const mazeWidth = cols * this.cellSize;
        const mazeHeight = rows * this.cellSize;
        this.mazeOffsetX = (this.canvas.width - mazeWidth) / 2;
        this.mazeOffsetY = (this.canvas.height - mazeHeight) / 2;

        // Place memories throughout the maze
        // Last memory (heart) goes in the center
        const memoryPositions = [];

        // Generate positions spread across the maze
        for (let i = 0; i < MemoryData.length - 1; i++) {
            let r, c;
            let attempts = 0;
            do {
                r = 1 + Math.floor(Math.random() * (rows - 2));
                c = 1 + Math.floor(Math.random() * (cols - 2));
                attempts++;
            } while (
                memoryPositions.some(p => Math.abs(p.r - r) < 2 && Math.abs(p.c - c) < 2) &&
                attempts < 50
            );
            memoryPositions.push({ r, c });
        }

        // Center position for the final memory
        memoryPositions.push({ r: Math.floor(rows / 2), c: Math.floor(cols / 2) });

        memoryPositions.forEach((pos, index) => {
            const memory = MemoryData[index];
            this.memories.push({
                ...memory,
                gridR: pos.r,
                gridC: pos.c,
                x: this.mazeOffsetX + pos.c * this.cellSize + this.cellSize / 2,
                y: this.mazeOffsetY + pos.r * this.cellSize + this.cellSize / 2,
                collected: false,
                pulsePhase: Math.random() * Math.PI * 2
            });
        });
    },

    setupPlayers() {
        if (this.gamePhase === 'forest') {
            // Players start at bottom of forest
            this.player = {
                x: this.canvas.width / 2 - (this.mode === 'duet' ? 30 : 0),
                y: this.canvas.height - 100,
                size: 30,
                speed: 4,
                avatar: this.avatarOptions.type,
                color: this.avatarOptions.color,
                trail: this.avatarOptions.trail
            };

            if (this.mode === 'duet') {
                this.player2 = {
                    x: this.canvas.width / 2 + 30,
                    y: this.canvas.height - 100,
                    size: 30,
                    speed: 4,
                    avatar: '💖',
                    color: '#ffd700',
                    trail: 'stars'
                };
            } else {
                this.player2 = null;
            }
        }
    },

    enterMaze() {
        this.gamePhase = 'maze';
        this.generateMaze();

        // Position players at opposite ends of the maze
        const rows = this.mazeRows;
        const cols = this.mazeCols;

        // Player 1 starts at left entrance
        this.player.x = this.mazeOffsetX + this.cellSize / 2;
        this.player.y = this.mazeOffsetY + Math.floor(rows / 2) * this.cellSize + this.cellSize / 2;

        if (this.mode === 'duet' && this.player2) {
            // Player 2 starts at right entrance
            this.player2.x = this.mazeOffsetX + (cols - 0.5) * this.cellSize;
            this.player2.y = this.mazeOffsetY + Math.floor(rows / 2) * this.cellSize + this.cellSize / 2;
        }

        // Update controls display
        const controls = document.getElementById('maze-controls');
        if (controls) {
            controls.innerHTML = this.mode === 'solo' ?
                'Use Arrow Keys or WASD to move | Collect all memories!' :
                'Player 1: WASD | Player 2: Arrow Keys | Meet in the middle!';
        }
    },

    attachControls() {
        this.keydownHandler = (e) => {
            this.keys[e.key.toLowerCase()] = true;
            // Prevent page scrolling with arrow keys
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };

        this.keyupHandler = (e) => {
            this.keys[e.key.toLowerCase()] = false;
        };

        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    },

    updatePlayer(player, up, down, left, right, up2, down2, left2, right2) {
        let dx = 0, dy = 0;

        if (this.keys[up] || (up2 && this.keys[up2])) dy = -player.speed;
        if (this.keys[down] || (down2 && this.keys[down2])) dy = player.speed;
        if (this.keys[left] || (left2 && this.keys[left2])) dx = -player.speed;
        if (this.keys[right] || (right2 && this.keys[right2])) dx = player.speed;

        if (dx === 0 && dy === 0) return;

        // Try to move
        const newX = player.x + dx;
        const newY = player.y + dy;

        if (this.gamePhase === 'forest') {
            // Simple bounds checking for forest
            player.x = Math.max(player.size, Math.min(this.canvas.width - player.size, newX));
            player.y = Math.max(player.size, Math.min(this.canvas.height - player.size, newY));

            // Check portal collision
            const portalDist = Math.sqrt(
                Math.pow(player.x - this.portalX, 2) +
                Math.pow(player.y - this.portalY, 2)
            );

            if (portalDist < 50) {
                // Check if both players are near portal in duet mode
                if (this.mode === 'duet' && this.player2) {
                    const player2Dist = Math.sqrt(
                        Math.pow(this.player2.x - this.portalX, 2) +
                        Math.pow(this.player2.y - this.portalY, 2)
                    );
                    if (player2Dist < 50) {
                        this.enterMaze();
                    }
                } else {
                    this.enterMaze();
                }
            }
        } else if (this.gamePhase === 'maze') {
            // Maze collision detection
            if (!this.checkMazeCollision(newX, newY, player.size * 0.4)) {
                player.x = newX;
                player.y = newY;
            } else {
                // Try moving in only one direction
                if (!this.checkMazeCollision(newX, player.y, player.size * 0.4)) {
                    player.x = newX;
                } else if (!this.checkMazeCollision(player.x, newY, player.size * 0.4)) {
                    player.y = newY;
                }
            }

            // Check memory collection
            this.checkMemoryCollection(player);
        }

        // Add trail particles
        this.addTrailParticle(player);
    },

    checkMazeCollision(x, y, radius) {
        if (!this.mazeGrid) return false;

        const rows = this.mazeRows;
        const cols = this.mazeCols;
        const cellSize = this.cellSize;
        const offsetX = this.mazeOffsetX;
        const offsetY = this.mazeOffsetY;

        // Check if outside maze bounds
        if (x - radius < offsetX || x + radius > offsetX + cols * cellSize ||
            y - radius < offsetY || y + radius > offsetY + rows * cellSize) {
            return true;
        }

        // Get the cell the player is in
        const cellC = Math.floor((x - offsetX) / cellSize);
        const cellR = Math.floor((y - offsetY) / cellSize);

        if (cellR < 0 || cellR >= rows || cellC < 0 || cellC >= cols) {
            return true;
        }

        const cell = this.mazeGrid[cellR][cellC];
        const cellX = offsetX + cellC * cellSize;
        const cellY = offsetY + cellR * cellSize;

        const wallThickness = 4;

        // Check collision with walls
        if (cell.walls.top && y - radius < cellY + wallThickness) return true;
        if (cell.walls.bottom && y + radius > cellY + cellSize - wallThickness) return true;
        if (cell.walls.left && x - radius < cellX + wallThickness) return true;
        if (cell.walls.right && x + radius > cellX + cellSize - wallThickness) return true;

        return false;
    },

    addTrailParticle(player) {
        if (Math.random() > 0.4) return;

        let emoji;
        switch (player.trail) {
            case 'sparkles': emoji = '✨'; break;
            case 'glow': emoji = '💫'; break;
            case 'petals': emoji = '🌸'; break;
            case 'stars': emoji = '⭐'; break;
            default: emoji = '✨';
        }

        this.trailParticles.push({
            x: player.x + (Math.random() - 0.5) * 20,
            y: player.y + (Math.random() - 0.5) * 20,
            emoji,
            alpha: 1,
            size: 0.5 + Math.random() * 0.5
        });

        if (this.trailParticles.length > 50) {
            this.trailParticles.shift();
        }
    },

    checkMemoryCollection(player) {
        this.memories.forEach((memory, index) => {
            if (memory.collected) return;

            const dx = player.x - memory.x;
            const dy = player.y - memory.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 35) {
                this.collectMemory(index);
            }
        });
    },

    collectMemory(index) {
        const memory = this.memories[index];
        memory.collected = true;
        this.collectedMemories.push(memory);

        AudioManager.playEffect('success');

        document.getElementById('memory-counter').textContent =
            `Memories: ${this.collectedMemories.length}/${MemoryData.length}`;

        this.showMemoryPopup(memory);
    },

    showMemoryPopup(memory) {
        const popup = document.getElementById('memory-popup');
        const image = document.getElementById('memory-image');
        const caption = document.getElementById('memory-caption');

        image.src = memory.image;
        caption.textContent = memory.caption;

        popup.classList.remove('hidden');

        const closeBtn = document.getElementById('memory-close');
        const handleClose = () => {
            popup.classList.add('hidden');
            closeBtn.removeEventListener('click', handleClose);

            if (this.collectedMemories.length === MemoryData.length) {
                setTimeout(() => this.completeActivity(), 500);
            }
        };

        closeBtn.addEventListener('click', handleClose);
    },

    draw() {
        const time = performance.now() / 1000;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gamePhase === 'forest') {
            this.drawForest(time);
        } else {
            this.drawMaze(time);
        }

        // Draw trail particles
        this.trailParticles.forEach(particle => {
            particle.alpha -= 0.02;
            if (particle.alpha > 0) {
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.font = `${particle.size * 20}px Arial`;
                this.ctx.fillText(particle.emoji, particle.x, particle.y);
            }
        });
        this.ctx.globalAlpha = 1;
        this.trailParticles = this.trailParticles.filter(p => p.alpha > 0);

        // Draw players
        this.drawPlayer(this.player);
        if (this.player2) {
            this.drawPlayer(this.player2);
        }
    },

    drawForest(time) {
        // Night sky background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.3, '#1a1a3a');
        gradient.addColorStop(0.7, '#1a2a1a');
        gradient.addColorStop(1, '#0a1a0a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Stars
        for (let i = 0; i < 100; i++) {
            const x = (i * 137) % this.canvas.width;
            const y = (i * 97) % (this.canvas.height * 0.4);
            const twinkle = Math.sin(time * 2 + i) * 0.3 + 0.7;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 1 + Math.random(), 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            this.ctx.fill();
        }

        // Ground path
        this.ctx.fillStyle = 'rgba(139, 90, 43, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width * 0.35, this.canvas.height);
        this.ctx.lineTo(this.canvas.width * 0.65, this.canvas.height);
        this.ctx.lineTo(this.canvas.width * 0.55, 100);
        this.ctx.lineTo(this.canvas.width * 0.45, 100);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw willow trees
        this.willowTrees.forEach(tree => {
            this.drawWillowTree(tree, time);
        });

        // Draw fireflies
        this.forestParticles.forEach(particle => {
            particle.angle += 0.02;
            particle.x += Math.cos(particle.angle) * particle.speed;
            particle.y += Math.sin(particle.angle) * particle.speed * 0.5;
            particle.brightness = 0.3 + Math.sin(time * 3 + particle.x) * 0.7;

            // Wrap around
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 150, ${particle.brightness})`;
            this.ctx.fill();

            // Glow
            const glowGradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 4
            );
            glowGradient.addColorStop(0, `rgba(255, 255, 150, ${particle.brightness * 0.5})`);
            glowGradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glowGradient;
            this.ctx.fillRect(particle.x - 20, particle.y - 20, 40, 40);
        });

        // Draw portal
        this.drawPortal(time);

        // Instructions
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '18px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Walk through the forest to find the portal...', this.canvas.width / 2, this.canvas.height - 30);
    },

    drawWillowTree(tree, time) {
        const ctx = this.ctx;
        const sway = Math.sin(time + tree.swayOffset) * 5;

        // Trunk
        ctx.fillStyle = '#4a3728';
        ctx.beginPath();
        ctx.moveTo(tree.x - 15, tree.y);
        ctx.lineTo(tree.x + 15, tree.y);
        ctx.lineTo(tree.x + 10, tree.y - tree.height);
        ctx.lineTo(tree.x - 10, tree.y - tree.height);
        ctx.closePath();
        ctx.fill();

        // Branches with hanging strands
        tree.branches.forEach(branch => {
            const branchEndX = tree.x + Math.cos(branch.angle) * branch.length + sway;
            const branchEndY = tree.y - tree.height + Math.sin(branch.angle) * branch.length * 0.5;

            // Main branch
            ctx.strokeStyle = '#3a2718';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(tree.x, tree.y - tree.height);
            ctx.quadraticCurveTo(
                tree.x + Math.cos(branch.angle) * branch.length * 0.5,
                tree.y - tree.height + Math.sin(branch.angle) * branch.length * 0.3,
                branchEndX,
                branchEndY
            );
            ctx.stroke();

            // Hanging strands (leaves)
            branch.strands.forEach(strand => {
                const startX = tree.x + Math.cos(branch.angle) * branch.length * strand.startT + sway * strand.startT;
                const startY = tree.y - tree.height + Math.sin(branch.angle) * branch.length * strand.startT * 0.5;
                const strandSway = Math.sin(time * 1.5 + strand.sway) * 10;

                ctx.strokeStyle = 'rgba(34, 139, 34, 0.7)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(
                    startX + strandSway,
                    startY + strand.length * 0.5,
                    startX + strandSway * 0.5,
                    startY + strand.length
                );
                ctx.stroke();
            });
        });
    },

    drawPortal(time) {
        const ctx = this.ctx;
        const x = this.portalX;
        const y = this.portalY;

        this.portalAnimation += 0.05;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
        glowGradient.addColorStop(0, 'rgba(147, 112, 219, 0.8)');
        glowGradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.4)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - 80, y - 80, 160, 160);

        // Portal ring
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(x, y, 40, 55, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Swirling effect inside portal
        for (let i = 0; i < 5; i++) {
            const angle = this.portalAnimation + (i * Math.PI * 2 / 5);
            const radius = 20 + Math.sin(time * 3 + i) * 10;

            ctx.beginPath();
            ctx.arc(
                x + Math.cos(angle) * radius * 0.5,
                y + Math.sin(angle) * radius,
                5,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(200, 150, 255, ${0.5 + Math.sin(time * 2 + i) * 0.3})`;
            ctx.fill();
        }

        // Center sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.5 + Math.sin(time * 4) * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // "Enter" text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '14px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('Memory Portal', x, y + 80);
    },

    drawMaze(time) {
        const ctx = this.ctx;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a3e');
        gradient.addColorStop(0.5, '#2d1b4e');
        gradient.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.mazeGrid) return;

        const cellSize = this.cellSize;
        const offsetX = this.mazeOffsetX;
        const offsetY = this.mazeOffsetY;

        // Draw maze cells
        ctx.strokeStyle = '#ff6b9d';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        for (let r = 0; r < this.mazeRows; r++) {
            for (let c = 0; c < this.mazeCols; c++) {
                const cell = this.mazeGrid[r][c];
                const x = offsetX + c * cellSize;
                const y = offsetY + r * cellSize;

                // Draw walls
                ctx.beginPath();
                if (cell.walls.top) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + cellSize, y);
                }
                if (cell.walls.right) {
                    ctx.moveTo(x + cellSize, y);
                    ctx.lineTo(x + cellSize, y + cellSize);
                }
                if (cell.walls.bottom) {
                    ctx.moveTo(x, y + cellSize);
                    ctx.lineTo(x + cellSize, y + cellSize);
                }
                if (cell.walls.left) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + cellSize);
                }
                ctx.stroke();
            }
        }

        // Draw memories
        this.memories.forEach(memory => {
            if (memory.collected) {
                // Collected - show checkmark
                ctx.globalAlpha = 0.3;
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#90EE90';
                ctx.fillText('✓', memory.x, memory.y);
                ctx.globalAlpha = 1;
            } else {
                // Uncollected - glowing orb
                const pulse = 0.8 + 0.2 * Math.sin(time * 3 + memory.pulsePhase);

                const glowGradient = ctx.createRadialGradient(
                    memory.x, memory.y, 0,
                    memory.x, memory.y, 30 * pulse
                );
                glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
                glowGradient.addColorStop(0.5, 'rgba(255, 107, 157, 0.5)');
                glowGradient.addColorStop(1, 'transparent');

                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(memory.x, memory.y, 30 * pulse, 0, Math.PI * 2);
                ctx.fill();

                ctx.font = `${20 * pulse}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('💫', memory.x, memory.y);
            }
        });

        // Draw center marker for duet mode
        if (this.mode === 'duet') {
            const centerX = offsetX + Math.floor(this.mazeCols / 2) * cellSize + cellSize / 2;
            const centerY = offsetY + Math.floor(this.mazeRows / 2) * cellSize + cellSize / 2;

            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillText('💑', centerX, centerY - 30);
        }
    },

    drawPlayer(player) {
        const ctx = this.ctx;

        // Glow effect
        const glowGradient = ctx.createRadialGradient(
            player.x, player.y, 0,
            player.x, player.y, player.size * 1.5
        );
        glowGradient.addColorStop(0, player.color + '80');
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Player avatar
        ctx.font = `${player.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.avatar, player.x, player.y);
    },

    animate() {
        // Update players
        if (this.mode === 'solo') {
            this.updatePlayer(this.player, 'w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright');
        } else {
            this.updatePlayer(this.player, 'w', 's', 'a', 'd');
            if (this.player2) {
                this.updatePlayer(this.player2, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright');
            }
        }

        this.draw();

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    resetMaze() {
        if (confirm('Are you sure you want to reset the maze? All progress will be lost.')) {
            this.memories.forEach(m => m.collected = false);
            this.collectedMemories = [];
            this.gamePhase = 'forest';
            this.createForestScene();
            this.setupPlayers();

            document.getElementById('memory-counter').textContent =
                `Memories: 0/${MemoryData.length}`;
        }
    },

    completeActivity() {
        cancelAnimationFrame(this.animationFrame);
        AudioManager.playEffect('celebration');

        const isNew = GameState.completeActivity('maze');
        const container = document.getElementById('activity-content');

        container.innerHTML = `
            <div class="activity-complete">
                <h2>Every Path Led Me to You!</h2>
                <div class="puzzle-piece-animation">💕</div>
                <p class="pieces-earned">${isNew ? 'You earned 5 puzzle pieces!' : 'Activity completed!'}</p>
                <div style="margin: 30px 0;">
                    <p style="font-family: 'Dancing Script', cursive; font-size: 1.5rem; color: var(--warm-pink);">
                        ${this.collectedMemories.length} beautiful memories collected
                    </p>
                </div>
                <button class="action-btn" id="back-to-menu">Back to Menu</button>
            </div>
        `;

        document.getElementById('back-to-menu').addEventListener('click', () => {
            window.App.showLanding();
        });
    },

    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
        this.keys = {};
        this.memories = [];
        this.collectedMemories = [];
        this.trailParticles = [];
        this.forestParticles = [];
        this.willowTrees = [];
        this.mazeGrid = null;
    }
};
