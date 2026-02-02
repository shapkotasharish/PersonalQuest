// Landing Page - Photorealistic Interactive Background
const Landing = {
    canvas: null,
    ctx: null,
    timeOfDay: 0, // 0: sunset, 1: night, 2: sunrise, 3: day
    targetTime: 0,
    transitionProgress: 1,
    willowTrees: [],
    stars: [],
    clouds: [],
    mouseX: 0,
    mouseY: 0,
    prevMouseX: 0,
    prevMouseY: 0,
    windForce: 0,
    windDirection: 0,
    animationFrame: null,
    time: 0,

    // Tree image
    treeImage: null,
    treeImageLoaded: false,

    // Photorealistic color palettes
    palettes: {
        0: { // Sunset
            skyTop: '#1a0a2e',
            skyMid1: '#4a1942',
            skyMid2: '#c94b4b',
            skyMid3: '#f4a460',
            skyBottom: '#ffcc66',
            sun: { color: '#ff6b35', glow: '#ff8c42', y: 0.65 },
            ground: '#1a1a2e',
            water: '#2d1b4e',
            ambient: 0.7
        },
        1: { // Night
            skyTop: '#0a0a15',
            skyMid1: '#0f0f25',
            skyMid2: '#141430',
            skyMid3: '#1a1a3e',
            skyBottom: '#1f1f4a',
            sun: null,
            ground: '#0a0a15',
            water: '#0f0f25',
            ambient: 0.2
        },
        2: { // Sunrise
            skyTop: '#1a1a3e',
            skyMid1: '#4a3f6b',
            skyMid2: '#ff9a9e',
            skyMid3: '#ffecd2',
            skyBottom: '#fcb69f',
            sun: { color: '#ff9a9e', glow: '#ffecd2', y: 0.7 },
            ground: '#2a2a3e',
            water: '#3a2a4e',
            ambient: 0.5
        },
        3: { // Day
            skyTop: '#1e90ff',
            skyMid1: '#4aa8ff',
            skyMid2: '#87ceeb',
            skyMid3: '#b0e0e6',
            skyBottom: '#e0f4ff',
            sun: { color: '#fff5c0', glow: '#fffacd', y: 0.2 },
            ground: '#2d4a2d',
            water: '#4a7a8a',
            ambient: 1.0
        }
    },

    init() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Load tree image
        this.loadTreeImage();

        this.generateTrees();
        this.generateStars();
        this.generateClouds();

        window.addEventListener('resize', () => this.resize());
    },

    loadTreeImage() {
        this.treeImage = new Image();
        this.treeImage.onload = () => {
            this.treeImageLoaded = true;
        };
        this.treeImage.src = 'assets/images/trees/WIllowTree.png';

        // Track mouse for wind effect
        document.addEventListener('mousemove', (e) => {
            this.prevMouseX = this.mouseX;
            this.prevMouseY = this.mouseY;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Calculate wind from mouse movement
            const dx = this.mouseX - this.prevMouseX;
            this.windForce = Math.min(1, Math.abs(dx) / 50);
            this.windDirection = dx > 0 ? 1 : -1;
        });

        this.canvas.addEventListener('click', () => this.cycleTime());
        this.animate();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateTrees();
    },

    generateTrees() {
        this.willowTrees = [];
        const numTrees = 8;

        // Trees on both sides
        for (let i = 0; i < numTrees; i++) {
            const side = i < numTrees / 2 ? 'left' : 'right';
            const index = side === 'left' ? i : i - numTrees / 2;
            const spacing = (this.canvas.width * 0.3) / (numTrees / 2);

            let x;
            if (side === 'left') {
                x = -50 + index * spacing + Math.random() * 50;
            } else {
                x = this.canvas.width - 50 - index * spacing - Math.random() * 50;
            }

            const baseHeight = this.canvas.height * 0.5;
            const height = baseHeight + Math.random() * this.canvas.height * 0.2;

            this.willowTrees.push({
                x: x,
                y: this.canvas.height,
                height: height,
                trunkWidth: 15 + Math.random() * 10,
                branches: this.generateBranches(25 + Math.floor(Math.random() * 15)),
                swayOffset: Math.random() * Math.PI * 2,
                depth: 0.5 + Math.random() * 0.5 // For parallax
            });
        }

        // Sort by depth for proper layering
        this.willowTrees.sort((a, b) => a.depth - b.depth);
    },

    generateBranches(count) {
        const branches = [];
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
            branches.push({
                angle: angle,
                length: 60 + Math.random() * 100,
                droop: 0.4 + Math.random() * 0.6,
                thickness: 1 + Math.random() * 2,
                strands: this.generateStrands(8 + Math.floor(Math.random() * 8)),
                swayOffset: Math.random() * Math.PI * 2,
                swaySpeed: 0.3 + Math.random() * 0.4
            });
        }
        return branches;
    },

    generateStrands(count) {
        const strands = [];
        for (let i = 0; i < count; i++) {
            strands.push({
                length: 40 + Math.random() * 80,
                swayOffset: Math.random() * Math.PI * 2,
                swayAmount: 0.5 + Math.random() * 0.5
            });
        }
        return strands;
    },

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 300; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.6,
                size: 0.3 + Math.random() * 2,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 2
            });
        }
    },

    generateClouds() {
        this.clouds = [];
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height * (0.1 + Math.random() * 0.3),
                width: 100 + Math.random() * 200,
                height: 40 + Math.random() * 60,
                speed: 0.1 + Math.random() * 0.2,
                opacity: 0.3 + Math.random() * 0.4
            });
        }
    },

    cycleTime() {
        this.targetTime = (this.timeOfDay + 1) % 4;
        this.transitionProgress = 0;
        AudioManager.playEffect('click');
    },

    lerp(a, b, t) {
        return a + (b - a) * t;
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

    colorWithAlpha(color, alpha) {
        // Handle RGB format: rgb(r, g, b)
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
        }
        // Handle hex format: #rrggbb
        const rgb = this.hexToRgb(color);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    },

    getCurrentPalette() {
        const current = this.palettes[this.timeOfDay];
        const target = this.palettes[this.targetTime];
        const t = this.transitionProgress;

        return {
            skyTop: this.lerpColor(current.skyTop, target.skyTop, t),
            skyMid1: this.lerpColor(current.skyMid1, target.skyMid1, t),
            skyMid2: this.lerpColor(current.skyMid2, target.skyMid2, t),
            skyMid3: this.lerpColor(current.skyMid3, target.skyMid3, t),
            skyBottom: this.lerpColor(current.skyBottom, target.skyBottom, t),
            ground: this.lerpColor(current.ground, target.ground, t),
            water: this.lerpColor(current.water, target.water, t),
            ambient: this.lerp(current.ambient, target.ambient, t),
            sun: current.sun && target.sun ? {
                color: this.lerpColor(current.sun.color, target.sun.color, t),
                glow: this.lerpColor(current.sun.glow, target.sun.glow, t),
                y: this.lerp(current.sun.y, target.sun.y, t)
            } : (current.sun || target.sun)
        };
    },

    drawSky(palette) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.7);
        gradient.addColorStop(0, palette.skyTop);
        gradient.addColorStop(0.25, palette.skyMid1);
        gradient.addColorStop(0.5, palette.skyMid2);
        gradient.addColorStop(0.75, palette.skyMid3);
        gradient.addColorStop(1, palette.skyBottom);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawSun(palette) {
        if (!palette.sun) return;

        const sunX = this.canvas.width * 0.5;
        const sunY = this.canvas.height * palette.sun.y;
        const sunRadius = 50;

        // Large glow
        const glowGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 8);
        glowGradient.addColorStop(0, this.colorWithAlpha(palette.sun.glow, 0.38));
        glowGradient.addColorStop(0.3, this.colorWithAlpha(palette.sun.glow, 0.19));
        glowGradient.addColorStop(0.6, this.colorWithAlpha(palette.sun.glow, 0.06));
        glowGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sun body
        const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
        sunGradient.addColorStop(0, '#ffffff');
        sunGradient.addColorStop(0.3, palette.sun.color);
        sunGradient.addColorStop(1, palette.sun.glow);

        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = sunGradient;
        this.ctx.fill();
    },

    drawStars() {
        const nightness = this.timeOfDay === 1 ? 1 : (this.targetTime === 1 ? this.transitionProgress :
                         (this.timeOfDay === 1 ? 1 - this.transitionProgress : 0));
        if (nightness < 0.1) return;

        this.stars.forEach(star => {
            const twinkle = 0.3 + 0.7 * Math.sin(this.time * star.speed + star.twinkle);

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${nightness * twinkle})`;
            this.ctx.fill();
        });
    },

    drawClouds(palette) {
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
            }

            this.ctx.save();
            this.ctx.globalAlpha = cloud.opacity * palette.ambient;

            // Draw fluffy cloud shape
            const gradient = this.ctx.createRadialGradient(
                cloud.x + cloud.width / 2, cloud.y,
                0, cloud.x + cloud.width / 2, cloud.y, cloud.width / 2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            for (let i = 0; i < 5; i++) {
                const offsetX = (i - 2) * cloud.width * 0.2;
                const offsetY = Math.sin(i * 1.5) * cloud.height * 0.3;
                const radius = cloud.height * (0.4 + Math.random() * 0.2);

                this.ctx.beginPath();
                this.ctx.arc(cloud.x + cloud.width / 2 + offsetX, cloud.y + offsetY, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }

            this.ctx.restore();
        });
    },

    drawWater(palette) {
        const waterY = this.canvas.height * 0.75;
        const waterHeight = this.canvas.height * 0.25;

        // Water gradient
        const gradient = this.ctx.createLinearGradient(0, waterY, 0, this.canvas.height);
        gradient.addColorStop(0, palette.water);
        gradient.addColorStop(1, palette.ground);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, waterY, this.canvas.width, waterHeight);

        // Water reflections/ripples
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < 20; i++) {
            const y = waterY + 20 + i * 10;
            const amplitude = 2 + Math.sin(this.time + i) * 2;

            this.ctx.beginPath();
            this.ctx.moveTo(0, y);

            for (let x = 0; x < this.canvas.width; x += 20) {
                const waveY = y + Math.sin((x + this.time * 50) * 0.02) * amplitude;
                this.ctx.lineTo(x, waveY);
            }

            this.ctx.stroke();
        }
    },

    drawGround(palette) {
        const groundY = this.canvas.height * 0.85;

        // Ground/shore
        const gradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
        gradient.addColorStop(0, palette.ground);
        gradient.addColorStop(1, '#000');

        this.ctx.fillStyle = gradient;

        // Curved shoreline
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.lineTo(0, groundY);

        for (let x = 0; x <= this.canvas.width; x += 50) {
            const y = groundY + Math.sin(x * 0.01 + this.time * 0.5) * 10;
            this.ctx.lineTo(x, y);
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
    },

    drawWillowTree(tree, palette) {
        const { x, y, height, trunkWidth, branches, swayOffset, depth } = tree;

        // Calculate wind effect on this tree
        const distToMouse = Math.abs(this.mouseX - x);
        const localWind = this.windForce * Math.max(0, 1 - distToMouse / 300) * this.windDirection;
        const globalWind = Math.sin(this.time * 0.5 + swayOffset) * 0.1;
        const totalWind = localWind + globalWind;

        // Trunk color based on depth and lighting
        const trunkDarkness = 0.3 + depth * 0.3;
        this.ctx.strokeStyle = `rgba(62, 44, 30, ${trunkDarkness + palette.ambient * 0.3})`;
        this.ctx.lineWidth = trunkWidth * depth;
        this.ctx.lineCap = 'round';

        // Draw curved trunk
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        const trunkCurve = totalWind * 20;
        this.ctx.bezierCurveTo(
            x + trunkCurve * 0.3, y - height * 0.3,
            x + trunkCurve * 0.7, y - height * 0.6,
            x + trunkCurve, y - height
        );
        this.ctx.stroke();

        // Draw branches
        branches.forEach((branch, branchIndex) => {
            const branchStartY = y - height + (branchIndex / branches.length) * height * 0.4;
            const branchStartX = x + trunkCurve * (1 - branchIndex / branches.length);

            const branchSway = Math.sin(this.time * branch.swaySpeed + branch.swayOffset) * 5 + totalWind * 30;

            // Branch line
            const branchEndX = branchStartX + Math.cos(branch.angle) * branch.length * 0.5 + branchSway * 0.3;
            const branchEndY = branchStartY + Math.sin(branch.angle) * branch.length * 0.5;

            this.ctx.strokeStyle = `rgba(62, 44, 30, ${trunkDarkness * 0.8})`;
            this.ctx.lineWidth = branch.thickness * depth;
            this.ctx.beginPath();
            this.ctx.moveTo(branchStartX, branchStartY);
            this.ctx.lineTo(branchEndX, branchEndY);
            this.ctx.stroke();

            // Draw hanging strands (willow effect)
            branch.strands.forEach((strand, strandIndex) => {
                const strandStartX = branchStartX + (branchEndX - branchStartX) * (strandIndex / branch.strands.length);
                const strandStartY = branchStartY + (branchEndY - branchStartY) * (strandIndex / branch.strands.length);

                const strandSway = branchSway * strand.swayAmount +
                    Math.sin(this.time * 2 + strand.swayOffset) * 3 +
                    totalWind * 40 * strand.swayAmount;

                // Gradient for leaves
                const leafGradient = this.ctx.createLinearGradient(
                    strandStartX, strandStartY,
                    strandStartX, strandStartY + strand.length
                );

                const leafAlpha = (0.4 + palette.ambient * 0.4) * depth;
                leafGradient.addColorStop(0, `rgba(34, 85, 34, ${leafAlpha})`);
                leafGradient.addColorStop(0.5, `rgba(50, 120, 50, ${leafAlpha})`);
                leafGradient.addColorStop(1, `rgba(34, 85, 34, ${leafAlpha * 0.5})`);

                this.ctx.strokeStyle = leafGradient;
                this.ctx.lineWidth = 2 * depth;
                this.ctx.beginPath();
                this.ctx.moveTo(strandStartX, strandStartY);

                // Curved drooping strand
                this.ctx.bezierCurveTo(
                    strandStartX + strandSway * 0.3, strandStartY + strand.length * 0.3,
                    strandStartX + strandSway * 0.7, strandStartY + strand.length * 0.6,
                    strandStartX + strandSway, strandStartY + strand.length
                );
                this.ctx.stroke();
            });
        });
    },

    drawHeartFrame(x, y, size) {
        this.ctx.save();

        // Glowing heart outline
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.shadowBlur = 30;
        this.ctx.strokeStyle = '#ff6b9d';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size * 0.3);

        // Left curve
        this.ctx.bezierCurveTo(
            x - size * 0.5, y - size * 0.3,
            x - size, y + size * 0.3,
            x, y + size
        );

        // Right curve
        this.ctx.bezierCurveTo(
            x + size, y + size * 0.3,
            x + size * 0.5, y - size * 0.3,
            x, y + size * 0.3
        );

        this.ctx.stroke();

        // Inner glow
        this.ctx.shadowBlur = 50;
        this.ctx.strokeStyle = 'rgba(255, 107, 157, 0.5)';
        this.ctx.stroke();

        this.ctx.restore();
    },

    animate() {
        this.time = performance.now() / 1000;

        // Update transition
        if (this.transitionProgress < 1) {
            this.transitionProgress = Math.min(1, this.transitionProgress + 0.015);
            if (this.transitionProgress >= 1) {
                this.timeOfDay = this.targetTime;
            }
        }

        // Fast decay for instant wind response (was 0.95, now 0.5 for responsiveness)
        this.windForce *= 0.5;

        const palette = this.getCurrentPalette();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawSky(palette);
        this.drawSun(palette);
        this.drawStars();
        this.drawClouds(palette);
        this.drawWater(palette);
        this.drawGround(palette);

        // Draw procedural willow trees (sorted by depth)
        this.willowTrees.forEach(tree => {
            this.drawWillowTree(tree, palette);
        });

        // Draw tree images on top
        this.drawTreeImages(palette);

        // Draw heart around title area
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2 - 50;
        this.drawHeartFrame(centerX, centerY - 80, 120);

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    drawTreeImages(palette) {
        if (!this.treeImageLoaded || !this.treeImage) return;

        const ctx = this.ctx;
        const img = this.treeImage;

        // Calculate tree dimensions to fill height
        const treeHeight = this.canvas.height * 1.1;
        const aspectRatio = img.width / img.height;
        const treeWidth = treeHeight * aspectRatio;

        // Apply ambient lighting based on time of day
        ctx.globalAlpha = 0.9;

        // Calculate sway based on wind
        const swayAmount = this.windForce * this.windDirection * 20;
        const naturalSway = Math.sin(this.time * 0.5) * 5;

        // Draw tree on the LEFT side
        ctx.save();
        ctx.translate(0, this.canvas.height);
        ctx.scale(1, -1); // Flip for proper orientation if needed
        ctx.scale(-1, 1); // Mirror for left side
        ctx.translate(-treeWidth * 0.7, 0);

        // Apply sway transform
        ctx.translate(treeWidth / 2, treeHeight);
        ctx.rotate((swayAmount + naturalSway) * 0.002);
        ctx.translate(-treeWidth / 2, -treeHeight);

        ctx.scale(1, -1); // Flip back
        ctx.translate(0, -this.canvas.height);
        ctx.drawImage(img, 0, this.canvas.height - treeHeight, treeWidth, treeHeight);
        ctx.restore();

        // Draw tree on the RIGHT side
        ctx.save();
        ctx.translate(this.canvas.width - treeWidth * 0.7, 0);

        // Apply sway transform
        ctx.translate(treeWidth / 2, this.canvas.height);
        ctx.rotate(-(swayAmount + naturalSway) * 0.002);
        ctx.translate(-treeWidth / 2, -this.canvas.height);

        ctx.drawImage(img, 0, this.canvas.height - treeHeight, treeWidth, treeHeight);
        ctx.restore();

        ctx.globalAlpha = 1;
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

    // Reset all progress button
    const resetAllBtn = document.getElementById('reset-all-btn');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset ALL progress? This will:\n\n- Clear all completed activities\n- Remove all puzzle pieces\n- Reset everything to the beginning\n\nThis cannot be undone!')) {
                GameState.reset();
                AudioManager.playEffect('click');

                // Remove completed classes from activity items
                document.querySelectorAll('.activity-item').forEach(item => {
                    item.classList.remove('completed');
                });

                // Regenerate puzzle piece edges for a fresh puzzle
                if (typeof PuzzleSystem !== 'undefined') {
                    PuzzleSystem.generatePieceEdges();
                }

                alert('All progress has been reset!');
            }
        });
    }
});
