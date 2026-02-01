// Rhythm of Us Activity - Guitar Hero style gameplay
const RhythmActivity = {
    canvas: null,
    ctx: null,
    selectedSong: null,
    mode: 'solo',
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
    animationFrame: null,
    startTime: 0,
    gameTime: 0,
    keyStates: { a: false, d: false },
    keyFlash: { a: 0, d: 0 },

    // Lane positions
    laneA: 0,
    laneD: 0,

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

        container.innerHTML = `
            <div class="rhythm-container">
                <div class="song-selection" id="song-selection">
                    <h2>Choose Your Song</h2>
                    <div class="song-list" id="song-list"></div>
                    <div style="margin-top: 30px; display: flex; gap: 20px;">
                        <button class="action-btn" id="solo-btn" disabled>Solo Mode (A & D keys)</button>
                        <button class="action-btn" id="duet-btn" disabled>Duet Mode (A vs D)</button>
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

        // Mode buttons
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
            this.generateNotes();
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
        text.innerHTML = `
            Feel the rhythm of our song together!<br><br>
            <strong>How to play:</strong><br>
            ${this.mode === 'solo' ?
                '• Press <strong>A</strong> for left lane, <strong>D</strong> for right lane<br>• Hit notes when they reach the target zone!' :
                '• Player 1: Press <strong>A</strong> key for your notes<br>• Player 2: Press <strong>D</strong> key for your notes<br>• Work together!'}<br><br>
            • <span style="color: #ffd700;">Perfect</span> = 300 pts<br>
            • <span style="color: #ff6b9d;">Good</span> = 200 pts<br>
            • <span style="color: #aaa;">Okay</span> = 100 pts<br><br>
            🎵 Let's make music together!
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
        this.canvas = document.getElementById('rhythm-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Calculate lane positions
        const centerX = this.canvas.width / 2;
        const laneSpacing = 120;

        this.laneA = centerX - laneSpacing / 2;
        this.laneD = centerX + laneSpacing / 2;

        // Hit zone near the bottom
        this.hitZoneY = this.canvas.height - 150;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            const centerX = this.canvas.width / 2;
            this.laneA = centerX - laneSpacing / 2;
            this.laneD = centerX + laneSpacing / 2;
            this.hitZoneY = this.canvas.height - 150;
        });
    },

    generateNotes() {
        this.notes = [];
        this.spawnedNotes = [];

        // Generate notes based on song duration and BPM approximation
        // Use a pattern-based approach for better gameplay
        const duration = 120; // 2 minutes worth of notes
        const bpm = 120; // Approximate BPM
        const beatInterval = 60000 / bpm; // ms per beat

        let time = 2000; // Start after 2 seconds
        let patternIndex = 0;

        // Define some patterns for variety
        const patterns = [
            ['a'], ['d'], ['a'], ['d'],  // Alternating
            ['a', 'd'], // Both together (only in solo mode or sync moment)
            ['a'], ['a'], ['d'], ['d'],  // Doubles
            ['d'], ['a'], ['d'], ['a'],  // Reverse alternating
        ];

        while (time < duration * 1000) {
            const pattern = patterns[patternIndex % patterns.length];

            pattern.forEach((lane, i) => {
                if (this.mode === 'duet' && pattern.length > 1) {
                    // In duet mode, split simultaneous notes between players
                    if (i === 0) lane = 'a';
                    else lane = 'd';
                }

                this.notes.push({
                    time: time + i * 50, // Slight offset for simultaneous notes
                    lane: lane,
                    hit: false,
                    missed: false,
                    y: -50 // Start above screen
                });
            });

            // Vary the timing for musical feel
            const variation = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 multiplier
            time += beatInterval * variation;

            // Sometimes skip a beat for variety
            if (Math.random() < 0.15) {
                time += beatInterval * 0.5;
            }

            patternIndex++;
        }
    },

    attachControls() {
        this.keydownHandler = (e) => {
            if (e.repeat) return;

            const key = e.key.toLowerCase();
            if (key === 'a' || key === 'd') {
                e.preventDefault();
                this.keyStates[key] = true;
                this.keyFlash[key] = 1;
                this.handleHit(key);
            }
        };

        this.keyupHandler = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'a' || key === 'd') {
                this.keyStates[key] = false;
            }
        };

        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
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
        this.startTime = performance.now();
        this.gameTime = 0;

        // Start audio with a small delay for sync
        setTimeout(async () => {
            this.audio = await AudioManager.play(this.selectedSong.file);

            if (this.audio) {
                this.audio.addEventListener('ended', () => {
                    setTimeout(() => this.endGame(), 1000);
                });
            }
        }, 500);

        this.animate();
    },

    handleHit(key) {
        if (!this.playing) return;

        // In duet mode, each player can only hit their lane
        if (this.mode === 'duet') {
            // Player 1 = A, Player 2 = D
            // Each can only hit their own notes
        }

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
            } else if (closestDiff <= this.timings.good) {
                hitType = 'good';
                this.score += 200 * (1 + this.combo * 0.1);
                this.goodHits++;
            } else {
                hitType = 'okay';
                this.score += 100 * (1 + this.combo * 0.1);
                this.okayHits++;
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
        const laneX = note.lane === 'a' ? this.laneA : this.laneD;

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
        // Visual burst effect drawn in next frame
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
        if (comboEl) comboEl.textContent = 'x' + this.combo;
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

        // Update and draw notes
        this.updateNotes();
        this.drawNotes();

        // Draw hit bursts
        this.drawHitBursts();

        // Draw key indicators
        this.drawKeyIndicators();

        // Draw combo effect
        if (this.combo >= 10) {
            this.drawComboEffect();
        }

        // Draw mode indicator
        this.drawModeIndicator();
    },

    drawLaneBackground() {
        const ctx = this.ctx;
        const laneWidth = 80;

        // Lane A (left)
        const gradientA = ctx.createLinearGradient(this.laneA - laneWidth/2, 0, this.laneA + laneWidth/2, 0);
        gradientA.addColorStop(0, 'rgba(255, 107, 157, 0.05)');
        gradientA.addColorStop(0.5, 'rgba(255, 107, 157, 0.15)');
        gradientA.addColorStop(1, 'rgba(255, 107, 157, 0.05)');
        ctx.fillStyle = gradientA;
        ctx.fillRect(this.laneA - laneWidth/2, 0, laneWidth, this.canvas.height);

        // Lane D (right)
        const gradientD = ctx.createLinearGradient(this.laneD - laneWidth/2, 0, this.laneD + laneWidth/2, 0);
        gradientD.addColorStop(0, 'rgba(255, 215, 0, 0.05)');
        gradientD.addColorStop(0.5, 'rgba(255, 215, 0, 0.15)');
        gradientD.addColorStop(1, 'rgba(255, 215, 0, 0.05)');
        ctx.fillStyle = gradientD;
        ctx.fillRect(this.laneD - laneWidth/2, 0, laneWidth, this.canvas.height);

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
        ctx.moveTo(this.laneD + laneWidth/2, 0);
        ctx.lineTo(this.laneD + laneWidth/2, this.canvas.height);
        ctx.stroke();

        ctx.setLineDash([]);
    },

    drawHitZone() {
        const ctx = this.ctx;

        // Hit zone line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.laneA - 60, this.hitZoneY);
        ctx.lineTo(this.laneD + 60, this.hitZoneY);
        ctx.stroke();

        // Hit zone circles
        const flashA = this.keyFlash.a;
        const flashD = this.keyFlash.d;

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

        // Lane D hit zone
        ctx.beginPath();
        ctx.arc(this.laneD, this.hitZoneY, 35 + flashD * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + flashD * 0.5})`;
        ctx.lineWidth = 4 + flashD * 2;
        ctx.stroke();

        if (flashD > 0) {
            ctx.beginPath();
            ctx.arc(this.laneD, this.hitZoneY, 35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${flashD * 0.3})`;
            ctx.fill();
        }

        // Decay flash
        this.keyFlash.a = Math.max(0, this.keyFlash.a - 0.1);
        this.keyFlash.d = Math.max(0, this.keyFlash.d - 0.1);
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
                // Draw hit effect
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

    drawNote(note, missed) {
        const ctx = this.ctx;
        const x = note.lane === 'a' ? this.laneA : this.laneD;
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
        const now = performance.now();

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

        // Key D indicator
        ctx.fillStyle = this.keyStates.d ? '#ffd700' : 'rgba(255, 215, 0, 0.3)';
        ctx.fillText('D', this.laneD, y);

        // Mode-specific labels
        if (this.mode === 'duet') {
            ctx.font = '14px Poppins';
            ctx.fillStyle = 'rgba(255, 107, 157, 0.7)';
            ctx.fillText('Player 1', this.laneA, y + 25);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.fillText('Player 2', this.laneD, y + 25);
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
        ctx.fillText(
            this.mode === 'solo' ? 'Solo Mode' : 'Duet Mode',
            this.canvas.width / 2,
            30
        );
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

        const totalNotes = this.perfectHits + this.goodHits + this.okayHits + this.misses;
        const accuracy = totalNotes > 0 ? Math.round(((this.perfectHits + this.goodHits + this.okayHits) / totalNotes) * 100) : 0;

        let message;
        if (accuracy >= 90) message = "Perfect harmony!";
        else if (accuracy >= 70) message = "You two are in sync!";
        else if (accuracy >= 50) message = "Beautiful effort together!";
        else message = "Music sounds better with you!";

        AudioManager.playEffect('celebration');
        const isNew = GameState.completeActivity('rhythm');

        const container = document.getElementById('activity-content');
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
        this.hitBursts = [];
    }
};
