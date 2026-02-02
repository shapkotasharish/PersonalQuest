// Landing Page - Simple Image Background
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
        if (!this.treeImageLoaded) return;

        const ctx = this.ctx;
        const img = this.treeImage;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fill entire screen with the image - scale to cover
        // Calculate scaling to cover the entire canvas
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider - fit to width
            drawWidth = this.canvas.width;
            drawHeight = this.canvas.width / imgRatio;
            drawX = 0;
            drawY = (this.canvas.height - drawHeight) / 2;
        } else {
            // Canvas is taller - fit to height
            drawHeight = this.canvas.height;
            drawWidth = this.canvas.height * imgRatio;
            drawX = (this.canvas.width - drawWidth) / 2;
            drawY = 0;
        }

        // Draw the image centered and covering the entire canvas
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
