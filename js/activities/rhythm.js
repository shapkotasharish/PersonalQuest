// Rhythm of Us Activity - Guitar Hero style gameplay
const RhythmActivity = {
    canvas: null,
    ctx: null,
    selectedSong: null,
    mode: 'solo', // 'solo' or 'duet'
    gameMode: 'bpm', // 'bpm' or 'freestyle'
    audio: null,
    playing: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectHits: 0,
    goodHits: 0,
    okayHits: 0,
    misses: 0,
    notes: [],
    spawnedNotes: [],
    freestyleNotes: [], // Notes created by player in freestyle mode
    animationFrame: null,
    startTime: 0,
    gameTime: 0,
    keyStates: { a: false, l: false },
    keyFlash: { a: 0, l: 0 },

    // Lane positions
    laneA: 0,
    laneL: 0,

    // Hit zone
    hitZoneY: 0,

    // Note speed (pixels per second)
    noteSpeed: 400,

    // Timing windows (ms)
    timings: {
        perfect: 80,
        good: 150,
        okay: 250
    },

    init(container) {
        this.selectedSong = null;
        this.mode = 'solo';
        this.gameMode = 'bpm';

        container.innerHTML = `
            <div class="rhythm-container">
                <div class="song-selection" id="song-selection">
                    <h2>Choose Your Song</h2>
                    <div class="song-list" id="song-list"></div>

                    <div class="mode-selection" style="margin-top: 30px;">
                        <h3 style="margin-bottom: 15px; color: var(--warm-pink);">Game Mode</h3>
                        <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                            <button class="mode-btn selected" id="bpm-mode-btn">
                                <span style="font-size: 1.5rem;">🎵</span><br>
                                BPM Mode<br>
                                <span style="font-size: 0.8rem; opacity: 0.7;">Hit notes to the beat</span>
                            </button>
                            <button class="mode-btn" id="freestyle-mode-btn">
                                <span style="font-size: 1.5rem;">✨</span><br>
                                Freestyle Mode<br>
                                <span style="font-size: 0.8rem; opacity: 0.7;">Create your own rhythm</span>
                            </button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 20px; justify-content: center;">
                        <button class="action-btn" id="solo-btn" disabled>Solo Mode (A key)</button>
                        <button class="action-btn" id="duet-btn" disabled>Duet Mode (A + L keys)</button>
                    </div>
                </div>
            </div>
        `;

        this.populateSongList();
        this.attachSongListeners();
    },

    populateSongList() {
        const container = document.getElementById('song-list');

        SongData.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.dataset.index = index;

            card.innerHTML = `
                <div class="song-info">
                    <h3>${song.title}</h3>
                    <span class="artist">${song.artist}</span>
                    <p style="color: var(--warm-pink); font-size: 0.9rem; margin-top: 5px;">
                        "${song.memory}"
                    </p>
                </div>
                <button class="preview-btn" data-index="${index}">Preview</button>
            `;

            container.appendChild(card);
        });
    },

    attachSongListeners() {
        // Song card selection
        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('preview-btn')) return;

                document.querySelectorAll('.song-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                this.selectedSong = SongData[card.dataset.index];
                document.getElementById('solo-btn').disabled = false;
                document.getElementById('duet-btn').disabled = false;

                AudioManager.playEffect('click');
            });
        });

        // Preview buttons
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const song = SongData[btn.dataset.index];

                // Stop any current preview
                document.querySelectorAll('.preview-btn').forEach(b => b.textContent = 'Preview');

                if (this.audio) {
                    AudioManager.stop();
                    this.audio = null;
                    return;
                }

                btn.textContent = 'Stop';
                this.audio = await AudioManager.play(song.file);

                if (this.audio) {
                    setTimeout(() => {
                        AudioManager.stop();
                        btn.textContent = 'Preview';
                        this.audio = null;
                    }, 15000);
                }
            });
        });

        // Game mode buttons (BPM vs Freestyle)
        document.getElementById('bpm-mode-btn').addEventListener('click', () => {
            this.gameMode = 'bpm';
            document.getElementById('bpm-mode-btn').classList.add('selected');
            document.getElementById('freestyle-mode-btn').classList.remove('selected');
            AudioManager.playEffect('click');
        });

        document.getElementById('freestyle-mode-btn').addEventListener('click', () => {
            this.gameMode = 'freestyle';
            document.getElementById('freestyle-mode-btn').classList.add('selected');
            document.getElementById('bpm-mode-btn').classList.remove('selected');
            AudioManager.playEffect('click');
        });

        // Mode buttons (Solo vs Duet)
        document.getElementById('solo-btn').addEventListener('click', () => {
            if (!this.selectedSong) return;
            this.mode = 'solo';
            AudioManager.stop();
            this.startGame();
        });

        document.getElementById('duet-btn').addEventListener('click', () => {
            if (!this.selectedSong) return;
            this.mode = 'duet';
            AudioManager.stop();
            this.startGame();
        });
    },

    startGame() {
        const container = document.getElementById('activity-content');

        container.innerHTML = `
            <div class="rhythm-container">
                <div class="rhythm-game" id="rhythm-game">
                    <div class="rhythm-header">
                        <div class="score-display">Score: <span id="score">0</span></div>
                        <div class="combo-display">Combo: <span id="combo">x0</span></div>
                    </div>
                    <canvas id="rhythm-canvas"></canvas>
                    <div id="hit-feedback-container"></div>
                </div>
                <button class="reset-btn rhythm-reset" id="rhythm-reset-btn">Restart Song</button>
            </div>
        `;

        document.getElementById('rhythm-reset-btn').addEventListener('click', () => this.restartSong());

        this.showInstructions(() => {
            this.setupCanvas();
            if (this.gameMode === 'bpm') {
                this.generateNotes();
            } else {
                this.freestyleNotes = [];
            }
            this.attachControls();
            this.startPlaying();
        });
    },

    showInstructions(callback) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const text = document.getElementById('modal-text');
        const closeBtn = document.getElementById('modal-close');

        title.textContent = 'Rhythm of Us';

        let instructions = '';
        if (this.gameMode === 'bpm') {
            if (this.mode === 'solo') {
                instructions = `
                    Feel the rhythm of our song!<br><br>
                    <strong>How to play:</strong><br>
                    • Press <strong>A</strong> when notes reach the target zone<br>
                    • All notes come down a single lane<br><br>
                    • <span style="color: #ffd700;">Perfect</span> = 300 pts<br>
                    • <span style="color: #ff6b9d;">Good</span> = 200 pts<br>
                    • <span style="color: #aaa;">Okay</span> = 100 pts<br><br>
                    🎵 Let's feel the beat together!
                `;
            } else {
                instructions = `
                    Feel the rhythm together!<br><br>
                    <strong>How to play:</strong><br>
                    • Player 1: Press <strong>A</strong> for pink notes<br>
                    • Player 2: Press <strong>L</strong> for gold notes<br>
                    • Different patterns combine to make the full rhythm!<br><br>
                    • <span style="color: #ffd700;">Perfect</span> = 300 pts<br>
                    • <span style="color: #ff6b9d;">Good</span> = 200 pts<br>
                    • <span style="color: #aaa;">Okay</span> = 100 pts<br><br>
                    🎵 Let's make music together!
                `;
            }
        } else {
            // Freestyle mode
            if (this.mode === 'solo') {
                instructions = `
                    Express yourself with music!<br><br>
                    <strong>Freestyle Mode:</strong><br>
                    • Press <strong>A</strong> to create notes<br>
                    • Make your own rhythm to the music!<br>
                    • No scoring - just express yourself<br><br>
                    ✨ Create your own beat!
                `;
            } else {
                instructions = `
                    Create music together!<br><br>
                    <strong>Freestyle Duet Mode:</strong><br>
                    • Player 1: Press <strong>A</strong> for pink notes<br>
                    • Player 2: Press <strong>L</strong> for gold notes<br>
                    • Create your own rhythm together!<br>
                    • No scoring - just have fun!<br><br>
                    ✨ Express yourselves together!
                `;
            }
        }

        text.innerHTML = instructions;

        modal.classList.remove('hidden');

        const handleClose = () => {
            modal.classList.add('hidden');
            closeBtn.removeEventListener('click', handleClose);
            callback();
        };

        closeBtn.addEventListener('click', handleClose);
    },

    setupCanvas() {
        this.canvas = document.getElementById('rhythm-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Calculate lane positions based on mode
        const centerX = this.canvas.width / 2;

        if (this.mode === 'solo') {
            // Single lane in center
            this.laneA = centerX;
            this.laneL = centerX; // Not used in solo mode
        } else {
            // Two lanes for duet
            const laneSpacing = 120;
            this.laneA = centerX - laneSpacing / 2;
            this.laneL = centerX + laneSpacing / 2;
        }

        // Hit zone near the bottom
        this.hitZoneY = this.canvas.height - 150;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            const centerX = this.canvas.width / 2;
            if (this.mode === 'solo') {
                this.laneA = centerX;
                this.laneL = centerX;
            } else {
                const laneSpacing = 120;
                this.laneA = centerX - laneSpacing / 2;
                this.laneL = centerX + laneSpacing / 2;
            }
            this.hitZoneY = this.canvas.height - 150;
        });
    },

    generateNotes() {
        this.notes = [];
        this.spawnedNotes = [];

        // Generate notes based on song duration and BPM approximation
        const duration = 120; // 2 minutes worth of notes
        const bpm = this.selectedSong.bpm || 120; // Use song BPM or default
        const beatInterval = 60000 / bpm; // ms per beat

        let time = 2000; // Start after 2 seconds
        let beat = 0;

        if (this.mode === 'solo') {
            // Solo mode: all notes in single lane (A key)
            while (time < duration * 1000) {
                this.notes.push({
                    time: time,
                    lane: 'a',
                    hit: false,
                    missed: false,
                    y: -50
                });

                // Vary the timing for musical feel
                const variation = Math.random() * 0.3 + 0.85; // 0.85 to 1.15 multiplier
                time += beatInterval * variation;

                // Sometimes skip a beat for variety
                if (Math.random() < 0.2) {
                    time += beatInterval * 0.5;
                }

                beat++;
            }
        } else {
            // Duet mode: alternating patterns between A and L
            // Different patterns that combine to make the full rhythm
            while (time < duration * 1000) {
                // Create complementary patterns
                const patternType = beat % 8;

                if (patternType < 2) {
                    // Player 1 (A) notes
                    this.notes.push({ time, lane: 'a', hit: false, missed: false, y: -50 });
                } else if (patternType < 4) {
                    // Player 2 (L) notes
                    this.notes.push({ time, lane: 'l', hit: false, missed: false, y: -50 });
                } else if (patternType === 4) {
                    // Both together (downbeat)
                    this.notes.push({ time, lane: 'a', hit: false, missed: false, y: -50 });
                    this.notes.push({ time: time + 20, lane: 'l', hit: false, missed: false, y: -50 });
                } else {
                    // Alternating quickly
                    if (beat % 2 === 0) {
                        this.notes.push({ time, lane: 'a', hit: false, missed: false, y: -50 });
                    } else {
                        this.notes.push({ time, lane: 'l', hit: false, missed: false, y: -50 });
                    }
                }

                time += beatInterval * 0.5; // Half-beats for more action
                beat++;
            }
        }
    },

    attachControls() {
        this.keydownHandler = (e) => {
            if (e.repeat) return;

            const key = e.key.toLowerCase();

            // Handle A key
            if (key === 'a') {
                e.preventDefault();
                this.keyStates.a = true;
                this.keyFlash.a = 1;

                if (this.gameMode === 'bpm') {
                    this.handleHit('a');
                } else {
                    // Freestyle: create a note
                    this.createFreestyleNote('a');
                }
            }

            // Handle L key (only in duet mode)
            if (key === 'l' && this.mode === 'duet') {
                e.preventDefault();
                this.keyStates.l = true;
                this.keyFlash.l = 1;

                if (this.gameMode === 'bpm') {
                    this.handleHit('l');
                } else {
                    // Freestyle: create a note
                    this.createFreestyleNote('l');
                }
            }
        };

        this.keyupHandler = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'a') {
                this.keyStates.a = false;
            }
            if (key === 'l') {
                this.keyStates.l = false;
            }
        };

        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    },

    createFreestyleNote(lane) {
        // Create a visual note that rises up from the hit zone
        AudioManager.playEffect('hit');

        const x = lane === 'a' ? this.laneA : this.laneL;

        this.freestyleNotes.push({
            lane: lane,
            x: x,
            y: this.hitZoneY,
            vy: -5 - Math.random() * 3, // Move upward
            size: 25 + Math.random() * 10,
            opacity: 1,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });

        // Also create a burst effect
        this.createHitBurst(x, this.hitZoneY, 'perfect');

        // Increment a simple counter for freestyle
        this.score++;
        this.updateUI();
    },

    async startPlaying() {
        this.playing = true;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.perfectHits = 0;
        this.goodHits = 0;
        this.okayHits = 0;
        this.misses = 0;
        this.freestyleNotes = [];
        this.hitBursts = [];
        this.startTime = performance.now();
        this.gameTime = 0;

        // Set a game duration (2 minutes or until audio ends)
        this.gameDuration = 120000;

        // Start the animation immediately
        this.animate();

        // Try to start audio with a small delay for sync
        setTimeout(async () => {
            try {
                this.audio = await AudioManager.play(this.selectedSong.file);

                if (this.audio) {
                    this.audio.addEventListener('ended', () => {
                        setTimeout(() => this.endGame(), 1000);
                    });
                }
            } catch (err) {
                console.log('Audio failed to load, game continues without music');
                // Game continues even without audio - end after duration
                setTimeout(() => this.endGame(), this.gameDuration);
            }
        }, 500);
    },

    handleHit(key) {
        if (!this.playing || this.gameMode !== 'bpm') return;

        // Find the closest unhit note in the player's lane
        let closestNote = null;
        let closestDiff = Infinity;

        for (const note of this.spawnedNotes) {
            if (note.hit || note.missed) continue;
            if (note.lane !== key) continue;

            // Calculate time difference based on note position vs hit zone
            const noteHitTime = this.getNoteHitTime(note);
            const diff = Math.abs(this.gameTime - noteHitTime);

            if (diff < closestDiff && diff < this.timings.okay) {
                closestDiff = diff;
                closestNote = note;
            }
        }

        if (closestNote) {
            closestNote.hit = true;
            let hitType;

            if (closestDiff <= this.timings.perfect) {
                hitType = 'perfect';
                this.score += 300 * (1 + this.combo * 0.1);
                this.perfectHits++;
                AudioManager.playEffect('perfect');
            } else if (closestDiff <= this.timings.good) {
                hitType = 'good';
                this.score += 200 * (1 + this.combo * 0.1);
                this.goodHits++;
                AudioManager.playEffect('hit');
            } else {
                hitType = 'okay';
                this.score += 100 * (1 + this.combo * 0.1);
                this.okayHits++;
                AudioManager.playEffect('click');
            }

            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);

            this.showHitFeedback(hitType, closestNote);
            this.updateUI();
        }
    },

    getNoteHitTime(note) {
        return note.time;
    },

    showHitFeedback(type, note) {
        const laneX = note.lane === 'a' ? this.laneA : this.laneL;

        const feedback = document.createElement('div');
        feedback.className = `hit-feedback ${type}`;
        feedback.textContent = type.toUpperCase() + '!';
        feedback.style.left = laneX + 'px';
        feedback.style.top = (this.hitZoneY - 80) + 'px';

        const container = document.getElementById('hit-feedback-container');
        if (container) {
            container.appendChild(feedback);
            setTimeout(() => feedback.remove(), 500);
        }

        // Create burst effect
        this.createHitBurst(laneX, this.hitZoneY, type);
    },

    createHitBurst(x, y, type) {
        if (!this.hitBursts) this.hitBursts = [];
        this.hitBursts.push({
            x, y,
            type,
            time: 0,
            maxTime: 300
        });
    },

    updateUI() {
        const scoreEl = document.getElementById('score');
        const comboEl = document.getElementById('combo');
        if (scoreEl) scoreEl.textContent = Math.round(this.score);
        if (comboEl) {
            if (this.gameMode === 'freestyle') {
                comboEl.textContent = 'Notes: ' + this.score;
            } else {
                comboEl.textContent = 'x' + this.combo;
            }
        }
    },

    draw() {
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a0a2e');
        gradient.addColorStop(0.5, '#2d1b4e');
        gradient.addColorStop(1, '#1a0a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw highway/lane background
        this.drawLaneBackground();

        // Draw hit zone
        this.drawHitZone();

        if (this.gameMode === 'bpm') {
            // Update and draw notes for BPM mode
            this.updateNotes();
            this.drawNotes();
        } else {
            // Draw freestyle notes
            this.drawFreestyleNotes();
        }

        // Draw hit bursts
        this.drawHitBursts();

        // Draw key indicators
        this.drawKeyIndicators();

        // Draw combo effect (BPM mode only)
        if (this.gameMode === 'bpm' && this.combo >= 10) {
            this.drawComboEffect();
        }

        // Draw mode indicator
        this.drawModeIndicator();
    },

    drawLaneBackground() {
        const ctx = this.ctx;
        const laneWidth = 80;

        if (this.mode === 'solo') {
            // Single center lane
            const gradientA = ctx.createLinearGradient(this.laneA - laneWidth/2, 0, this.laneA + laneWidth/2, 0);
            gradientA.addColorStop(0, 'rgba(255, 107, 157, 0.05)');
            gradientA.addColorStop(0.5, 'rgba(255, 107, 157, 0.2)');
            gradientA.addColorStop(1, 'rgba(255, 107, 157, 0.05)');
            ctx.fillStyle = gradientA;
            ctx.fillRect(this.laneA - laneWidth/2, 0, laneWidth, this.canvas.height);

            // Lane border
            ctx.strokeStyle = 'rgba(255, 107, 157, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(this.laneA - laneWidth/2, 0);
            ctx.lineTo(this.laneA - laneWidth/2, this.canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.laneA + laneWidth/2, 0);
            ctx.lineTo(this.laneA + laneWidth/2, this.canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            // Two lanes for duet

            // Lane A (left - pink)
            const gradientA = ctx.createLinearGradient(this.laneA - laneWidth/2, 0, this.laneA + laneWidth/2, 0);
            gradientA.addColorStop(0, 'rgba(255, 107, 157, 0.05)');
            gradientA.addColorStop(0.5, 'rgba(255, 107, 157, 0.15)');
            gradientA.addColorStop(1, 'rgba(255, 107, 157, 0.05)');
            ctx.fillStyle = gradientA;
            ctx.fillRect(this.laneA - laneWidth/2, 0, laneWidth, this.canvas.height);

            // Lane L (right - gold)
            const gradientL = ctx.createLinearGradient(this.laneL - laneWidth/2, 0, this.laneL + laneWidth/2, 0);
            gradientL.addColorStop(0, 'rgba(255, 215, 0, 0.05)');
            gradientL.addColorStop(0.5, 'rgba(255, 215, 0, 0.15)');
            gradientL.addColorStop(1, 'rgba(255, 215, 0, 0.05)');
            ctx.fillStyle = gradientL;
            ctx.fillRect(this.laneL - laneWidth/2, 0, laneWidth, this.canvas.height);

            // Lane dividers
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);

            ctx.beginPath();
            ctx.moveTo(this.laneA - laneWidth/2, 0);
            ctx.lineTo(this.laneA - laneWidth/2, this.canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.laneA + laneWidth/2, 0);
            ctx.lineTo(this.laneA + laneWidth/2, this.canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.laneL + laneWidth/2, 0);
            ctx.lineTo(this.laneL + laneWidth/2, this.canvas.height);
            ctx.stroke();

            ctx.setLineDash([]);
        }
    },

    drawHitZone() {
        const ctx = this.ctx;

        // Hit zone line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();

        if (this.mode === 'solo') {
            ctx.moveTo(this.laneA - 60, this.hitZoneY);
            ctx.lineTo(this.laneA + 60, this.hitZoneY);
        } else {
            ctx.moveTo(this.laneA - 60, this.hitZoneY);
            ctx.lineTo(this.laneL + 60, this.hitZoneY);
        }
        ctx.stroke();

        // Hit zone circles
        const flashA = this.keyFlash.a;

        // Lane A hit zone
        ctx.beginPath();
        ctx.arc(this.laneA, this.hitZoneY, 35 + flashA * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 107, 157, ${0.5 + flashA * 0.5})`;
        ctx.lineWidth = 4 + flashA * 2;
        ctx.stroke();

        if (flashA > 0) {
            ctx.beginPath();
            ctx.arc(this.laneA, this.hitZoneY, 35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 107, 157, ${flashA * 0.3})`;
            ctx.fill();
        }

        // Lane L hit zone (duet only)
        if (this.mode === 'duet') {
            const flashL = this.keyFlash.l;

            ctx.beginPath();
            ctx.arc(this.laneL, this.hitZoneY, 35 + flashL * 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + flashL * 0.5})`;
            ctx.lineWidth = 4 + flashL * 2;
            ctx.stroke();

            if (flashL > 0) {
                ctx.beginPath();
                ctx.arc(this.laneL, this.hitZoneY, 35, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 215, 0, ${flashL * 0.3})`;
                ctx.fill();
            }
        }

        // Decay flash
        this.keyFlash.a = Math.max(0, this.keyFlash.a - 0.1);
        this.keyFlash.l = Math.max(0, this.keyFlash.l - 0.1);
    },

    updateNotes() {
        const approachTime = 2000; // Time for note to travel from top to hit zone

        // Spawn notes that are approaching
        for (const note of this.notes) {
            if (!this.spawnedNotes.includes(note)) {
                const timeUntilHit = note.time - this.gameTime;
                if (timeUntilHit <= approachTime && timeUntilHit > -500) {
                    this.spawnedNotes.push(note);
                }
            }
        }

        // Update note positions and check for misses
        for (const note of this.spawnedNotes) {
            if (note.hit || note.missed) continue;

            const timeUntilHit = note.time - this.gameTime;
            note.y = this.hitZoneY - (timeUntilHit / approachTime) * this.hitZoneY;

            // Check if missed
            if (timeUntilHit < -this.timings.okay) {
                note.missed = true;
                this.combo = 0;
                this.misses++;
                this.updateUI();
            }
        }
    },

    drawNotes() {
        const ctx = this.ctx;

        for (const note of this.spawnedNotes) {
            if (note.hit) {
                continue;
            }
            if (note.missed) {
                // Briefly show missed note fading out
                if (note.y < this.canvas.height + 50) {
                    ctx.globalAlpha = Math.max(0, 1 - (note.y - this.hitZoneY) / 100);
                    this.drawNote(note, true);
                    ctx.globalAlpha = 1;
                }
                continue;
            }

            this.drawNote(note, false);
        }
    },

    drawFreestyleNotes() {
        const ctx = this.ctx;

        // Update and draw freestyle notes (they rise up and fade)
        this.freestyleNotes = this.freestyleNotes.filter(note => {
            note.y += note.vy;
            note.opacity -= 0.015;
            note.rotation += note.rotationSpeed;

            if (note.opacity <= 0) return false;

            ctx.save();
            ctx.translate(note.x, note.y);
            ctx.rotate(note.rotation);
            ctx.globalAlpha = note.opacity;

            const color = note.lane === 'a' ? '#ff6b9d' : '#ffd700';

            // Glow
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, note.size * 2);
            glowGradient.addColorStop(0, color + '80');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, note.size * 2, 0, Math.PI * 2);
            ctx.fill();

            // Note body
            ctx.beginPath();
            ctx.arc(0, 0, note.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Shine
            ctx.beginPath();
            ctx.arc(-5, -5, note.size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();

            ctx.restore();
            ctx.globalAlpha = 1;

            return true;
        });
    },

    drawNote(note, missed) {
        const ctx = this.ctx;
        const x = note.lane === 'a' ? this.laneA : this.laneL;
        const y = note.y;
        const color = note.lane === 'a' ? '#ff6b9d' : '#ffd700';
        const radius = 25;

        if (missed) {
            // Missed note - show X
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✕', x, y);
            return;
        }

        // Glow effect
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        glowGradient.addColorStop(0, color + '80');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Note body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Note shine
        ctx.beginPath();
        ctx.arc(x - 5, y - 5, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // Note label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note.lane.toUpperCase(), x, y);
    },

    drawHitBursts() {
        if (!this.hitBursts) return;

        const ctx = this.ctx;

        this.hitBursts = this.hitBursts.filter(burst => {
            burst.time += 16; // Approximate frame time
            const progress = burst.time / burst.maxTime;

            if (progress >= 1) return false;

            const color = burst.type === 'perfect' ? '#ffd700' :
                          burst.type === 'good' ? '#ff6b9d' : '#aaaaaa';

            // Expanding ring
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, 30 + progress * 50, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.globalAlpha = 1 - progress;
            ctx.lineWidth = 4 * (1 - progress);
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Particles
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const dist = progress * 60;
                const px = burst.x + Math.cos(angle) * dist;
                const py = burst.y + Math.sin(angle) * dist;

                ctx.beginPath();
                ctx.arc(px, py, 3 * (1 - progress), 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = 1 - progress;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            return true;
        });
    },

    drawKeyIndicators() {
        const ctx = this.ctx;
        const y = this.hitZoneY + 60;

        // Key A indicator
        ctx.fillStyle = this.keyStates.a ? '#ff6b9d' : 'rgba(255, 107, 157, 0.3)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('A', this.laneA, y);

        if (this.mode === 'duet') {
            // Key L indicator
            ctx.fillStyle = this.keyStates.l ? '#ffd700' : 'rgba(255, 215, 0, 0.3)';
            ctx.fillText('L', this.laneL, y);

            // Player labels
            ctx.font = '14px Poppins';
            ctx.fillStyle = 'rgba(255, 107, 157, 0.7)';
            ctx.fillText('Player 1', this.laneA, y + 25);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.fillText('Player 2', this.laneL, y + 25);
        }
    },

    drawComboEffect() {
        const ctx = this.ctx;
        const pulseSize = 1 + Math.sin(performance.now() / 200) * 0.1;

        ctx.font = `${50 * pulseSize}px Dancing Script`;
        ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(performance.now() / 300) * 0.2})`;
        ctx.textAlign = 'center';
        ctx.fillText(`x${this.combo}`, this.canvas.width / 2, this.canvas.height / 2 - 50);

        if (this.combo >= 25) {
            ctx.font = '20px Poppins';
            ctx.fillStyle = 'rgba(255, 107, 157, 0.8)';
            ctx.fillText('On Fire!', this.canvas.width / 2, this.canvas.height / 2);
        }
    },

    drawModeIndicator() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px Poppins';
        ctx.textAlign = 'center';

        const modeText = this.mode === 'solo' ? 'Solo Mode' : 'Duet Mode';
        const gameText = this.gameMode === 'bpm' ? 'BPM Mode' : 'Freestyle';
        ctx.fillText(`${modeText} - ${gameText}`, this.canvas.width / 2, 30);
    },

    animate() {
        if (!this.playing) return;

        this.gameTime = performance.now() - this.startTime - 500; // Account for audio start delay
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    restartSong() {
        AudioManager.stop();
        this.playing = false;
        cancelAnimationFrame(this.animationFrame);

        // Reset state
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.perfectHits = 0;
        this.goodHits = 0;
        this.okayHits = 0;
        this.misses = 0;
        this.freestyleNotes = [];
        this.notes.forEach(note => {
            note.hit = false;
            note.missed = false;
            note.y = -50;
        });
        this.spawnedNotes = [];
        this.hitBursts = [];
        this.updateUI();

        // Restart
        this.startPlaying();
    },

    endGame() {
        this.playing = false;
        cancelAnimationFrame(this.animationFrame);
        AudioManager.stop();

        AudioManager.playEffect('celebration');
        const isNew = GameState.completeActivity('rhythm');

        const container = document.getElementById('activity-content');

        if (this.gameMode === 'freestyle') {
            // Freestyle end screen
            container.innerHTML = `
                <div class="rhythm-results">
                    <h2>Beautiful Expression!</h2>

                    <div class="results-stats">
                        <div class="stat">
                            <span class="stat-value">${this.score}</span>
                            <span class="stat-label">Notes Created</span>
                        </div>
                    </div>

                    <div class="puzzle-piece-animation">🎵</div>
                    <p class="pieces-earned">${isNew ? 'You earned 5 puzzle pieces!' : 'Activity completed!'}</p>

                    <p class="encouragement">
                        Why this song matters:<br>
                        "${this.selectedSong.memory}"
                    </p>

                    <div style="display: flex; gap: 20px; margin-top: 20px;">
                        <button class="action-btn" id="play-again">Play Again</button>
                        <button class="action-btn" id="back-to-menu">Back to Menu</button>
                    </div>
                </div>
            `;
        } else {
            // BPM mode end screen
            const totalNotes = this.perfectHits + this.goodHits + this.okayHits + this.misses;
            const accuracy = totalNotes > 0 ? Math.round(((this.perfectHits + this.goodHits + this.okayHits) / totalNotes) * 100) : 0;

            let message;
            if (accuracy >= 90) message = "Perfect harmony!";
            else if (accuracy >= 70) message = "You two are in sync!";
            else if (accuracy >= 50) message = "Beautiful effort together!";
            else message = "Music sounds better with you!";

            container.innerHTML = `
                <div class="rhythm-results">
                    <h2>${message}</h2>

                    <div class="results-stats">
                        <div class="stat">
                            <span class="stat-value">${Math.round(this.score)}</span>
                            <span class="stat-label">Final Score</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${accuracy}%</span>
                            <span class="stat-label">Accuracy</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value" style="color: #ffd700;">${this.perfectHits}</span>
                            <span class="stat-label">Perfect</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">x${this.maxCombo}</span>
                            <span class="stat-label">Max Combo</span>
                        </div>
                    </div>

                    <div class="puzzle-piece-animation">🎵</div>
                    <p class="pieces-earned">${isNew ? 'You earned 5 puzzle pieces!' : 'Activity completed!'}</p>

                    <p class="encouragement">
                        Why this song matters:<br>
                        "${this.selectedSong.memory}"
                    </p>

                    <div style="display: flex; gap: 20px; margin-top: 20px;">
                        <button class="action-btn" id="play-again">Play Again</button>
                        <button class="action-btn" id="back-to-menu">Back to Menu</button>
                    </div>
                </div>
            `;
        }

        document.getElementById('play-again').addEventListener('click', () => {
            this.init(container);
        });

        document.getElementById('back-to-menu').addEventListener('click', () => {
            window.App.showLanding();
        });
    },

    cleanup() {
        this.playing = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
        AudioManager.stop();
        this.notes = [];
        this.spawnedNotes = [];
        this.freestyleNotes = [];
        this.hitBursts = [];
    }
};
