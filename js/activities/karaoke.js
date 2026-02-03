// Karaoke Activity - Listen to songs and earn puzzle pieces
const KaraokeActivity = {
    canvas: null,
    ctx: null,
    animationFrame: null,
    currentSong: null,
    audio: null,
    isPlaying: false,
    particles: [],
    visualizerBars: [],

    init(container) {
        container.innerHTML = `
            <div class="karaoke-container">
                <h2 class="karaoke-title">Our Songs</h2>
                <p class="karaoke-subtitle">Listen to our special songs to earn puzzle pieces</p>
                <div class="song-grid" id="song-grid"></div>
                <div class="karaoke-player hidden" id="karaoke-player">
                    <canvas id="karaoke-canvas"></canvas>
                    <div class="now-playing">
                        <h3 id="now-playing-title">Now Playing</h3>
                        <p id="now-playing-artist"></p>
                        <p id="now-playing-memory" class="song-memory"></p>
                    </div>
                    <div class="player-controls">
                        <div class="progress-container">
                            <div class="song-progress" id="song-progress"></div>
                        </div>
                        <div class="time-display">
                            <span id="current-time">0:00</span>
                            <span id="total-time">0:00</span>
                        </div>
                        <button class="stop-btn" id="stop-song-btn">Stop & Go Back</button>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.populateSongs();
        this.attachListeners();
    },

    addStyles() {
        if (document.getElementById('karaoke-styles')) return;

        const style = document.createElement('style');
        style.id = 'karaoke-styles';
        style.textContent = `
            .karaoke-container {
                width: 100%;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 80px 20px 40px;
                background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a1a3e 100%);
            }

            .karaoke-title {
                font-family: 'Dancing Script', cursive;
                font-size: 3.5rem;
                color: #ff6b9d;
                text-shadow: 0 0 30px rgba(255, 107, 157, 0.5);
                margin-bottom: 10px;
            }

            .karaoke-subtitle {
                font-size: 1.1rem;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 40px;
            }

            .song-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                max-width: 1200px;
                width: 100%;
                padding: 0 20px;
            }

            .song-card {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 107, 157, 0.3);
                border-radius: 20px;
                padding: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .song-card:hover {
                transform: translateY(-5px);
                border-color: #ff6b9d;
                box-shadow: 0 10px 40px rgba(255, 107, 157, 0.3);
            }

            .song-card.played {
                border-color: rgba(100, 255, 100, 0.5);
                background: rgba(100, 255, 100, 0.1);
            }

            .song-card.played::after {
                content: '\\2713 Played';
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(100, 255, 100, 0.3);
                color: #64ff64;
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 0.8rem;
            }

            .song-card-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }

            .song-card-title {
                font-size: 1.3rem;
                font-weight: 600;
                color: #fff;
                margin-bottom: 5px;
            }

            .song-card-artist {
                font-size: 1rem;
                color: #ff6b9d;
                margin-bottom: 10px;
            }

            .song-card-memory {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.6);
                font-style: italic;
            }

            .song-card-play {
                display: inline-block;
                margin-top: 15px;
                padding: 10px 25px;
                background: linear-gradient(135deg, #ff6b9d, #ff8c42);
                border: none;
                border-radius: 25px;
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .song-card-play:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 20px rgba(255, 107, 157, 0.5);
            }

            .karaoke-player {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%);
                z-index: 50;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .karaoke-player.hidden {
                display: none;
            }

            #karaoke-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }

            .now-playing {
                position: relative;
                z-index: 10;
                text-align: center;
                margin-bottom: 40px;
            }

            .now-playing h3 {
                font-family: 'Dancing Script', cursive;
                font-size: 3rem;
                color: #fff;
                text-shadow: 0 0 30px rgba(255, 107, 157, 0.8);
                margin-bottom: 10px;
            }

            .now-playing p {
                font-size: 1.3rem;
                color: #ff6b9d;
            }

            .song-memory {
                font-style: italic;
                color: rgba(255, 255, 255, 0.7) !important;
                margin-top: 15px;
            }

            .player-controls {
                position: relative;
                z-index: 10;
                width: 80%;
                max-width: 500px;
            }

            .progress-container {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 10px;
            }

            .song-progress {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #ff6b9d, #ffd700);
                border-radius: 10px;
                transition: width 0.1s linear;
            }

            .time-display {
                display: flex;
                justify-content: space-between;
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
                margin-bottom: 20px;
            }

            .stop-btn {
                display: block;
                margin: 0 auto;
                padding: 12px 30px;
                background: rgba(255, 100, 100, 0.3);
                border: 2px solid rgba(255, 100, 100, 0.5);
                border-radius: 25px;
                color: #ff9999;
                font-family: 'Poppins', sans-serif;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .stop-btn:hover {
                background: rgba(255, 100, 100, 0.5);
                transform: scale(1.05);
            }

            .piece-earned-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(20, 10, 40, 0.95);
                border: 3px solid #ffd700;
                border-radius: 20px;
                padding: 40px 50px;
                text-align: center;
                z-index: 100;
                animation: popIn 0.5s ease;
            }

            .piece-earned-popup h3 {
                font-family: 'Dancing Script', cursive;
                font-size: 2.5rem;
                color: #ffd700;
                margin-bottom: 15px;
            }

            .piece-earned-popup p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 1.1rem;
                margin-bottom: 20px;
            }

            .piece-earned-popup .puzzle-emoji {
                font-size: 4rem;
                animation: bounce 0.5s ease infinite alternate;
            }

            @keyframes bounce {
                from { transform: translateY(0); }
                to { transform: translateY(-10px); }
            }

            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    },

    populateSongs() {
        const grid = document.getElementById('song-grid');
        const playedSongs = GameState.activities.karaoke?.songsPlayed || [];

        SongData.forEach((song, index) => {
            const isPlayed = playedSongs.includes(song.id);
            const card = document.createElement('div');
            card.className = `song-card ${isPlayed ? 'played' : ''}`;
            card.dataset.songId = song.id;

            card.innerHTML = `
                <div class="song-card-icon">${this.getSongIcon(index)}</div>
                <div class="song-card-title">${song.title}</div>
                <div class="song-card-artist">${song.artist}</div>
                <div class="song-card-memory">"${song.memory}"</div>
                <button class="song-card-play">${isPlayed ? 'Play Again' : 'Play & Earn Piece'}</button>
            `;

            card.addEventListener('click', () => this.playSong(song));
            grid.appendChild(card);
        });
    },

    getSongIcon(index) {
        const icons = ['🎵', '🎶', '💕', '✨', '🌟'];
        return icons[index % icons.length];
    },

    attachListeners() {
        document.getElementById('stop-song-btn').addEventListener('click', () => {
            this.stopSong();
        });
    },

    async playSong(song) {
        this.currentSong = song;
        this.isPlaying = true;

        // Show player
        const player = document.getElementById('karaoke-player');
        player.classList.remove('hidden');

        // Update now playing info
        document.getElementById('now-playing-title').textContent = song.title;
        document.getElementById('now-playing-artist').textContent = song.artist;
        document.getElementById('now-playing-memory').textContent = `"${song.memory}"`;

        // Setup canvas
        this.canvas = document.getElementById('karaoke-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize particles
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push(this.createParticle());
        }

        // Start visualization
        this.animate();

        // Play audio
        try {
            this.audio = await AudioManager.play(song.file);
            if (this.audio) {
                this.audio.addEventListener('timeupdate', () => this.updateProgress());
                this.audio.addEventListener('ended', () => this.onSongEnd());
                this.audio.addEventListener('loadedmetadata', () => {
                    document.getElementById('total-time').textContent = this.formatTime(this.audio.duration);
                });
            }
        } catch (err) {
            console.error('Failed to play audio:', err);
            // Simulate song playing for testing
            setTimeout(() => this.onSongEnd(), 5000);
        }
    },

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    },

    createParticle() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            opacity: Math.random() * 0.5 + 0.3,
            hue: Math.random() * 60 + 330 // Pink to gold range
        };
    },

    animate() {
        if (!this.isPlaying) return;

        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(26, 10, 46, 0.1)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Get audio frequency data for reactive visuals
        const avgFreq = AudioManager.getAverageFrequency() || 50;
        const intensity = avgFreq / 128;

        // Draw particles
        this.particles.forEach(p => {
            p.x += p.speedX * (1 + intensity);
            p.y += p.speedY * (1 + intensity);

            // Wrap around screen
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + intensity * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
            ctx.fill();

            // Draw glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw center visualizer
        this.drawVisualizer(intensity);

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    drawVisualizer(intensity) {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const freqData = AudioManager.getFrequencyData();

        if (freqData) {
            const bars = 64;
            const barWidth = 4;
            const radius = 100 + intensity * 50;

            for (let i = 0; i < bars; i++) {
                const angle = (i / bars) * Math.PI * 2;
                const value = freqData[i * 2] || 0;
                const barHeight = (value / 255) * 100 + 10;

                const x1 = centerX + Math.cos(angle) * radius;
                const y1 = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * (radius + barHeight);
                const y2 = centerY + Math.sin(angle) * (radius + barHeight);

                const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                gradient.addColorStop(0, '#ff6b9d');
                gradient.addColorStop(1, '#ffd700');

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = barWidth;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        // Draw center circle
        const pulseSize = 80 + intensity * 30;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
        gradient.addColorStop(0, 'rgba(255, 107, 157, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    },

    updateProgress() {
        if (!this.audio) return;

        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        document.getElementById('song-progress').style.width = `${progress}%`;
        document.getElementById('current-time').textContent = this.formatTime(this.audio.currentTime);
    },

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    onSongEnd() {
        // Award puzzle piece if this song hasn't been played before
        const wasNew = GameState.playSong(this.currentSong.id);

        if (wasNew) {
            this.showPieceEarned();
        } else {
            this.stopSong();
        }
    },

    showPieceEarned() {
        // Stop animation but keep player visible
        this.isPlaying = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        AudioManager.playEffect('celebration');

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'piece-earned-popup';
        popup.innerHTML = `
            <div class="puzzle-emoji">🧩</div>
            <h3>Puzzle Piece Earned!</h3>
            <p>You listened to "${this.currentSong.title}"</p>
            <button class="action-btn" id="continue-btn">Continue</button>
        `;

        document.body.appendChild(popup);

        document.getElementById('continue-btn').addEventListener('click', () => {
            popup.remove();
            this.stopSong();
            // Refresh the song grid to show played status
            this.refreshSongGrid();
        });
    },

    refreshSongGrid() {
        const grid = document.getElementById('song-grid');
        if (grid) {
            grid.innerHTML = '';
            this.populateSongs();
        }
    },

    stopSong() {
        this.isPlaying = false;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        AudioManager.stop();
        this.audio = null;
        this.currentSong = null;

        // Hide player
        const player = document.getElementById('karaoke-player');
        if (player) {
            player.classList.add('hidden');
        }

        // Reset progress
        const progress = document.getElementById('song-progress');
        if (progress) {
            progress.style.width = '0%';
        }
    },

    cleanup() {
        this.isPlaying = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        AudioManager.stop();
        this.audio = null;
        this.currentSong = null;
        this.particles = [];
    }
};
