// Constellation Connect Activity
const ConstellationActivity = {
    canvas: null,
    ctx: null,
    stars: [],
    constellations: [],
    currentConstellation: 0,
    currentStar: 0,
    connections: [],
    completedConstellations: [],
    hintActive: false,
    animationFrame: null,

    init(container) {
        container.innerHTML = `
            <div class="constellation-container">
                <canvas id="constellation-canvas"></canvas>
                <button class="hint-btn" id="hint-btn" title="Get a hint">?</button>
                <div class="constellation-progress" id="progress">
                    Constellations: 0/${ConstellationData.length}
                </div>
            </div>
        `;

        this.showInstructions(() => {
            this.setupCanvas();
            this.generateStarfield();
            this.setupConstellations();
            this.attachListeners();
            this.animate();
        });
    },

    showInstructions(callback) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const text = document.getElementById('modal-text');
        const closeBtn = document.getElementById('modal-close');

        title.textContent = 'Constellation Connect';
        text.innerHTML = `
            Connect the stars to form constellations and reveal messages about us!<br><br>
            <strong>How to play:</strong><br>
            • Click stars in sequence to connect them<br>
            • Each constellation reveals a special message<br>
            • Click the ? button for hints if you need help<br><br>
            ✨ Let's find our stars together!
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
        this.canvas = document.getElementById('constellation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    generateStarfield() {
        this.stars = [];

        // Background stars (decorative)
        for (let i = 0; i < 300; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 0.5 + Math.random() * 1.5,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5,
                isConstellation: false
            });
        }
    },

    setupConstellations() {
        this.constellations = [];

        ConstellationData.forEach((data, index) => {
            const offsetX = (index % 2) * (this.canvas.width / 2) + this.canvas.width * 0.15;
            const offsetY = Math.floor(index / 2) * (this.canvas.height / 2) + this.canvas.height * 0.15;

            const constellation = {
                message: data.message,
                stars: [],
                completed: false
            };

            data.points.forEach((point, i) => {
                const star = {
                    x: offsetX + point[0] * 0.8,
                    y: offsetY + point[1] * 0.6,
                    size: 3,
                    twinkle: Math.random() * Math.PI * 2,
                    speed: 1,
                    isConstellation: true,
                    constellationIndex: index,
                    starIndex: i,
                    connected: false,
                    glow: 0
                };

                constellation.stars.push(star);
                this.stars.push(star);
            });

            this.constellations.push(constellation);
        });
    },

    attachListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
    },

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find if we clicked on a constellation star
        for (const star of this.stars) {
            if (!star.isConstellation) continue;

            const dx = star.x - x;
            const dy = star.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20) {
                this.selectStar(star);
                return;
            }
        }
    },

    selectStar(star) {
        const constellation = this.constellations[star.constellationIndex];
        if (constellation.completed) return;

        // Check if this is the correct next star
        if (star.starIndex === this.getCurrentStarIndex(star.constellationIndex)) {
            AudioManager.playEffect('hit');
            star.connected = true;
            star.glow = 1;

            // Add connection line if not the first star
            if (star.starIndex > 0) {
                const prevStar = constellation.stars[star.starIndex - 1];
                this.connections.push({
                    from: { x: prevStar.x, y: prevStar.y },
                    to: { x: star.x, y: star.y },
                    alpha: 0,
                    constellationIndex: star.constellationIndex
                });
            }

            // Check if constellation is complete
            if (star.starIndex === constellation.stars.length - 1) {
                this.completeConstellation(star.constellationIndex);
            }
        } else if (!star.connected) {
            // Wrong star - gentle feedback
            star.glow = 0.5;
            setTimeout(() => {
                if (!star.connected) star.glow = 0;
            }, 300);
        }
    },

    getCurrentStarIndex(constellationIndex) {
        const constellation = this.constellations[constellationIndex];
        for (let i = 0; i < constellation.stars.length; i++) {
            if (!constellation.stars[i].connected) {
                return i;
            }
        }
        return -1;
    },

    completeConstellation(index) {
        const constellation = this.constellations[index];
        constellation.completed = true;
        this.completedConstellations.push(index);

        AudioManager.playEffect('success');

        // Show message
        const centerX = constellation.stars.reduce((sum, s) => sum + s.x, 0) / constellation.stars.length;
        const centerY = constellation.stars.reduce((sum, s) => sum + s.y, 0) / constellation.stars.length;

        const messageEl = document.createElement('div');
        messageEl.className = 'constellation-message';
        messageEl.textContent = constellation.message;
        messageEl.style.left = centerX + 'px';
        messageEl.style.top = (centerY + 50) + 'px';
        document.querySelector('.constellation-container').appendChild(messageEl);

        // Update progress
        document.getElementById('progress').textContent =
            `Constellations: ${this.completedConstellations.length}/${this.constellations.length}`;

        // Check if all complete
        if (this.completedConstellations.length === this.constellations.length) {
            setTimeout(() => this.completeActivity(), 2000);
        }
    },

    showHint() {
        // Find the next star to click in any incomplete constellation
        for (let i = 0; i < this.constellations.length; i++) {
            const constellation = this.constellations[i];
            if (constellation.completed) continue;

            const nextIndex = this.getCurrentStarIndex(i);
            if (nextIndex >= 0) {
                const star = constellation.stars[nextIndex];
                star.glow = 1;
                this.hintActive = true;

                setTimeout(() => {
                    this.hintActive = false;
                    if (!star.connected) star.glow = 0;
                }, 2000);

                AudioManager.playEffect('click');
                return;
            }
        }
    },

    animate() {
        const time = performance.now() / 1000;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(0.5, '#1a1a3e');
        gradient.addColorStop(1, '#2d1b4e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw mountain silhouette at bottom
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height * 0.85);

        for (let x = 0; x < this.canvas.width; x += 50) {
            const y = this.canvas.height * 0.85 + Math.sin(x * 0.01) * 30 + Math.sin(x * 0.02) * 20;
            this.ctx.lineTo(x, y);
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw connection lines
        this.connections.forEach(conn => {
            conn.alpha = Math.min(1, conn.alpha + 0.05);

            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${conn.alpha * 0.8})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Glow effect
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${conn.alpha * 0.3})`;
            this.ctx.lineWidth = 6;
            this.ctx.stroke();
        });

        // Draw stars
        this.stars.forEach(star => {
            const twinkle = 0.5 + 0.5 * Math.sin(time * star.speed + star.twinkle);

            if (star.isConstellation) {
                // Constellation stars are brighter and can glow
                const baseSize = star.connected ? star.size * 1.5 : star.size;
                const glowSize = star.glow * 15;

                // Glow effect
                if (star.glow > 0 || star.connected) {
                    const glowGradient = this.ctx.createRadialGradient(
                        star.x, star.y, 0,
                        star.x, star.y, baseSize + glowSize
                    );
                    glowGradient.addColorStop(0, star.connected ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 107, 157, 0.8)');
                    glowGradient.addColorStop(0.5, star.connected ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 107, 157, 0.3)');
                    glowGradient.addColorStop(1, 'transparent');

                    this.ctx.beginPath();
                    this.ctx.arc(star.x, star.y, baseSize + glowSize, 0, Math.PI * 2);
                    this.ctx.fillStyle = glowGradient;
                    this.ctx.fill();
                }

                // Star itself
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, baseSize * twinkle, 0, Math.PI * 2);
                this.ctx.fillStyle = star.connected ? '#ffd700' : '#fff';
                this.ctx.fill();

            } else {
                // Background stars
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
                this.ctx.fill();
            }
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    completeActivity() {
        cancelAnimationFrame(this.animationFrame);
        AudioManager.playEffect('celebration');

        const isNew = GameState.completeActivity('constellation');
        const container = document.getElementById('activity-content');

        container.innerHTML = `
            <div class="activity-complete">
                <h2>You Light Up My Sky!</h2>
                <div class="puzzle-piece-animation">✨</div>
                <p class="pieces-earned">${isNew ? 'You earned 5 puzzle pieces!' : 'Activity completed!'}</p>
                <div style="margin: 30px 0; color: var(--warm-pink);">
                    <p style="font-family: 'Dancing Script', cursive; font-size: 1.5rem;">
                        Every star reminds me of you
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
        this.stars = [];
        this.constellations = [];
        this.connections = [];
        this.completedConstellations = [];
    }
};
