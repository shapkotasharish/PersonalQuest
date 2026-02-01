// Memory Lane Maze Activity
const MazeActivity = {
    canvas: null,
    ctx: null,
    player: null,
    player2: null,
    mode: 'solo',
    mazeData: null,
    memories: [],
    collectedMemories: [],
    keys: {},
    avatarOptions: {
        type: '❤️',
        color: '#ff6b9d',
        trail: 'sparkles'
    },
    trailParticles: [],
    animationFrame: null,

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
            this.startMaze();
        });

        document.getElementById('duet-btn').addEventListener('click', () => {
            this.mode = 'duet';
            this.startMaze();
        });
    },

    startMaze() {
        const container = document.getElementById('activity-content');

        container.innerHTML = `
            <div class="maze-container">
                <canvas id="maze-canvas"></canvas>
                <div class="maze-controls">
                    ${this.mode === 'solo' ?
                        'Use Arrow Keys or WASD to move' :
                        'Player 1: WASD | Player 2: IJKL'}
                </div>
                <div class="memory-counter" id="memory-counter">
                    Memories: 0/${MemoryData.length}
                </div>
            </div>
        `;

        this.showInstructions(() => {
            this.setupCanvas();
            this.generateMaze();
            this.setupPlayers();
            this.setupMemories();
            this.attachControls();
            this.animate();
        });
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
            • ${this.mode === 'solo' ? 'Use Arrow Keys or WASD to move' : 'Player 1: WASD, Player 2: IJKL'}<br>
            • Find glowing orbs to reveal memories<br>
            • Collect all memories to complete the maze<br><br>
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
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    },

    generateMaze() {
        // Create a simple maze structure
        const cols = 15;
        const rows = 10;
        const cellWidth = this.canvas.width / cols;
        const cellHeight = this.canvas.height / rows;

        this.mazeData = {
            cols, rows, cellWidth, cellHeight,
            walls: []
        };

        // Generate some walls (not too many to keep it navigable)
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);

            // Don't place walls at start or end positions
            if ((x < 2 && y < 2) || (x > cols - 3 && y > rows - 3)) continue;

            this.mazeData.walls.push({ x, y });
        }
    },

    setupPlayers() {
        const { cellWidth, cellHeight } = this.mazeData;

        this.player = {
            x: cellWidth * 1.5,
            y: cellHeight * 1.5,
            size: 30,
            speed: 5,
            avatar: this.avatarOptions.type,
            color: this.avatarOptions.color,
            trail: this.avatarOptions.trail
        };

        if (this.mode === 'duet') {
            this.player2 = {
                x: cellWidth * 2.5,
                y: cellHeight * 1.5,
                size: 30,
                speed: 5,
                avatar: '💖',
                color: '#ffd700',
                trail: 'stars'
            };
        }
    },

    setupMemories() {
        this.memories = [];
        this.collectedMemories = [];

        const { cols, rows, cellWidth, cellHeight } = this.mazeData;

        // Place memories at specific positions throughout the maze
        MemoryData.forEach((memory, index) => {
            // Spread memories across the maze
            const col = 2 + Math.floor((index / MemoryData.length) * (cols - 4));
            const row = 1 + Math.floor(Math.random() * (rows - 2));

            this.memories.push({
                ...memory,
                x: col * cellWidth + cellWidth / 2,
                y: row * cellHeight + cellHeight / 2,
                collected: false,
                pulsePhase: Math.random() * Math.PI * 2
            });
        });

        // Make the last memory (❤️) be near the end
        const lastMemory = this.memories[this.memories.length - 1];
        lastMemory.x = (cols - 2) * cellWidth + cellWidth / 2;
        lastMemory.y = (rows - 2) * cellHeight + cellHeight / 2;
    },

    attachControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    },

    updatePlayer(player, up, down, left, right) {
        let dx = 0, dy = 0;

        if (this.keys[up] || this.keys['arrowup']) dy = -player.speed;
        if (this.keys[down] || this.keys['arrowdown']) dy = player.speed;
        if (this.keys[left] || this.keys['arrowleft']) dx = -player.speed;
        if (this.keys[right] || this.keys['arrowright']) dx = player.speed;

        // Simple collision with canvas bounds
        player.x = Math.max(player.size, Math.min(this.canvas.width - player.size, player.x + dx));
        player.y = Math.max(player.size, Math.min(this.canvas.height - player.size, player.y + dy));

        // Add trail particles
        if (dx !== 0 || dy !== 0) {
            this.addTrailParticle(player);
        }

        // Check memory collection
        this.checkMemoryCollection(player);
    },

    addTrailParticle(player) {
        if (Math.random() > 0.3) return;

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

        // Limit particles
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

            if (dist < 40) {
                this.collectMemory(index);
            }
        });
    },

    collectMemory(index) {
        const memory = this.memories[index];
        memory.collected = true;
        this.collectedMemories.push(memory);

        AudioManager.playEffect('success');

        // Update counter
        document.getElementById('memory-counter').textContent =
            `Memories: ${this.collectedMemories.length}/${MemoryData.length}`;

        // Show memory popup
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

            // Check if all memories collected
            if (this.collectedMemories.length === MemoryData.length) {
                setTimeout(() => this.completeActivity(), 500);
            }
        };

        closeBtn.addEventListener('click', handleClose);
    },

    draw() {
        const time = performance.now() / 1000;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background gradient (garden-like)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a2a1a');
        gradient.addColorStop(0.5, '#2d3d2d');
        gradient.addColorStop(1, '#1a2a1a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw decorative paths
        this.ctx.strokeStyle = 'rgba(139, 90, 43, 0.3)';
        this.ctx.lineWidth = 40;
        this.ctx.lineCap = 'round';

        // Winding path
        this.ctx.beginPath();
        this.ctx.moveTo(100, this.canvas.height / 2);
        for (let x = 100; x < this.canvas.width - 100; x += 100) {
            this.ctx.lineTo(x, this.canvas.height / 2 + Math.sin(x * 0.01) * 100);
        }
        this.ctx.stroke();

        // Draw some decorative elements
        for (let i = 0; i < 20; i++) {
            const x = (i * 137) % this.canvas.width;
            const y = (i * 97) % this.canvas.height;

            this.ctx.font = '20px Arial';
            this.ctx.fillText(['🌿', '🌺', '🌻', '🌳'][i % 4], x, y);
        }

        // Draw trail particles
        this.trailParticles.forEach((particle, i) => {
            particle.alpha -= 0.02;

            if (particle.alpha > 0) {
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.font = `${particle.size * 20}px Arial`;
                this.ctx.fillText(particle.emoji, particle.x, particle.y);
            }
        });
        this.ctx.globalAlpha = 1;

        // Remove faded particles
        this.trailParticles = this.trailParticles.filter(p => p.alpha > 0);

        // Draw memories (uncollected)
        this.memories.forEach(memory => {
            if (memory.collected) return;

            const pulse = 0.8 + 0.2 * Math.sin(time * 3 + memory.pulsePhase);

            // Glow effect
            const glowGradient = this.ctx.createRadialGradient(
                memory.x, memory.y, 0,
                memory.x, memory.y, 40 * pulse
            );
            glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            glowGradient.addColorStop(0.5, 'rgba(255, 107, 157, 0.4)');
            glowGradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(memory.x, memory.y, 40 * pulse, 0, Math.PI * 2);
            this.ctx.fill();

            // Memory orb
            this.ctx.font = `${25 * pulse}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💫', memory.x, memory.y);
        });

        // Draw collected memories as faded
        this.memories.forEach(memory => {
            if (!memory.collected) return;

            this.ctx.globalAlpha = 0.3;
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('✓', memory.x, memory.y);
            this.ctx.globalAlpha = 1;
        });

        // Draw players
        this.drawPlayer(this.player);
        if (this.player2) {
            this.drawPlayer(this.player2);
        }
    },

    drawPlayer(player) {
        // Glow effect
        const glowGradient = this.ctx.createRadialGradient(
            player.x, player.y, 0,
            player.x, player.y, player.size * 1.5
        );
        glowGradient.addColorStop(0, player.color + '80');
        glowGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Player avatar
        this.ctx.font = `${player.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(player.avatar, player.x, player.y);
    },

    animate() {
        // Update players
        if (this.mode === 'solo') {
            this.updatePlayer(this.player, 'w', 's', 'a', 'd');
        } else {
            this.updatePlayer(this.player, 'w', 's', 'a', 'd');
            if (this.player2) {
                this.updatePlayer(this.player2, 'i', 'k', 'j', 'l');
            }
        }

        this.draw();

        this.animationFrame = requestAnimationFrame(() => this.animate());
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
        this.keys = {};
        this.memories = [];
        this.collectedMemories = [];
        this.trailParticles = [];
    }
};
