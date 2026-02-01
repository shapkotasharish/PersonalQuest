// Turn-based Drawing Relay Activity
const DrawingActivity = {
    mode: null,
    isHost: false,
    pin: null,
    canvas: null,
    ctx: null,
    drawing: false,
    currentColor: '#000000',
    brushSize: 3,
    isEraser: false,
    myTurn: true,
    timer: 120,
    timerInterval: null,
    round: 1,
    maxRounds: 5,
    strokes: [],
    currentStroke: [],
    difficulty: 'easy',
    channel: null,
    partnerJoined: false,
    gameStarted: false,
    refCanvas: null,

    // Simple drawable reference images by difficulty
    // Easy: Simple outlines only - no color, no shading
    // Medium: Simple shapes with basic structure
    // Hard: More detail, some shading guides
    // Extreme: Complex with color/shading

    drawRefImages: {
        easy: [
            { name: 'Heart', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.3);
                ctx.bezierCurveTo(w*0.2, h*0.1, w*0.05, h*0.4, w/2, h*0.8);
                ctx.moveTo(w/2, h*0.3);
                ctx.bezierCurveTo(w*0.8, h*0.1, w*0.95, h*0.4, w/2, h*0.8);
                ctx.stroke();
            }},
            { name: 'Star', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                for(let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI / 5) - Math.PI/2;
                    const x = w/2 + Math.cos(angle) * w*0.35;
                    const y = h/2 + Math.sin(angle) * h*0.35;
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }},
            { name: 'House', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeRect(w*0.2, h*0.45, w*0.6, h*0.45);
                ctx.beginPath();
                ctx.moveTo(w*0.15, h*0.45);
                ctx.lineTo(w/2, h*0.15);
                ctx.lineTo(w*0.85, h*0.45);
                ctx.stroke();
                ctx.strokeRect(w*0.4, h*0.6, w*0.2, h*0.3);
            }},
            { name: 'Tree', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeRect(w*0.42, h*0.6, w*0.16, h*0.35);
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.1);
                ctx.lineTo(w*0.2, h*0.65);
                ctx.lineTo(w*0.8, h*0.65);
                ctx.closePath();
                ctx.stroke();
            }},
            { name: 'Sun', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(w/2, h/2, w*0.2, 0, Math.PI*2);
                ctx.stroke();
                for(let i = 0; i < 8; i++) {
                    const angle = i * Math.PI / 4;
                    ctx.beginPath();
                    ctx.moveTo(w/2 + Math.cos(angle)*w*0.25, h/2 + Math.sin(angle)*w*0.25);
                    ctx.lineTo(w/2 + Math.cos(angle)*w*0.4, h/2 + Math.sin(angle)*w*0.4);
                    ctx.stroke();
                }
            }},
            { name: 'Moon', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(w/2, h/2, w*0.3, 0, Math.PI*2);
                ctx.stroke();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(w*0.6, h*0.4, w*0.2, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
            }}
        ],
        medium: [
            { name: 'Flower', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Stem
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.5);
                ctx.quadraticCurveTo(w*0.45, h*0.7, w/2, h*0.9);
                ctx.stroke();
                // Petals
                for(let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    ctx.beginPath();
                    ctx.ellipse(w/2 + Math.cos(angle)*w*0.12, h*0.35 + Math.sin(angle)*w*0.12, w*0.1, w*0.06, angle, 0, Math.PI*2);
                    ctx.stroke();
                }
                // Center
                ctx.beginPath();
                ctx.arc(w/2, h*0.35, w*0.08, 0, Math.PI*2);
                ctx.stroke();
            }},
            { name: 'Bird', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Body
                ctx.beginPath();
                ctx.ellipse(w/2, h/2, w*0.2, w*0.12, 0, 0, Math.PI*2);
                ctx.stroke();
                // Head
                ctx.beginPath();
                ctx.arc(w*0.7, h*0.42, w*0.08, 0, Math.PI*2);
                ctx.stroke();
                // Beak
                ctx.beginPath();
                ctx.moveTo(w*0.78, h*0.42);
                ctx.lineTo(w*0.88, h*0.45);
                ctx.lineTo(w*0.78, h*0.48);
                ctx.stroke();
                // Wing
                ctx.beginPath();
                ctx.ellipse(w*0.45, h*0.48, w*0.1, w*0.06, -0.3, 0, Math.PI*2);
                ctx.stroke();
                // Tail
                ctx.beginPath();
                ctx.moveTo(w*0.3, h*0.5);
                ctx.lineTo(w*0.15, h*0.4);
                ctx.moveTo(w*0.3, h*0.5);
                ctx.lineTo(w*0.15, h*0.5);
                ctx.stroke();
            }},
            { name: 'Cat', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Body
                ctx.beginPath();
                ctx.ellipse(w/2, h*0.6, w*0.2, w*0.15, 0, 0, Math.PI*2);
                ctx.stroke();
                // Head
                ctx.beginPath();
                ctx.arc(w/2, h*0.32, w*0.12, 0, Math.PI*2);
                ctx.stroke();
                // Ears
                ctx.beginPath();
                ctx.moveTo(w*0.4, h*0.25);
                ctx.lineTo(w*0.35, h*0.12);
                ctx.lineTo(w*0.45, h*0.22);
                ctx.moveTo(w*0.6, h*0.25);
                ctx.lineTo(w*0.65, h*0.12);
                ctx.lineTo(w*0.55, h*0.22);
                ctx.stroke();
                // Eyes
                ctx.beginPath();
                ctx.arc(w*0.45, h*0.3, w*0.02, 0, Math.PI*2);
                ctx.arc(w*0.55, h*0.3, w*0.02, 0, Math.PI*2);
                ctx.stroke();
                // Tail
                ctx.beginPath();
                ctx.moveTo(w*0.7, h*0.6);
                ctx.quadraticCurveTo(w*0.9, h*0.5, w*0.85, h*0.35);
                ctx.stroke();
            }},
            { name: 'Butterfly', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Body
                ctx.beginPath();
                ctx.ellipse(w/2, h/2, w*0.02, h*0.2, 0, 0, Math.PI*2);
                ctx.stroke();
                // Wings
                ctx.beginPath();
                ctx.ellipse(w*0.35, h*0.4, w*0.15, h*0.12, -0.3, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(w*0.65, h*0.4, w*0.15, h*0.12, 0.3, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(w*0.38, h*0.6, w*0.1, h*0.08, 0.2, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(w*0.62, h*0.6, w*0.1, h*0.08, -0.2, 0, Math.PI*2);
                ctx.stroke();
                // Antennae
                ctx.beginPath();
                ctx.moveTo(w*0.48, h*0.3);
                ctx.quadraticCurveTo(w*0.4, h*0.2, w*0.38, h*0.15);
                ctx.moveTo(w*0.52, h*0.3);
                ctx.quadraticCurveTo(w*0.6, h*0.2, w*0.62, h*0.15);
                ctx.stroke();
            }}
        ],
        hard: [
            { name: 'Rose', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Stem
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.55);
                ctx.quadraticCurveTo(w*0.4, h*0.75, w/2, h*0.95);
                ctx.stroke();
                // Leaves
                ctx.beginPath();
                ctx.ellipse(w*0.35, h*0.75, w*0.08, w*0.04, -0.5, 0, Math.PI*2);
                ctx.stroke();
                // Petals (spiral)
                const cx = w/2, cy = h*0.35;
                for(let layer = 0; layer < 3; layer++) {
                    const r = w*(0.08 + layer*0.06);
                    for(let i = 0; i < 5; i++) {
                        const angle = (i/5)*Math.PI*2 + layer*0.3;
                        ctx.beginPath();
                        ctx.ellipse(cx + Math.cos(angle)*r*0.5, cy + Math.sin(angle)*r*0.5, r*0.4, r*0.25, angle, 0, Math.PI*2);
                        ctx.stroke();
                    }
                }
                // Add shading guides
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = '#888';
                ctx.beginPath();
                ctx.arc(cx - w*0.05, cy - h*0.02, w*0.12, Math.PI*0.8, Math.PI*1.5);
                ctx.stroke();
                ctx.setLineDash([]);
            }},
            { name: 'Landscape', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Mountains
                ctx.beginPath();
                ctx.moveTo(0, h*0.6);
                ctx.lineTo(w*0.3, h*0.25);
                ctx.lineTo(w*0.5, h*0.5);
                ctx.lineTo(w*0.7, h*0.2);
                ctx.lineTo(w, h*0.55);
                ctx.stroke();
                // Sun
                ctx.beginPath();
                ctx.arc(w*0.8, h*0.15, w*0.08, 0, Math.PI*2);
                ctx.stroke();
                // Trees
                for(let i = 0; i < 3; i++) {
                    const tx = w*(0.15 + i*0.3);
                    ctx.beginPath();
                    ctx.moveTo(tx, h*0.9);
                    ctx.lineTo(tx, h*0.7);
                    ctx.moveTo(tx, h*0.75);
                    ctx.lineTo(tx-w*0.05, h*0.55);
                    ctx.lineTo(tx+w*0.05, h*0.55);
                    ctx.closePath();
                    ctx.stroke();
                }
                // Shading guide
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = '#888';
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                ctx.moveTo(w*0.3, h*0.25);
                ctx.lineTo(w*0.4, h*0.45);
                ctx.lineTo(w*0.3, h*0.45);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.setLineDash([]);
            }}
        ],
        extreme: [
            { name: 'Portrait', draw: (ctx, w, h) => {
                // Face outline
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(w/2, h*0.45, w*0.25, h*0.32, 0, 0, Math.PI*2);
                ctx.stroke();
                // Hair
                ctx.beginPath();
                ctx.moveTo(w*0.25, h*0.35);
                ctx.quadraticCurveTo(w*0.2, h*0.15, w*0.35, h*0.12);
                ctx.quadraticCurveTo(w/2, h*0.08, w*0.65, h*0.12);
                ctx.quadraticCurveTo(w*0.8, h*0.15, w*0.75, h*0.35);
                ctx.stroke();
                // Eyes
                ctx.beginPath();
                ctx.ellipse(w*0.4, h*0.4, w*0.06, h*0.025, 0, 0, Math.PI*2);
                ctx.ellipse(w*0.6, h*0.4, w*0.06, h*0.025, 0, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(w*0.4, h*0.4, w*0.02, 0, Math.PI*2);
                ctx.arc(w*0.6, h*0.4, w*0.02, 0, Math.PI*2);
                ctx.fill();
                // Nose
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.4);
                ctx.lineTo(w*0.48, h*0.52);
                ctx.lineTo(w*0.52, h*0.52);
                ctx.stroke();
                // Mouth
                ctx.beginPath();
                ctx.moveTo(w*0.4, h*0.6);
                ctx.quadraticCurveTo(w/2, h*0.68, w*0.6, h*0.6);
                ctx.stroke();
                // Shading areas
                ctx.setLineDash([2, 2]);
                ctx.strokeStyle = '#aaa';
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                // Cheek shading
                ctx.beginPath();
                ctx.ellipse(w*0.32, h*0.5, w*0.05, h*0.04, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.ellipse(w*0.68, h*0.5, w*0.05, h*0.04, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
                ctx.setLineDash([]);
                // Color guide
                ctx.fillStyle = '#ffd700';
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.moveTo(w*0.25, h*0.35);
                ctx.quadraticCurveTo(w*0.2, h*0.15, w*0.35, h*0.12);
                ctx.quadraticCurveTo(w/2, h*0.08, w*0.65, h*0.12);
                ctx.quadraticCurveTo(w*0.8, h*0.15, w*0.75, h*0.35);
                ctx.fill();
                ctx.globalAlpha = 1;
            }}
        ]
    },

    init(container) {
        this.resetState();
        container.innerHTML = this.getModeSelectionHTML();
        this.attachModeListeners(container);
    },

    resetState() {
        this.mode = null;
        this.isHost = false;
        this.pin = null;
        this.drawing = false;
        this.currentColor = '#000000';
        this.brushSize = 3;
        this.isEraser = false;
        this.myTurn = true;
        this.timer = 120;
        this.round = 1;
        this.strokes = [];
        this.currentStroke = [];
        this.partnerJoined = false;
        this.gameStarted = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.channel) this.channel.close();
    },

    getModeSelectionHTML() {
        return `
            <div class="drawing-container">
                <div class="mode-selection">
                    <h2>Turn-based Drawing Relay</h2>
                    <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">
                        Take turns drawing together to create a masterpiece!
                    </p>
                    <div class="mode-buttons">
                        <button class="mode-btn" data-mode="digital">
                            <span class="icon">💻</span>
                            <span>Digital Multiplayer</span>
                            <span style="font-size: 0.8rem; opacity: 0.7;">Draw together (same device)</span>
                        </button>
                        <button class="mode-btn" data-mode="irl">
                            <span class="icon">📝</span>
                            <span>IRL Paper Mode</span>
                            <span style="font-size: 0.8rem; opacity: 0.7;">Draw on real paper</span>
                        </button>
                    </div>
                    <button class="reset-btn" id="reset-activity" style="margin-top: 30px;">Reset Activity</button>
                </div>
            </div>
        `;
    },

    attachModeListeners(container) {
        container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                AudioManager.playEffect('click');
                if (this.mode === 'digital') {
                    this.showDigitalOptions(container);
                } else {
                    this.showDifficultySelection(container);
                }
            });
        });

        const resetBtn = container.querySelector('#reset-activity');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset drawing activity progress?')) {
                    GameState.activities.drawing.completed = false;
                    GameState.save();
                    this.init(container);
                }
            });
        }
    },

    showDigitalOptions(container) {
        container.querySelector('.drawing-container').innerHTML = `
            <div class="mode-selection">
                <h2>Digital Multiplayer</h2>
                <p style="color: rgba(255,255,255,0.6); margin-bottom: 20px;">
                    Both players need to open this page in separate browser tabs
                </p>
                <div class="mode-buttons">
                    <button class="mode-btn" id="host-btn">
                        <span class="icon">🏠</span>
                        <span>Host Game</span>
                        <span style="font-size: 0.8rem; opacity: 0.7;">Create a room</span>
                    </button>
                    <button class="mode-btn" id="join-btn">
                        <span class="icon">🔗</span>
                        <span>Join Game</span>
                        <span style="font-size: 0.8rem; opacity: 0.7;">Enter a PIN</span>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('host-btn').addEventListener('click', () => this.hostGame(container));
        document.getElementById('join-btn').addEventListener('click', () => this.showJoinForm(container));
    },

    hostGame(container) {
        this.isHost = true;
        this.pin = Math.floor(1000 + Math.random() * 9000).toString();

        // Set up BroadcastChannel for communication
        this.channel = new BroadcastChannel('drawing-game-' + this.pin);

        container.querySelector('.drawing-container').innerHTML = `
            <div class="pin-display">
                <h3>Share this PIN with your partner:</h3>
                <div class="pin-code">${this.pin}</div>
                <p class="waiting-text" id="status-text">Waiting for partner to join...</p>
                <button class="action-btn" id="start-game-btn" style="margin-top: 20px; display: none;">
                    Start Game
                </button>
            </div>
        `;

        this.channel.onmessage = (event) => {
            if (event.data.type === 'join') {
                this.partnerJoined = true;
                document.getElementById('status-text').textContent = 'Partner joined! Ready to start.';
                document.getElementById('status-text').style.color = '#64ff64';
                document.getElementById('start-game-btn').style.display = 'block';
                AudioManager.playEffect('success');
            } else if (event.data.type === 'stroke') {
                this.receiveStroke(event.data.stroke);
            }
        };

        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.channel.postMessage({ type: 'start' });
            this.showDifficultySelection(container);
        });
    },

    showJoinForm(container) {
        container.querySelector('.drawing-container').innerHTML = `
            <div class="pin-input-container">
                <h3 style="color: var(--warm-pink);">Enter PIN to join:</h3>
                <input type="text" class="pin-input" id="pin-input" maxlength="4" placeholder="0000">
                <button class="action-btn" id="join-room-btn">Join Room</button>
                <p id="join-status" style="margin-top: 15px; color: rgba(255,255,255,0.6);"></p>
            </div>
        `;

        const input = document.getElementById('pin-input');
        input.focus();

        document.getElementById('join-room-btn').addEventListener('click', () => {
            const pin = input.value;
            if (pin.length === 4) {
                this.pin = pin;
                this.isHost = false;

                // Connect to channel
                this.channel = new BroadcastChannel('drawing-game-' + this.pin);

                // Notify host
                this.channel.postMessage({ type: 'join' });

                document.getElementById('join-status').textContent = 'Waiting for host to start the game...';
                document.getElementById('join-status').style.color = '#ffd700';

                this.channel.onmessage = (event) => {
                    if (event.data.type === 'start') {
                        AudioManager.playEffect('success');
                        this.myTurn = false; // Guest goes second
                        this.showDifficultySelection(container);
                    } else if (event.data.type === 'difficulty') {
                        this.difficulty = event.data.difficulty;
                        this.startDrawing(container);
                    } else if (event.data.type === 'stroke') {
                        this.receiveStroke(event.data.stroke);
                    }
                };

                AudioManager.playEffect('click');
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('join-room-btn').click();
            }
        });
    },

    showDifficultySelection(container) {
        const drawingContainer = container.querySelector('.drawing-container') || container;

        // Only host selects difficulty
        if (!this.isHost && this.channel) {
            drawingContainer.innerHTML = `
                <div class="difficulty-selection">
                    <h3>Waiting for host to select difficulty...</h3>
                </div>
            `;
            return;
        }

        drawingContainer.innerHTML = `
            <div class="difficulty-selection">
                <h3>Choose Difficulty</h3>
                <p style="color: rgba(255,255,255,0.6); margin-bottom: 20px;">
                    Easy: Simple outlines only<br>
                    Medium: Basic shapes with structure<br>
                    Hard: More detail with shading guides<br>
                    Extreme: Complex with color guidance
                </p>
                <div class="difficulty-buttons">
                    <button class="diff-btn" data-diff="easy">Easy</button>
                    <button class="diff-btn" data-diff="medium">Medium</button>
                    <button class="diff-btn" data-diff="hard">Hard</button>
                    <button class="diff-btn" data-diff="extreme">Extreme</button>
                </div>
            </div>
        `;

        drawingContainer.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                AudioManager.playEffect('click');

                // Notify partner of difficulty
                if (this.channel) {
                    this.channel.postMessage({ type: 'difficulty', difficulty: this.difficulty });
                }

                this.startDrawing(container);
            });
        });
    },

    startDrawing(container) {
        if (this.mode === 'irl') {
            this.startIRLMode(container);
        } else {
            this.startDigitalMode(container);
        }
    },

    generateRefImage() {
        // Create canvas with reference drawing
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 300, 300);

        const images = this.drawRefImages[this.difficulty];
        const selected = images[Math.floor(Math.random() * images.length)];

        selected.draw(ctx, 300, 300);

        return { canvas, name: selected.name };
    },

    startIRLMode(container) {
        const ref = this.generateRefImage();

        container.innerHTML = `
            <div class="drawing-container">
                <div class="drawing-interface">
                    <h3 style="color: var(--warm-pink); margin-bottom: 10px;">
                        Draw: ${ref.name}
                    </h3>
                    <p style="color: rgba(255,255,255,0.6); margin-bottom: 15px;">
                        Draw this on paper! Take turns every 2 minutes.
                    </p>
                    <div class="timer-display" id="timer">2:00</div>
                    <div class="turn-indicator" id="turn-indicator">Your turn to draw!</div>
                    <div class="canvas-panel" style="margin: 20px 0;">
                        <h4>Reference Image</h4>
                        <div id="ref-container" style="border: 3px solid var(--primary-pink); border-radius: 15px; overflow: hidden; display: inline-block;"></div>
                    </div>
                    <button class="action-btn" id="finish-btn">Finish Drawing</button>
                </div>
            </div>
        `;

        document.getElementById('ref-container').appendChild(ref.canvas);
        ref.canvas.style.display = 'block';

        this.startTimer();

        document.getElementById('finish-btn').addEventListener('click', () => {
            this.completeActivity(container);
        });
    },

    startDigitalMode(container) {
        const ref = this.generateRefImage();
        const showColorTools = this.difficulty === 'hard' || this.difficulty === 'extreme';

        container.innerHTML = `
            <div class="drawing-container">
                <div class="drawing-interface">
                    <h3 style="color: var(--warm-pink); margin-bottom: 5px;">Draw: ${ref.name}</h3>
                    <div class="timer-display" id="timer">2:00</div>
                    <div class="turn-indicator" id="turn-indicator">${this.myTurn ? "Your turn to draw!" : "Partner's turn..."}</div>
                    <div class="canvas-container">
                        <div class="canvas-panel">
                            <h4>Reference</h4>
                            <div id="ref-container" style="border: 3px solid var(--primary-pink); border-radius: 15px; overflow: hidden;"></div>
                        </div>
                        <div class="canvas-panel">
                            <h4>Your Canvas</h4>
                            <canvas id="drawing-canvas" class="drawing-canvas ${!this.myTurn ? 'locked' : ''}" width="300" height="300"></canvas>
                        </div>
                    </div>
                    <div class="tools-panel">
                        ${showColorTools ? '<input type="color" class="color-picker" id="color-picker" value="#000000">' : ''}
                        <input type="range" class="brush-size" id="brush-size" min="1" max="${showColorTools ? 20 : 10}" value="3">
                        <button class="tool-btn" id="eraser-btn">Eraser</button>
                        <button class="tool-btn" id="undo-btn">Undo</button>
                        <button class="action-btn" id="finish-btn">Finish</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ref-container').appendChild(ref.canvas);
        ref.canvas.style.display = 'block';

        this.setupCanvas(showColorTools);
        this.startTimer();
    },

    setupCanvas(showColorTools) {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startStroke(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.endStroke());
        this.canvas.addEventListener('mouseleave', () => this.endStroke());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startStroke(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.endStroke());

        // Tool controls
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.currentColor = e.target.value;
                this.isEraser = false;
                document.getElementById('eraser-btn').classList.remove('active');
            });
        }

        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
        });

        document.getElementById('eraser-btn').addEventListener('click', (e) => {
            this.isEraser = !this.isEraser;
            e.target.classList.toggle('active');
        });

        document.getElementById('undo-btn').addEventListener('click', () => this.undo());

        document.getElementById('finish-btn').addEventListener('click', () => {
            this.completeActivity(document.getElementById('activity-content'));
        });
    },

    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    },

    startStroke(e) {
        if (!this.myTurn) return;
        this.drawing = true;
        const coords = this.getCanvasCoords(e);
        this.currentStroke = [coords];

        this.ctx.beginPath();
        this.ctx.moveTo(coords.x, coords.y);
    },

    draw(e) {
        if (!this.drawing || !this.myTurn) return;

        const coords = this.getCanvasCoords(e);
        this.currentStroke.push(coords);

        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.strokeStyle = this.isEraser ? 'white' : this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    },

    endStroke() {
        if (this.drawing && this.currentStroke.length > 0) {
            const stroke = {
                points: [...this.currentStroke],
                color: this.isEraser ? 'white' : this.currentColor,
                size: this.brushSize
            };
            this.strokes.push(stroke);

            // Send to partner
            if (this.channel) {
                this.channel.postMessage({ type: 'stroke', stroke });
            }
        }
        this.drawing = false;
        this.currentStroke = [];
    },

    receiveStroke(stroke) {
        this.strokes.push(stroke);
        this.redrawCanvas();
    },

    undo() {
        if (this.strokes.length === 0) return;
        this.strokes.pop();
        this.redrawCanvas();
        AudioManager.playEffect('click');
    },

    redrawCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;

            this.ctx.beginPath();
            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            for (let i = 1; i < stroke.points.length; i++) {
                this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }

            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
        });
    },

    startTimer() {
        this.timer = 120;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();

            if (this.timer <= 0) {
                this.switchTurn();
            }
        }, 1000);
    },

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const display = document.getElementById('timer');
        if (display) {
            display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (this.timer <= 10) {
                display.style.color = '#ff4444';
            } else if (this.timer <= 30) {
                display.style.color = '#ffaa00';
            } else {
                display.style.color = 'var(--primary-gold)';
            }
        }
    },

    switchTurn() {
        AudioManager.playEffect('switch');
        this.myTurn = !this.myTurn;
        this.round++;

        const indicator = document.getElementById('turn-indicator');
        if (indicator) {
            indicator.textContent = this.myTurn ? "Your turn to draw!" : "Partner's turn...";
            indicator.style.background = this.myTurn ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 215, 0, 0.2)';
        }

        if (this.canvas) {
            this.canvas.classList.toggle('locked', !this.myTurn);
        }

        this.timer = 120;

        if (this.round > this.maxRounds * 2) {
            this.completeActivity(document.getElementById('activity-content'));
        }
    },

    completeActivity(container) {
        clearInterval(this.timerInterval);
        if (this.channel) this.channel.close();
        AudioManager.playEffect('celebration');

        const isNew = GameState.completeActivity('drawing');

        container.innerHTML = `
            <div class="activity-complete">
                <h2>Beautiful Creation!</h2>
                <div class="puzzle-piece-animation">🧩</div>
                <p class="pieces-earned">${isNew ? 'You earned 5 puzzle pieces!' : 'Activity completed!'}</p>
                <p style="color: rgba(255,255,255,0.7); margin: 20px 0;">
                    Drawing together creates the most beautiful art!
                </p>
                <button class="action-btn" id="back-to-menu">Back to Menu</button>
            </div>
        `;

        document.getElementById('back-to-menu').addEventListener('click', () => {
            window.App.showLanding();
        });
    },

    cleanup() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.channel) this.channel.close();
        this.strokes = [];
        this.round = 1;
        this.myTurn = true;
    }
};
