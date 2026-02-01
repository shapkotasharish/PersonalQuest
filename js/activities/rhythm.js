// Rhythm of Us Activity
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
    hitZoneY: 0,
    lastNoteTime: 0,
    animationFrame: null,

    // Timing windows (ms)
    timings: {
        perfect: 100,
        good: 200,
        okay: 300
    },

    init(container) {
        container.innerHTML = `
            <div class="rhythm-container">
                <div class="song-selection" id="song-selection">
                    <h2>Choose Your Song</h2>
                    <div class="song-list" id="song-list"></div>
                    <div style="margin-top: 30px; display: flex; gap: 20px;">
                        <button class="action-btn" id="solo-btn" disabled>Solo Mode</button>
                        <button class="action-btn" id="duet-btn" disabled>Duet Mode</button>
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

                if (this.audio) {
                    AudioManager.stop();
                    btn.textContent = 'Preview';
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
                <div class="rhythm-game">
                    <div class="rhythm-header">
                        <div class="score-display">Score: <span id="score">0</span></div>
                        <div class="combo-display">Combo: <span id="combo">x0</span></div>
                    </div>
                    <canvas id="rhythm-canvas"></canvas>
                </div>
            </div>
        `;

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
                '• Press SPACEBAR when notes reach the hit zone' :
                '• Player 1: Press D | Player 2: Press K'}<br>
            • Perfect timing = more points!<br>
            • Build combos for bonus points<br><br>
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

        this.hitZoneY = this.canvas.height - 150;
    },

    generateNotes() {
        this.notes = [];

        // Generate notes based on BPM estimation (roughly every 0.5-1 second)
        const duration = 180; // 3 minutes max
        const noteInterval = this.mode === 'solo' ? 0.6 : 0.4;

        for (let time = 3; time < duration; time += noteInterval + Math.random() * 0.4) {
            if (this.mode === 'solo') {
                this.notes.push({
                    time: time * 1000,
                    lane: 0,
                    hit: false,
                    missed: false
                });
            } else {
                // Duet mode - alternate lanes with some combined notes
                const lane = Math.random() > 0.7 ? 2 : (Math.random() > 0.5 ? 0 : 1);
                this.notes.push({
                    time: time * 1000,
                    lane, // 0 = player 1, 1 = player 2, 2 = both
                    hit: false,
                    missed: false
                });
            }
        }
    },

    attachControls() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;

            if (this.mode === 'solo' && e.code === 'Space') {
                e.preventDefault();
                this.handleHit(0);
            } else if (this.mode === 'duet') {
                if (e.key.toLowerCase() === 'd') {
                    this.handleHit(0);
                } else if (e.key.toLowerCase() === 'k') {
                    this.handleHit(1);
                }
            }
        });
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
        this.spawnedNotes = [];

        this.audio = await AudioManager.play(this.selectedSong.file);

        if (this.audio) {
            this.audio.addEventListener('ended', () => {
                this.endGame();
            });
        }

        this.animate();
    },

    handleHit(playerLane) {
        const currentTime = AudioManager.getCurrentTime() * 1000;

        // Find the closest unhit note in the hit window
        let closestNote = null;
        let closestDiff = Infinity;

        for (const note of this.spawnedNotes) {
            if (note.hit || note.missed) continue;

            // Check lane (for duet mode)
            if (this.mode === 'duet' && note.lane !== 2 && note.lane !== playerLane) continue;

            const expectedHitTime = note.time;
            const diff = Math.abs(currentTime - expectedHitTime);

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

    showHitFeedback(type, note) {
        const feedback = document.createElement('div');
        feedback.className = `hit-feedback ${type}`;
        feedback.textContent = type.toUpperCase() + '!';

        const laneX = this.getLaneX(note.lane);
        feedback.style.left = laneX + 'px';
        feedback.style.top = (this.hitZoneY - 50) + 'px';

        document.querySelector('.rhythm-game').appendChild(feedback);

        setTimeout(() => feedback.remove(), 500);
    },

    getLaneX(lane) {
        if (this.mode === 'solo') {
            return this.canvas.width / 2;
        } else {
            if (lane === 2) return this.canvas.width / 2;
            return lane === 0 ? this.canvas.width / 3 : (this.canvas.width * 2) / 3;
        }
    },

    updateUI() {
        document.getElementById('score').textContent = Math.round(this.score);
        document.getElementById('combo').textContent = 'x' + this.combo;
    },

    draw() {
        const currentTime = AudioManager.getCurrentTime() * 1000;
        const avgFreq = AudioManager.getAverageFrequency();

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dynamic background based on audio
        const intensity = avgFreq / 255;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, `rgba(45, 27, 78, ${0.8 + intensity * 0.2})`);
        gradient.addColorStop(0.5, `rgba(255, 107, 157, ${0.1 + intensity * 0.2})`);
        gradient.addColorStop(1, `rgba(26, 26, 62, ${0.8 + intensity * 0.2})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw lanes
        if (this.mode === 'solo') {
            this.drawLane(this.canvas.width / 2, '#ff6b9d');
        } else {
            this.drawLane(this.canvas.width / 3, '#ff6b9d');
            this.drawLane((this.canvas.width * 2) / 3, '#ffd700');
        }

        // Draw hit zone
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.hitZoneY);
        this.ctx.lineTo(this.canvas.width, this.hitZoneY);
        this.ctx.stroke();

        // Spawn and update notes
        for (const note of this.notes) {
            // Spawn note if it's time
            if (!this.spawnedNotes.includes(note) && note.time - currentTime < 3000 && note.time > currentTime - 500) {
                this.spawnedNotes.push(note);
            }
        }

        // Draw spawned notes
        for (const note of this.spawnedNotes) {
            if (note.hit || note.missed) continue;

            const timeUntilHit = note.time - currentTime;
            const noteY = this.hitZoneY - (timeUntilHit / 3000) * (this.hitZoneY - 100);

            // Check if missed
            if (timeUntilHit < -this.timings.okay) {
                note.missed = true;
                this.combo = 0;
                this.misses++;
                this.updateUI();
                continue;
            }

            const laneX = this.getLaneX(note.lane);

            // Note glow
            const glowGradient = this.ctx.createRadialGradient(laneX, noteY, 0, laneX, noteY, 30);
            glowGradient.addColorStop(0, note.lane === 1 ? 'rgba(255, 215, 0, 0.6)' :
                                          note.lane === 2 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 107, 157, 0.6)');
            glowGradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(laneX, noteY, 30, 0, Math.PI * 2);
            this.ctx.fill();

            // Note circle
            this.ctx.beginPath();
            this.ctx.arc(laneX, noteY, 20, 0, Math.PI * 2);
            this.ctx.fillStyle = note.lane === 1 ? '#ffd700' :
                                 note.lane === 2 ? '#fff' : '#ff6b9d';
            this.ctx.fill();

            // Note inner glow
            this.ctx.beginPath();
            this.ctx.arc(laneX, noteY, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fill();
        }

        // Draw controls hint
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '16px Poppins';
        this.ctx.textAlign = 'center';

        if (this.mode === 'solo') {
            this.ctx.fillText('SPACE', this.canvas.width / 2, this.hitZoneY + 40);
        } else {
            this.ctx.fillText('D', this.canvas.width / 3, this.hitZoneY + 40);
            this.ctx.fillText('K', (this.canvas.width * 2) / 3, this.hitZoneY + 40);
        }

        // Combo effect
        if (this.combo >= 10) {
            const pulseSize = 1 + Math.sin(performance.now() / 200) * 0.1;
            this.ctx.font = `${60 * pulseSize}px Dancing Script`;
            this.ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(performance.now() / 300) * 0.3})`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`x${this.combo}`, this.canvas.width / 2, this.canvas.height / 2);
        }
    },

    drawLane(x, color) {
        // Lane line
        this.ctx.strokeStyle = color + '40';
        this.ctx.lineWidth = 60;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();

        // Hit zone highlight
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(x, this.hitZoneY, 30, 0, Math.PI * 2);
        this.ctx.stroke();
    },

    animate() {
        if (!this.playing) return;

        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
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
                        <span class="stat-value">${this.perfectHits}</span>
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
        AudioManager.stop();
        this.notes = [];
        this.spawnedNotes = [];
    }
};
