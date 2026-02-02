// Constellation Connect Activity
const ConstellationActivity = {
    canvas: null,
    ctx: null,
    stars: [],
    constellations: [],
    connections: [],
    completedConstellations: [],
    hintActive: false,
    animationFrame: null,

    // Love-themed constellations - simple shapes, no duplicate points
    constellationShapes: [
        {
            name: 'Heart',
            message: 'You Have My Heart',
            points: [
                [0.5, 0.3],    // 1 - top center
                [0.35, 0.2],   // 2 - left bump
                [0.2, 0.35],   // 3 - left side
                [0.35, 0.6],   // 4 - left bottom
                [0.5, 0.8],    // 5 - bottom point
                [0.65, 0.6],   // 6 - right bottom
                [0.8, 0.35],   // 7 - right side
                [0.65, 0.2],   // 8 - right bump
            ]
        },
        {
            name: 'Star',
            message: 'You Are My Star',
            points: [
                [0.5, 0.15],   // 1 - top
                [0.4, 0.4],    // 2 - inner left top
                [0.15, 0.4],   // 3 - left point
                [0.35, 0.55],  // 4 - inner left bottom
                [0.25, 0.85],  // 5 - bottom left point
                [0.5, 0.65],   // 6 - inner bottom
                [0.75, 0.85],  // 7 - bottom right point
                [0.65, 0.55],  // 8 - inner right bottom
                [0.85, 0.4],   // 9 - right point
                [0.6, 0.4],    // 10 - inner right top
            ]
        },
        {
            name: 'Diamond',
            message: 'You & Me Forever',
            points: [
                [0.5, 0.15],   // 1 - top
                [0.25, 0.4],   // 2 - upper left
                [0.15, 0.5],   // 3 - left
                [0.35, 0.7],   // 4 - lower left
                [0.5, 0.9],    // 5 - bottom
                [0.65, 0.7],   // 6 - lower right
                [0.85, 0.5],   // 7 - right
                [0.75, 0.4],   // 8 - upper right
            ]
        },
        {
            name: 'Arrow',
            message: 'My Heart Points To You',
            points: [
                [0.2, 0.3],    // 1 - arrow head top
                [0.5, 0.5],    // 2 - arrow point
                [0.2, 0.7],    // 3 - arrow head bottom
                [0.35, 0.5],   // 4 - shaft start
                [0.85, 0.5],   // 5 - shaft end
            ]
        }
    ],

    init(container) {
        this.resetState();

        container.innerHTML = `
            <div class="constellation-container">
                <canvas id="constellation-canvas"></canvas>
                <button class="hint-btn" id="hint-btn" title="Get a hint">?</button>
                <div class="constellation-progress" id="progress">
                    Constellations: 0/4
                </div>
                <button class="reset-btn" id="reset-constellation" style="position: absolute; bottom: 20px; right: 20px;">Reset</button>
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

    resetState() {
        this.stars = [];
        this.constellations = [];
        this.connections = [];
        this.completedConstellations = [];
        this.hintActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    },

    showInstructions(callback) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const text = document.getElementById('modal-text');
        const closeBtn = document.getElementById('modal-close');

        title.textContent = 'Constellation Connect';
        text.innerHTML = `
            Connect the stars to form love symbols and reveal messages!<br><br>
            <strong>How to play:</strong><br>
            • Click on the <span style="color: #ffd700;">glowing stars</span> in sequence<br>
            • Each constellation forms a meaningful symbol<br>
            • Click the ? button if you need a hint<br>
            • The first star pulses brighter - start there!<br><br>
            ✨ Find our love written in the stars!
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

        window.addEventListener('resize', () => {
            this.resize();
            this.repositionConstellations();
        });
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    generateStarfield() {
        // Background stars (decorative)
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.85,
                size: 0.5 + Math.random() * 1.5,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5,
                isConstellation: false
            });
        }
    },

    setupConstellations() {
        this.constellations = [];

        // Position constellations in quadrants
        const positions = [
            { x: 0.25, y: 0.3 },  // top-left
            { x: 0.75, y: 0.3 },  // top-right
            { x: 0.25, y: 0.65 }, // bottom-left
            { x: 0.75, y: 0.65 }  // bottom-right
        ];

        this.constellationShapes.forEach((shape, index) => {
            const pos = positions[index];
            const scale = Math.min(this.canvas.width, this.canvas.height) * 0.25;

            const constellation = {
                name: shape.name,
                message: shape.message,
                stars: [],
                completed: false,
                centerX: pos.x * this.canvas.width,
                centerY: pos.y * this.canvas.height
            };

            shape.points.forEach((point, i) => {
                const star = {
                    x: (pos.x - 0.15 + point[0] * 0.3) * this.canvas.width,
                    y: (pos.y - 0.15 + point[1] * 0.3) * this.canvas.height,
                    baseX: point[0],
                    baseY: point[1],
                    posIndex: index,
                    size: 8,  // Increased size for easier clicking
                    twinkle: Math.random() * Math.PI * 2,
                    speed: 1,
                    isConstellation: true,
                    constellationIndex: index,
                    starIndex: i,
                    connected: false,
                    glow: i === 0 ? 0.5 : 0,  // First star glows initially
                    isFirstStar: i === 0
                };

                constellation.stars.push(star);
                this.stars.push(star);
            });

            this.constellations.push(constellation);
        });
    },

    repositionConstellations() {
        const positions = [
            { x: 0.25, y: 0.3 },
            { x: 0.75, y: 0.3 },
            { x: 0.25, y: 0.65 },
            { x: 0.75, y: 0.65 }
        ];

        this.constellations.forEach((constellation, index) => {
            const pos = positions[index];
            constellation.centerX = pos.x * this.canvas.width;
            constellation.centerY = pos.y * this.canvas.height;

            constellation.stars.forEach(star => {
                star.x = (pos.x - 0.15 + star.baseX * 0.3) * this.canvas.width;
                star.y = (pos.y - 0.15 + star.baseY * 0.3) * this.canvas.height;
            });
        });

        // Update connections
        this.connections.forEach(conn => {
            const constellation = this.constellations[conn.constellationIndex];
            const fromStar = constellation.stars[conn.fromIndex];
            const toStar = constellation.stars[conn.toIndex];
            if (fromStar && toStar) {
                conn.from = { x: fromStar.x, y: fromStar.y };
                conn.to = { x: toStar.x, y: toStar.y };
            }
        });
    },

    attachListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('reset-constellation').addEventListener('click', () => {
            this.resetState();
            this.generateStarfield();
            this.setupConstellations();
            this.animate();
            document.querySelectorAll('.constellation-message').forEach(el => el.remove());
            document.getElementById('progress').textContent = 'Constellations: 0/4';
        });
    },

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find clicked constellation star (larger hit area)
        let closestStar = null;
        let closestDist = 50; // Much larger click radius for easier clicking

        for (const star of this.stars) {
            if (!star.isConstellation) continue;

            const dx = star.x - x;
            const dy = star.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
                closestDist = dist;
                closestStar = star;
            }
        }

        if (closestStar) {
            this.selectStar(closestStar);
        }
    },

    selectStar(star) {
        const constellation = this.constellations[star.constellationIndex];
        if (constellation.completed) return;

        const expectedIndex = this.getCurrentStarIndex(star.constellationIndex);

        // Check if this is the correct next star
        if (star.starIndex === expectedIndex) {
            AudioManager.playEffect('hit');
            star.connected = true;
            star.glow = 1;

            // Add connection line if not the first star
            if (star.starIndex > 0) {
                const prevStar = constellation.stars[star.starIndex - 1];
                this.connections.push({
                    from: { x: prevStar.x, y: prevStar.y },
                    to: { x: star.x, y: star.y },
                    fromIndex: star.starIndex - 1,
                    toIndex: star.starIndex,
                    alpha: 0,
                    constellationIndex: star.constellationIndex
                });
            }

            // Highlight next star
            const nextIndex = star.starIndex + 1;
            if (nextIndex < constellation.stars.length) {
                constellation.stars[nextIndex].glow = 0.5;
            }

            // Check if constellation is complete
            if (star.starIndex === constellation.stars.length - 1) {
                this.completeConstellation(star.constellationIndex);
            }
        } else {
            // Wrong star - gentle pulse feedback
            star.glow = 0.7;
            AudioManager.playEffect('click');
            setTimeout(() => {
                if (!star.connected) star.glow = star.isFirstStar && expectedIndex === 0 ? 0.5 : 0;
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

        // Show message near constellation
        const messageEl = document.createElement('div');
        messageEl.className = 'constellation-message';
        messageEl.innerHTML = `<strong>${constellation.name}</strong><br>${constellation.message}`;
        messageEl.style.left = constellation.centerX + 'px';
        messageEl.style.top = (constellation.centerY + 80) + 'px';
        document.querySelector('.constellation-container').appendChild(messageEl);

        // Update progress
        document.getElementById('progress').textContent =
            `Constellations: ${this.completedConstellations.length}/4`;

        // Check if all complete
        if (this.completedConstellations.length === 4) {
            setTimeout(() => this.completeActivity(), 2000);
        }
    },

    showHint() {
        AudioManager.playEffect('click');

        // Find the next star to click in any incomplete constellation
        for (let i = 0; i < this.constellations.length; i++) {
            const constellation = this.constellations[i];
            if (constellation.completed) continue;

            const nextIndex = this.getCurrentStarIndex(i);
            if (nextIndex >= 0) {
                const star = constellation.stars[nextIndex];
                star.glow = 1;

                // Also highlight with a special effect
                this.hintActive = true;

                setTimeout(() => {
                    this.hintActive = false;
                    if (!star.connected) {
                        star.glow = star.isFirstStar ? 0.5 : 0;
                    }
                }, 3000);

                return;
            }
        }
    },

    animate() {
        const time = performance.now() / 1000;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0520');
        gradient.addColorStop(0.3, '#0f0c29');
        gradient.addColorStop(0.6, '#1a1a3e');
        gradient.addColorStop(1, '#2d1b4e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw subtle horizon
        this.ctx.fillStyle = '#15102a';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height * 0.88);

        for (let x = 0; x < this.canvas.width; x += 30) {
            const y = this.canvas.height * 0.88 + Math.sin(x * 0.008) * 15 + Math.sin(x * 0.015) * 10;
            this.ctx.lineTo(x, y);
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw connection lines
        this.connections.forEach(conn => {
            conn.alpha = Math.min(1, conn.alpha + 0.03);

            // Glow
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${conn.alpha * 0.3})`;
            this.ctx.lineWidth = 8;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();

            // Main line
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${conn.alpha * 0.9})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        // Draw stars
        this.stars.forEach(star => {
            const twinkle = 0.6 + 0.4 * Math.sin(time * star.speed + star.twinkle);

            if (star.isConstellation) {
                const constellation = this.constellations[star.constellationIndex];
                if (constellation.completed && !star.connected) return;

                // Larger, more visible constellation stars
                let baseSize = star.size;
                let glowAmount = star.glow;

                // Pulse effect for first unconnected star
                if (!star.connected && this.getCurrentStarIndex(star.constellationIndex) === star.starIndex) {
                    glowAmount = 0.5 + 0.3 * Math.sin(time * 3);
                }

                const glowSize = glowAmount * 25;

                // Outer glow
                if (glowAmount > 0 || star.connected) {
                    const glowGradient = this.ctx.createRadialGradient(
                        star.x, star.y, 0,
                        star.x, star.y, baseSize + glowSize
                    );

                    if (star.connected) {
                        glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
                        glowGradient.addColorStop(0.4, 'rgba(255, 215, 0, 0.4)');
                        glowGradient.addColorStop(1, 'transparent');
                    } else {
                        glowGradient.addColorStop(0, 'rgba(255, 107, 157, 0.8)');
                        glowGradient.addColorStop(0.4, 'rgba(255, 107, 157, 0.3)');
                        glowGradient.addColorStop(1, 'transparent');
                    }

                    this.ctx.beginPath();
                    this.ctx.arc(star.x, star.y, baseSize + glowSize, 0, Math.PI * 2);
                    this.ctx.fillStyle = glowGradient;
                    this.ctx.fill();
                }

                // Star body
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, baseSize * twinkle, 0, Math.PI * 2);
                this.ctx.fillStyle = star.connected ? '#ffd700' : '#ffffff';
                this.ctx.fill();

                // Inner highlight
                this.ctx.beginPath();
                this.ctx.arc(star.x - 1, star.y - 1, baseSize * 0.3, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.fill();

            } else {
                // Background stars
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + twinkle * 0.5})`;
                this.ctx.fill();
            }
        });

        // Draw constellation names for incomplete ones
        this.constellations.forEach((constellation, index) => {
            if (!constellation.completed) {
                this.ctx.font = '14px Poppins';
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(constellation.name, constellation.centerX, constellation.centerY - 60);
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
                        Our love is written in the stars
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
