// Landing Page - Full Screen Willow Tree Background
const Landing = {
    canvas: null,
    ctx: null,
    treeImage: null,
    treeImageLoaded: false,

    init() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Load tree image
        this.loadTreeImage();

        window.addEventListener('resize', () => {
            this.resize();
            this.draw();
        });
    },

    loadTreeImage() {
        this.treeImage = new Image();
        this.treeImage.onload = () => {
            this.treeImageLoaded = true;
            this.draw();
        };
        this.treeImage.onerror = () => {
            console.error('Failed to load tree image');
            this.drawFallbackBackground();
        };
        this.treeImage.src = 'assets/images/trees/WIllowTree.png';
    },

    resize() {
        // Use the full viewport dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    drawFallbackBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a0a2e');
        gradient.addColorStop(0.5, '#4a1942');
        gradient.addColorStop(1, '#2d1b4e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    draw() {
        const ctx = this.ctx;

        // Always fill with a dark background first to prevent any white space
        ctx.fillStyle = '#1a0a2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.treeImageLoaded) return;

        const img = this.treeImage;

        // COVER mode: Scale image to completely cover the canvas (no empty space)
        // This means the image will be cropped if aspect ratios don't match
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image - fit to width, crop top/bottom
            drawWidth = this.canvas.width;
            drawHeight = this.canvas.width / imgRatio;
        } else {
            // Canvas is taller than image - fit to height, crop left/right
            drawHeight = this.canvas.height;
            drawWidth = this.canvas.height * imgRatio;
        }

        // Center the image
        drawX = (this.canvas.width - drawWidth) / 2;
        drawY = (this.canvas.height - drawHeight) / 2;

        // Draw the image covering the entire canvas
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    },

    destroy() {
        // Nothing to clean up now
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
