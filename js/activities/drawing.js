// Turn-based Drawing Relay Activity
const DrawingActivity = {
    mode: null, // 'digital' or 'irl'
    isHost: false,
    pin: null,
    canvas: null,
    ctx: null,
    refCanvas: null,
    refCtx: null,
    drawing: false,
    currentColor: '#ff6b9d',
    brushSize: 5,
    isEraser: false,
    myTurn: true,
    timer: 120,
    timerInterval: null,
    round: 1,
    maxRounds: 5,
    strokes: [],
    currentStroke: [],
    difficulty: 'easy',
    peer: null,
    conn: null,

    // Reference images by difficulty
    refImages: {
        easy: [
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400', // Simple landscape
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', // Simple moon
        ],
        medium: [
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400', // Mountain
            'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400', // Nature
        ],
        hard: [
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', // Detailed landscape
        ],
        extreme: [
            'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400', // Complex scene
        ]
    },

    init(container) {
        container.innerHTML = this.getModeSelectionHTML();
        this.attachModeListeners(container);
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
                            <span style="font-size: 0.8rem; opacity: 0.7;">Draw together online</span>
                        </button>
                        <button class="mode-btn" data-mode="irl">
                            <span class="icon">📝</span>
                            <span>IRL Paper Mode</span>
                            <span style="font-size: 0.8rem; opacity: 0.7;">Draw on real paper</span>
                        </button>
                    </div>
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
    },

    showDigitalOptions(container) {
        container.querySelector('.drawing-container').innerHTML = `
            <div class="mode-selection">
                <h2>Digital Multiplayer</h2>
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

        container.querySelector('.drawing-container').innerHTML = `
            <div class="pin-display">
                <h3>Share this PIN with your partner:</h3>
                <div class="pin-code">${this.pin}</div>
                <p class="waiting-text">Waiting for partner to join...</p>
                <p style="margin-top: 20px; color: rgba(255,255,255,0.5); font-size: 0.9rem;">
                    For this demo, both players can proceed independently.<br>
                    Click below when ready!
                </p>
                <button class="action-btn" id="proceed-btn" style="margin-top: 20px;">
                    Proceed to Drawing
                </button>
            </div>
        `;

        document.getElementById('proceed-btn').addEventListener('click', () => {
            this.showDifficultySelection(container);
        });
    },

    showJoinForm(container) {
        container.querySelector('.drawing-container').innerHTML = `
            <div class="pin-input-container">
                <h3 style="color: var(--warm-pink);">Enter PIN to join:</h3>
                <input type="text" class="pin-input" id="pin-input" maxlength="4" placeholder="0000">
                <button class="action-btn" id="join-room-btn">Join Room</button>
            </div>
        `;

        const input = document.getElementById('pin-input');
        input.focus();

        document.getElementById('join-room-btn').addEventListener('click', () => {
            const pin = input.value;
            if (pin.length === 4) {
                this.pin = pin;
                AudioManager.playEffect('success');
                this.showDifficultySelection(container);
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

        drawingContainer.innerHTML = `
            <div class="difficulty-selection">
                <h3>Choose Difficulty</h3>
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

    startIRLMode(container) {
        const images = this.refImages[this.difficulty];
        const refImage = images[Math.floor(Math.random() * images.length)];

        container.innerHTML = `
            <div class="drawing-container">
                <div class="drawing-interface">
                    <h3 style="color: var(--warm-pink); margin-bottom: 20px;">
                        Draw this on paper! Take turns every 2 minutes.
                    </h3>
                    <div class="timer-display" id="timer">2:00</div>
                    <div class="turn-indicator" id="turn-indicator">Your turn to draw!</div>
                    <div class="canvas-panel" style="margin: 20px 0;">
                        <h4>Reference Image</h4>
                        <img src="${refImage}" alt="Reference"
                             style="max-width: 500px; max-height: 400px; border-radius: 15px; border: 3px solid var(--primary-pink);">
                    </div>
                    <button class="action-btn" id="finish-btn">Finish Drawing</button>
                </div>
            </div>
        `;

        this.startTimer();

        document.getElementById('finish-btn').addEventListener('click', () => {
            this.completeActivity(container);
        });
    },

    startDigitalMode(container) {
        const images = this.refImages[this.difficulty];
        const refImage = images[Math.floor(Math.random() * images.length)];

        container.innerHTML = `
            <div class="drawing-container">
                <div class="drawing-interface">
                    <div class="timer-display" id="timer">2:00</div>
                    <div class="turn-indicator" id="turn-indicator">Your turn to draw!</div>
                    <div class="canvas-container">
                        <div class="canvas-panel">
                            <h4>Reference Image</h4>
                            <img src="${refImage}" alt="Reference" id="ref-image"
                                 style="width: 400px; height: 400px; object-fit: cover; border-radius: 15px; border: 3px solid var(--primary-pink);">
                        </div>
                        <div class="canvas-panel">
                            <h4>Your Canvas</h4>
                            <canvas id="drawing-canvas" class="drawing-canvas" width="400" height="400"></canvas>
                        </div>
                    </div>
                    <div class="tools-panel">
                        <input type="color" class="color-picker" id="color-picker" value="#ff6b9d">
                        <input type="range" class="brush-size" id="brush-size" min="1" max="30" value="5">
                        <button class="tool-btn" id="eraser-btn">Eraser</button>
                        <button class="tool-btn" id="undo-btn">Undo</button>
                        <button class="action-btn" id="finish-btn">Finish</button>
                    </div>
                </div>
            </div>
        `;

        this.setupCanvas();
        this.startTimer();
    },

    setupCanvas() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Fill with white background
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
        document.getElementById('color-picker').addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.isEraser = false;
            document.getElementById('eraser-btn').classList.remove('active');
        });

        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = e.target.value;
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
            this.strokes.push({
                points: [...this.currentStroke],
                color: this.isEraser ? 'white' : this.currentColor,
                size: this.brushSize
            });
        }
        this.drawing = false;
        this.currentStroke = [];
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

            // Warning colors
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
            indicator.textContent = this.myTurn ? "Your turn to draw!" : "Partner's turn! Watch the magic...";
            indicator.style.background = this.myTurn ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 215, 0, 0.2)';
        }

        if (this.canvas) {
            this.canvas.classList.toggle('locked', !this.myTurn);
        }

        // Reset timer
        this.timer = 120;

        // Check if game should end
        if (this.round > this.maxRounds * 2) {
            this.completeActivity(document.getElementById('activity-content'));
        }
    },

    completeActivity(container) {
        clearInterval(this.timerInterval);
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
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.strokes = [];
        this.round = 1;
        this.myTurn = true;
    }
};
