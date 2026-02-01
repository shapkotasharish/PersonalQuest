// Landing Page - Interactive Background
const Landing = {
    canvas: null,
    ctx: null,
    timeOfDay: 0, // 0: sunset, 1: night, 2: sunrise, 3: day
    targetTime: 0,
    transitionProgress: 1,
    willowTrees: [],
    stars: [],
    mouseX: 0,
    mouseY: 0,
    animationFrame: null,

    // Color palettes for different times
    palettes: {
        0: { // Sunset
            sky: ['#ff6b35', '#ff8c42', '#ffd93d', '#ff6b9d'],
            ground: '#2d1b4e',
            treeTrunk: '#4a3728',
            leaves: '#3d5c3d'
        },
        1: { // Night
            sky: ['#0f0c29', '#1a1a3e', '#24243e', '#2d1b4e'],
            ground: '#1a1a2e',
            treeTrunk: '#2d2d3d',
            leaves: '#1a2a1a'
        },
        2: { // Sunrise
            sky: ['#ff9a9e', '#fecfef', '#ffecd2', '#fcb69f'],
            ground: '#3d2b5c',
            treeTrunk: '#5a4738',
            leaves: '#4d6c4d'
        },
        3: { // Day
            sky: ['#74b9ff', '#81ecec', '#a8e6cf', '#dfe6e9'],
            ground: '#228B22',
            treeTrunk: '#6a5738',
            leaves: '#5d8c5d'
        }
    },

    init() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Generate willow trees
        this.generateTrees();
        this.generateStars();

        // Event listeners
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        this.canvas.addEventListener('click', () => this.cycleTime());

        // Start animation
        this.animate();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateTrees();
    },

    generateTrees() {
        this.willowTrees = [];
        const numTrees = Math.floor(this.canvas.width / 300) + 2;

        for (let i = 0; i < numTrees; i++) {
            const x = (i / (numTrees - 1)) * this.canvas.width;
            const side = i % 2 === 0 ? -1 : 1;

            this.willowTrees.push({
                x: x + (Math.random() - 0.5) * 100,
                y: this.canvas.height,
                height: 200 + Math.random() * 150,
                branches: this.generateBranches(15 + Math.floor(Math.random() * 10)),
                side
            });
        }
    },

    generateBranches(count) {
        const branches = [];
        for (let i = 0; i < count; i++) {
            branches.push({
                angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.2,
                length: 80 + Math.random() * 120,
                droop: 0.3 + Math.random() * 0.5,
                swayOffset: Math.random() * Math.PI * 2,
                swaySpeed: 0.5 + Math.random() * 0.5
            });
        }
        return branches;
    },

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.7,
                size: 0.5 + Math.random() * 2,
                twinkleOffset: Math.random() * Math.PI * 2,
                twinkleSpeed: 1 + Math.random() * 2
            });
        }
    },

    cycleTime() {
        this.targetTime = (this.timeOfDay + 1) % 4;
        this.transitionProgress = 0;
        AudioManager.playEffect('click');
    },

    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);

        return `rgb(${r}, ${g}, ${b})`;
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },

    getCurrentPalette() {
        const current = this.palettes[this.timeOfDay];
        const target = this.palettes[this.targetTime];
        const t = this.transitionProgress;

        return {
            sky: current.sky.map((c, i) => this.lerpColor(c, target.sky[i], t)),
            ground: this.lerpColor(current.ground, target.ground, t),
            treeTrunk: this.lerpColor(current.treeTrunk, target.treeTrunk, t),
            leaves: this.lerpColor(current.leaves, target.leaves, t)
        };
    },

    drawSky(palette) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        palette.sky.forEach((color, i) => {
            gradient.addColorStop(i / (palette.sky.length - 1), color);
        });

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawStars(time) {
        // Only show stars at night
        const nightness = this.timeOfDay === 1 ? 1 : (this.targetTime === 1 ? this.transitionProgress : 0);
        if (nightness < 0.1) return;

        this.ctx.globalAlpha = nightness;

        this.stars.forEach(star => {
            const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
    },

    drawSun(time) {
        // Show sun during day and sunrise/sunset
        if (this.timeOfDay === 1 && this.targetTime === 1) return;

        let sunY, sunX, sunSize, sunColor;

        switch (this.timeOfDay) {
            case 0: // Sunset
                sunX = this.canvas.width * 0.8;
                sunY = this.canvas.height * 0.5;
                sunSize = 60;
                sunColor = '#ff6b35';
                break;
            case 2: // Sunrise
                sunX = this.canvas.width * 0.2;
                sunY = this.canvas.height * 0.5;
                sunSize = 50;
                sunColor = '#ff9a9e';
                break;
            case 3: // Day
                sunX = this.canvas.width * 0.7;
                sunY = this.canvas.height * 0.2;
                sunSize = 50;
                sunColor = '#ffd93d';
                break;
            default:
                return;
        }

        // Sun glow
        const gradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 3);
        gradient.addColorStop(0, sunColor + '80');
        gradient.addColorStop(0.5, sunColor + '30');
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(sunX - sunSize * 3, sunY - sunSize * 3, sunSize * 6, sunSize * 6);

        // Sun
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
        this.ctx.fillStyle = sunColor;
        this.ctx.fill();
    },

    drawGround(palette) {
        const groundHeight = this.canvas.height * 0.15;

        // Ground gradient
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height - groundHeight, 0, this.canvas.height);
        gradient.addColorStop(0, palette.ground);
        gradient.addColorStop(1, this.lerpColor(palette.ground, '#000', 0.3));

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.canvas.height - groundHeight, this.canvas.width, groundHeight);

        // Grass tufts
        this.ctx.strokeStyle = this.lerpColor(palette.ground, '#3d8c3d', 0.5);
        this.ctx.lineWidth = 2;

        for (let x = 0; x < this.canvas.width; x += 20) {
            const baseY = this.canvas.height - groundHeight + 10;
            for (let i = 0; i < 3; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(x + i * 5, baseY);
                this.ctx.quadraticCurveTo(
                    x + i * 5 + (Math.random() - 0.5) * 10,
                    baseY - 15,
                    x + i * 5 + (Math.random() - 0.5) * 5,
                    baseY - 25 - Math.random() * 10
                );
                this.ctx.stroke();
            }
        }
    },

    drawWillowTree(tree, palette, time) {
        const { x, y, height, branches } = tree;

        // Calculate wind effect based on mouse position
        const distX = this.mouseX - x;
        const distY = this.mouseY - (y - height);
        const dist = Math.sqrt(distX * distX + distY * distY);
        const windEffect = Math.max(0, 1 - dist / 300) * 0.3;

        // Draw trunk
        this.ctx.strokeStyle = palette.treeTrunk;
        this.ctx.lineWidth = 15;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.quadraticCurveTo(
            x + Math.sin(time * 0.5) * 5,
            y - height / 2,
            x,
            y - height
        );
        this.ctx.stroke();

        // Draw branches with drooping effect
        branches.forEach((branch, i) => {
            const startX = x;
            const startY = y - height + (i / branches.length) * height * 0.3;

            const sway = Math.sin(time * branch.swaySpeed + branch.swayOffset) * 10;
            const mouseWind = windEffect * (distX > 0 ? 1 : -1) * 30;

            // Main branch
            const endX = startX + Math.cos(branch.angle) * branch.length * 0.4;
            const endY = startY + Math.sin(branch.angle) * branch.length * 0.4;

            this.ctx.strokeStyle = palette.treeTrunk;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();

            // Drooping leaves (willow effect)
            this.ctx.strokeStyle = palette.leaves;
            this.ctx.lineWidth = 2;

            for (let j = 0; j < 8; j++) {
                const leafStartX = startX + (endX - startX) * (j / 8);
                const leafStartY = startY + (endY - startY) * (j / 8);

                const droopLength = branch.length * branch.droop * (0.5 + j / 8);
                const leafSway = sway * (j / 8) + mouseWind * (j / 8);

                this.ctx.beginPath();
                this.ctx.moveTo(leafStartX, leafStartY);
                this.ctx.quadraticCurveTo(
                    leafStartX + leafSway * 0.5,
                    leafStartY + droopLength * 0.5,
                    leafStartX + leafSway,
                    leafStartY + droopLength
                );
                this.ctx.stroke();
            }
        });
    },

    animate() {
        const time = performance.now() / 1000;

        // Update transition
        if (this.transitionProgress < 1) {
            this.transitionProgress = Math.min(1, this.transitionProgress + 0.02);
            if (this.transitionProgress >= 1) {
                this.timeOfDay = this.targetTime;
            }
        }

        const palette = this.getCurrentPalette();

        // Clear and draw
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawSky(palette);
        this.drawStars(time);
        this.drawSun(time);
        this.drawGround(palette);

        // Draw trees
        this.willowTrees.forEach(tree => {
            this.drawWillowTree(tree, palette, time);
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
};

// Initialize menu functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const activityMenu = document.getElementById('activity-menu');

    if (menuToggle && activityMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            activityMenu.classList.toggle('hidden');
            AudioManager.playEffect('click');
        });
    }
});
