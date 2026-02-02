// Final Reveal Sequence
const FinaleSystem = {
    canvas: null,
    ctx: null,
    stage: 0,
    clickCount: 0,
    animationFrame: null,
    particles: [],
    noButtonAttempts: 0,

    puzzleImage: 'assets/images/puzzle/main.jpg',

    messages: [
        "I love you",
        "You make my world brighter",
        "Every moment with you is a gift"
    ],

    init() {
        const container = document.getElementById('finale-content');
        this.canvas = document.getElementById('finale-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.stage = 0;
        this.clickCount = 0;
        this.noButtonAttempts = 0;

        this.startRevealSequence(container);
        this.animate();
    },

    startRevealSequence(container) {
        // Stage 1: Show the completed puzzle image
        container.innerHTML = `
            <img src="${this.puzzleImage}" class="finale-photo" id="finale-photo" style="opacity: 0;">
        `;

        const photo = document.getElementById('finale-photo');

        // Animate photo in
        setTimeout(() => {
            photo.style.transition = 'opacity 2s ease, transform 2s ease';
            photo.style.opacity = '1';
            photo.style.transform = 'scale(1.05)';
        }, 500);

        // Show "I love you" message
        setTimeout(() => {
            const message = document.createElement('div');
            message.className = 'finale-message large';
            message.textContent = this.messages[0];
            message.style.opacity = '0';
            container.appendChild(message);

            setTimeout(() => {
                message.style.transition = 'opacity 1s ease';
                message.style.opacity = '1';
            }, 100);

            // Add click instruction
            setTimeout(() => {
                const instruction = document.createElement('div');
                instruction.className = 'click-continue';
                instruction.textContent = 'Click anywhere to continue...';
                container.appendChild(instruction);

                this.stage = 1;
                document.addEventListener('click', this.handleClick.bind(this));
            }, 2000);
        }, 3000);
    },

    handleClick(e) {
        if (this.stage < 1) return;

        // Don't count clicks on buttons
        if (e.target.tagName === 'BUTTON') return;

        this.clickCount++;
        AudioManager.playEffect('click');

        const container = document.getElementById('finale-content');

        switch (this.clickCount) {
            case 1:
                // Hearts floating up
                this.spawnHearts();
                break;

            case 2:
                // Flower petals falling
                this.spawnPetals();
                break;

            case 3:
                // Sparkles appear
                this.spawnSparkles();
                // Add second message
                if (!document.querySelector('.finale-message:nth-child(3)')) {
                    const msg = document.createElement('div');
                    msg.className = 'finale-message';
                    msg.textContent = this.messages[1];
                    msg.style.opacity = '0';
                    container.insertBefore(msg, container.querySelector('.click-continue'));
                    setTimeout(() => {
                        msg.style.transition = 'opacity 1s ease';
                        msg.style.opacity = '1';
                    }, 100);
                }
                break;

            case 4:
                // More effects
                this.spawnHearts();
                this.spawnSparkles();
                // Add third message
                if (!document.querySelector('.finale-message:nth-child(4)')) {
                    const msg = document.createElement('div');
                    msg.className = 'finale-message';
                    msg.textContent = this.messages[2];
                    msg.style.opacity = '0';
                    container.insertBefore(msg, container.querySelector('.click-continue'));
                    setTimeout(() => {
                        msg.style.transition = 'opacity 1s ease';
                        msg.style.opacity = '1';
                    }, 100);
                }
                break;

            case 5:
                // Everything!
                this.spawnHearts();
                this.spawnPetals();
                this.spawnSparkles();
                break;

            default:
                if (this.clickCount >= 6) {
                    // Show the question
                    this.showQuestion(container);
                    document.removeEventListener('click', this.handleClick.bind(this));
                }
                break;
        }
    },

    spawnHearts() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.particles.push({
                    type: 'heart',
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height + 50,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -3 - Math.random() * 2,
                    size: 20 + Math.random() * 20,
                    rotation: Math.random() * Math.PI * 2,
                    emoji: ['❤️', '💕', '💗', '💖', '💝'][Math.floor(Math.random() * 5)],
                    life: 1
                });
            }, i * 100);
        }
    },

    spawnPetals() {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.particles.push({
                    type: 'petal',
                    x: Math.random() * this.canvas.width,
                    y: -30,
                    vx: (Math.random() - 0.5) * 2,
                    vy: 2 + Math.random() * 2,
                    size: 15 + Math.random() * 10,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    color: ['#ffb5a7', '#ffc2d1', '#ff8fab'][Math.floor(Math.random() * 3)],
                    life: 1
                });
            }, i * 80);
        }
    },

    spawnSparkles() {
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                this.particles.push({
                    type: 'sparkle',
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: 3 + Math.random() * 5,
                    life: 1,
                    maxLife: 1,
                    color: ['#ffd700', '#fff', '#ff6b9d'][Math.floor(Math.random() * 3)]
                });
            }, i * 30);
        }
    },

    showQuestion(container) {
        this.stage = 2;

        // Remove click instruction
        const instruction = container.querySelector('.click-continue');
        if (instruction) instruction.remove();

        // Create question container
        const questionContainer = document.createElement('div');
        questionContainer.className = 'question-container';
        questionContainer.innerHTML = `
            <div class="question-text">Will you be my Valentine?</div>
            <div class="button-container">
                <button class="yes-btn" id="yes-btn">Yes! 💕</button>
                <button class="no-btn" id="no-btn">
                    No
                    <span class="no-btn-legs">🦵🦵</span>
                </button>
            </div>
        `;

        container.appendChild(questionContainer);

        // Yes button handler
        document.getElementById('yes-btn').addEventListener('click', () => {
            this.celebrate();
        });

        // No button - runs away!
        const noBtn = document.getElementById('no-btn');

        noBtn.addEventListener('mouseenter', () => {
            this.noButtonAttempts++;
            noBtn.classList.add('running');
            AudioManager.playEffect('click');

            // Move to random position
            const maxX = window.innerWidth - 150;
            const maxY = window.innerHeight - 100;
            const newX = Math.random() * maxX;
            const newY = Math.max(200, Math.random() * maxY);

            noBtn.style.position = 'fixed';
            noBtn.style.left = newX + 'px';
            noBtn.style.top = newY + 'px';
            noBtn.style.transition = 'left 0.2s ease, top 0.2s ease';

            // After many attempts, special behavior
            if (this.noButtonAttempts >= 5) {
                setTimeout(() => {
                    noBtn.textContent = "Nice try! 😊";
                    setTimeout(() => {
                        noBtn.style.display = 'none';
                    }, 1000);
                }, 200);
            }

            setTimeout(() => {
                noBtn.classList.remove('running');
            }, 300);
        });

        // If somehow clicked anyway
        noBtn.addEventListener('click', () => {
            noBtn.textContent = "That's not an option! 💕";
            AudioManager.playEffect('click');
            setTimeout(() => {
                const newX = Math.random() * (window.innerWidth - 150);
                const newY = Math.max(200, Math.random() * (window.innerHeight - 100));
                noBtn.style.left = newX + 'px';
                noBtn.style.top = newY + 'px';
                noBtn.textContent = 'No';
            }, 500);
        });
    },

    celebrate() {
        this.stage = 3;
        AudioManager.playEffect('celebration');

        const container = document.getElementById('finale-content');

        // Massive celebration!
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.spawnHearts();
                this.spawnPetals();
                this.spawnSparkles();
                this.spawnConfetti();
            }, i * 500);
        }

        // Flash effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        setTimeout(() => {
            container.innerHTML = `
                <div class="end-screen">
                    <img src="${this.puzzleImage}" class="finale-photo">
                    <h1 class="end-title">Happy Valentine's Day, Prashika!</h1>
                    <p style="font-family: 'Dancing Script', cursive; font-size: 2rem; color: var(--warm-pink);">
                        I can't wait to celebrate with you! 💕
                    </p>

                    <div class="replay-section">
                        <h3>Replay Activities:</h3>
                        <div class="replay-list">
                            <button class="replay-item" data-activity="drawing">Turn-based Drawing Relay</button>
                            <button class="replay-item" data-activity="constellation">Constellation Connect</button>
                            <button class="replay-item" data-activity="garden">Garden of Wishes</button>
                            <button class="replay-item" data-activity="maze">Memory Lane Maze</button>
                            <button class="replay-item" data-activity="rhythm">Rhythm of Us</button>
                        </div>
                    </div>

                    <div class="end-actions">
                        <button class="end-btn" id="download-btn">Download Photo</button>
                        <button class="end-btn secondary" id="start-over-btn">Start Over</button>
                    </div>
                </div>
            `;

            // Attach replay listeners
            document.querySelectorAll('.replay-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    window.App.startActivity(btn.dataset.activity);
                });
            });

            // Download button
            document.getElementById('download-btn').addEventListener('click', () => {
                const link = document.createElement('a');
                link.href = this.puzzleImage;
                link.download = 'our-memory.jpg';
                link.click();
            });

            // Start over button
            document.getElementById('start-over-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to start over? All progress will be reset.')) {
                    GameState.reset();
                    window.App.showLanding();
                }
            });

            // Continue celebration effects
            setInterval(() => {
                if (Math.random() > 0.7) this.spawnHearts();
                if (Math.random() > 0.8) this.spawnSparkles();
            }, 2000);

        }, 2000);
    },

    spawnConfetti() {
        const colors = ['#ff6b9d', '#ffd700', '#ff8c42', '#87CEEB', '#98FB98', '#DDA0DD'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.particles.push({
                    type: 'confetti',
                    x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
                    y: this.canvas.height / 2,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15 - 5,
                    size: 8 + Math.random() * 8,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1,
                    gravity: 0.2
                });
            }, i * 20);
        }
    },

    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles = this.particles.filter(p => {
            // Update based on type
            switch (p.type) {
                case 'heart':
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.02; // Slight gravity
                    p.life -= 0.005;

                    if (p.life > 0 && p.y > -50) {
                        this.ctx.globalAlpha = p.life;
                        this.ctx.font = `${p.size}px Arial`;
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText(p.emoji, p.x, p.y);
                        this.ctx.globalAlpha = 1;
                        return true;
                    }
                    return false;

                case 'petal':
                    p.x += p.vx + Math.sin(p.y * 0.02) * 0.5;
                    p.y += p.vy;
                    p.rotation += p.rotationSpeed;
                    p.life -= 0.003;

                    if (p.life > 0 && p.y < this.canvas.height + 50) {
                        this.ctx.save();
                        this.ctx.translate(p.x, p.y);
                        this.ctx.rotate(p.rotation);
                        this.ctx.globalAlpha = p.life;
                        this.ctx.fillStyle = p.color;
                        this.ctx.beginPath();
                        this.ctx.ellipse(0, 0, p.size / 2, p.size, 0, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.restore();
                        this.ctx.globalAlpha = 1;
                        return true;
                    }
                    return false;

                case 'sparkle':
                    p.life -= 0.02;

                    if (p.life > 0) {
                        const scale = Math.sin(p.life * Math.PI);
                        this.ctx.globalAlpha = p.life;
                        this.ctx.fillStyle = p.color;
                        this.ctx.beginPath();
                        this.ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.globalAlpha = 1;
                        return true;
                    }
                    return false;

                case 'confetti':
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.vx *= 0.99;
                    p.rotation += p.rotationSpeed;
                    p.life -= 0.005;

                    if (p.life > 0 && p.y < this.canvas.height + 50) {
                        this.ctx.save();
                        this.ctx.translate(p.x, p.y);
                        this.ctx.rotate(p.rotation);
                        this.ctx.globalAlpha = p.life;
                        this.ctx.fillStyle = p.color;
                        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
                        this.ctx.restore();
                        this.ctx.globalAlpha = 1;
                        return true;
                    }
                    return false;
            }

            return false;
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.particles = [];
        this.stage = 0;
        this.clickCount = 0;
    }
};
