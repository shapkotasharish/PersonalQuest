// Animation Utilities
const Animations = {
    // Create floating hearts
    createHearts(container, count = 20) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'heart-float';
                heart.innerHTML = ['❤️', '💕', '💗', '💖', '💝'][Math.floor(Math.random() * 5)];
                heart.style.left = Math.random() * 100 + 'vw';
                heart.style.bottom = '-50px';
                heart.style.animationDuration = (3 + Math.random() * 2) + 's';
                container.appendChild(heart);

                setTimeout(() => heart.remove(), 4000);
            }, i * 100);
        }
    },

    // Create falling petals
    createPetals(container, count = 30) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.className = 'petal';
                petal.style.left = Math.random() * 100 + 'vw';
                petal.style.top = '-30px';
                petal.style.animationDuration = (4 + Math.random() * 3) + 's';
                petal.style.transform = `rotate(${Math.random() * 360}deg)`;
                container.appendChild(petal);

                setTimeout(() => petal.remove(), 5000);
            }, i * 150);
        }
    },

    // Create sparkles
    createSparkles(container, count = 40) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = Math.random() * 100 + 'vw';
                sparkle.style.top = Math.random() * 100 + 'vh';
                sparkle.style.background = ['#ffd700', '#ff6b9d', '#fff'][Math.floor(Math.random() * 3)];
                container.appendChild(sparkle);

                setTimeout(() => sparkle.remove(), 1000);
            }, i * 50);
        }
    },

    // Create confetti explosion
    createConfetti(container, count = 100) {
        const colors = ['#ff6b9d', '#ffd700', '#ff8c42', '#ffb5a7', '#ffc2d1', '#87CEEB'];
        const shapes = ['square', 'circle', 'triangle'];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = (40 + Math.random() * 20) + 'vw';
                confetti.style.top = '-20px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
                confetti.style.animationDelay = Math.random() * 0.5 + 's';

                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                if (shape === 'circle') {
                    confetti.style.borderRadius = '50%';
                } else if (shape === 'triangle') {
                    confetti.style.width = '0';
                    confetti.style.height = '0';
                    confetti.style.borderLeft = '5px solid transparent';
                    confetti.style.borderRight = '5px solid transparent';
                    confetti.style.borderBottom = `10px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
                    confetti.style.background = 'transparent';
                }

                container.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3500);
            }, i * 20);
        }
    },

    // Create fireworks
    createFireworks(container) {
        const colors = ['#ff6b9d', '#ffd700', '#ff8c42', '#87CEEB', '#ff4081'];

        for (let burst = 0; burst < 5; burst++) {
            setTimeout(() => {
                const x = 20 + Math.random() * 60;
                const y = 20 + Math.random() * 40;
                const color = colors[Math.floor(Math.random() * colors.length)];

                for (let i = 0; i < 12; i++) {
                    const firework = document.createElement('div');
                    firework.className = 'firework';
                    firework.style.left = x + 'vw';
                    firework.style.top = y + 'vh';
                    firework.style.background = color;
                    firework.style.boxShadow = `0 0 10px ${color}`;

                    const angle = (i / 12) * Math.PI * 2;
                    const distance = 50 + Math.random() * 50;
                    firework.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
                    firework.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

                    container.appendChild(firework);
                    setTimeout(() => firework.remove(), 1500);
                }
            }, burst * 400);
        }
    },

    // Particle system for canvas
    particles: [],

    createParticle(x, y, color = '#ffd700') {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color,
            size: 2 + Math.random() * 3
        };
    },

    updateParticles(ctx) {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;

            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
                ctx.globalAlpha = 1;
                return true;
            }
            return false;
        });
    },

    // Smooth number animation
    animateNumber(element, start, end, duration = 1000) {
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            element.textContent = Math.round(start + (end - start) * eased);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    },

    // Shake effect
    shake(element, intensity = 5, duration = 500) {
        const startTime = performance.now();
        const originalTransform = element.style.transform;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const x = (Math.random() - 0.5) * intensity * (1 - progress);
                const y = (Math.random() - 0.5) * intensity * (1 - progress);
                element.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
            }
        };

        requestAnimationFrame(animate);
    },

    // Pulse glow effect
    pulseGlow(element, color = 'rgba(255, 107, 157, 0.5)') {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'pulseGlow 0.5s ease';
        element.style.boxShadow = `0 0 30px ${color}`;

        setTimeout(() => {
            element.style.boxShadow = '';
        }, 500);
    }
};
