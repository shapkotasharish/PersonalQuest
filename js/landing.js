// Landing Page - Simple Image Background
const Landing = {
    canvas: null,
    ctx: null,
    treeImage: null,
    treeImageLoaded: false,
    animationFrame: null,
    mouseX: 0,
    prevMouseX: 0,
    windForce: 0,
    windDirection: 0,
    time: 0,

    init() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Load tree image
        this.loadTreeImage();

        window.addEventListener('resize', () => this.resize());
    },

    loadTreeImage() {
        this.treeImage = new Image();
        this.treeImage.onload = () => {
            this.treeImageLoaded = true;
            this.animate();
        };
        this.treeImage.onerror = () => {
            console.error('Failed to load tree image');
            // Show a fallback gradient background
            this.drawFallbackBackground();
        };
        this.treeImage.src = 'assets/images/trees/WIllowTree.png';

        // Track mouse for subtle sway effect
        document.addEventListener('mousemove', (e) => {
            this.prevMouseX = this.mouseX;
            this.mouseX = e.clientX;

            const dx = this.mouseX - this.prevMouseX;
            this.windForce = Math.min(1, Math.abs(dx) / 50);
            this.windDirection = dx > 0 ? 1 : -1;
        });
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    drawFallbackBackground() {
        // Simple gradient fallback if image fails to load
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a0a2e');
        gradient.addColorStop(0.5, '#4a1942');
        gradient.addColorStop(1, '#2d1b4e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    animate() {
        if (!this.treeImageLoaded) return;

        this.time = performance.now() / 1000;

        // Quick decay for responsive wind
        this.windForce *= 0.5;

        const ctx = this.ctx;
        const img = this.treeImage;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate how to cover the entire canvas while maintaining aspect ratio
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image - fit to width
            drawWidth = this.canvas.width;
            drawHeight = this.canvas.width / imgRatio;
            drawX = 0;
            drawY = (this.canvas.height - drawHeight) / 2;
        } else {
            // Canvas is taller than image - fit to height
            drawHeight = this.canvas.height;
            drawWidth = this.canvas.height * imgRatio;
            drawX = (this.canvas.width - drawWidth) / 2;
            drawY = 0;
        }

        // Subtle sway based on mouse movement
        const swayAmount = this.windForce * this.windDirection * 10;
        const naturalSway = Math.sin(this.time * 0.3) * 3;

        ctx.save();

        // Apply subtle sway transform (pivot from bottom center)
        ctx.translate(this.canvas.width / 2, this.canvas.height);
        ctx.rotate((swayAmount + naturalSway) * 0.001);
        ctx.translate(-this.canvas.width / 2, -this.canvas.height);

        // Draw the image to cover the canvas
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        ctx.restore();

        // Draw a subtle heart frame around where the title would be
        this.drawHeartFrame(this.canvas.width / 2, this.canvas.height / 2 - 130, 120);

        this.animationFrame = requestAnimationFrame(() => this.animate());
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
