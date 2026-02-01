// Puzzle System - Jigsaw style with no hints
const PuzzleSystem = {
    puzzleImage: 'assets/images/puzzle/main.jpg',
    pieces: [],
    slots: [],
    draggedPiece: null,
    draggedPieceIndex: null,
    imageLoaded: false,
    loadedImage: null,

    // Jigsaw edge types: 0 = flat, 1 = tab (outward), -1 = blank (inward)
    // Each piece has edges: [top, right, bottom, left]
    pieceEdges: [],

    // Grid dimensions
    gridCols: 5,
    gridRows: 5,
    pieceWidth: 0,
    pieceHeight: 0,

    init() {
        this.generatePieceEdges();
        this.loadImage(() => {
            this.setupPuzzleFrame();
            this.setupPieces();
        });
    },

    generatePieceEdges() {
        // Generate consistent edge patterns for all pieces
        // Adjacent pieces must have complementary edges
        this.pieceEdges = [];

        // First, generate horizontal edges (between rows)
        const horizontalEdges = [];
        for (let row = 0; row < this.gridRows - 1; row++) {
            horizontalEdges[row] = [];
            for (let col = 0; col < this.gridCols; col++) {
                horizontalEdges[row][col] = Math.random() > 0.5 ? 1 : -1;
            }
        }

        // Generate vertical edges (between columns)
        const verticalEdges = [];
        for (let row = 0; row < this.gridRows; row++) {
            verticalEdges[row] = [];
            for (let col = 0; col < this.gridCols - 1; col++) {
                verticalEdges[row][col] = Math.random() > 0.5 ? 1 : -1;
            }
        }

        // Now assign edges to each piece
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                const pieceIndex = row * this.gridCols + col;

                // Top edge
                let top = 0; // Flat for top row
                if (row > 0) {
                    top = -horizontalEdges[row - 1][col]; // Complement of piece above
                }

                // Right edge
                let right = 0; // Flat for right column
                if (col < this.gridCols - 1) {
                    right = verticalEdges[row][col];
                }

                // Bottom edge
                let bottom = 0; // Flat for bottom row
                if (row < this.gridRows - 1) {
                    bottom = horizontalEdges[row][col];
                }

                // Left edge
                let left = 0; // Flat for left column
                if (col > 0) {
                    left = -verticalEdges[row][col - 1]; // Complement of piece to left
                }

                this.pieceEdges[pieceIndex] = { top, right, bottom, left };
            }
        }
    },

    loadImage(callback) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.imageLoaded = true;
            this.loadedImage = img;

            // Calculate piece dimensions based on display size
            const frameWidth = Math.min(500, window.innerWidth - 100);

            this.pieceWidth = frameWidth / this.gridCols;
            this.pieceHeight = frameWidth / this.gridRows;

            if (callback) callback();
        };
        img.onerror = () => {
            console.error('Failed to load puzzle image');
            this.imageLoaded = false;

            const frameWidth = Math.min(500, window.innerWidth - 100);
            this.pieceWidth = frameWidth / this.gridCols;
            this.pieceHeight = frameWidth / this.gridRows;

            if (callback) callback();
        };
        img.src = this.puzzleImage;
    },

    setupPuzzleFrame() {
        const frame = document.getElementById('puzzle-frame');
        if (!frame) return;

        frame.innerHTML = '';
        this.slots = [];

        // Style the frame
        const frameWidth = Math.min(500, window.innerWidth - 100);
        frame.style.width = frameWidth + 'px';
        frame.style.height = frameWidth + 'px';

        for (let i = 0; i < 25; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.dataset.index = i;

            const row = Math.floor(i / this.gridCols);
            const col = i % this.gridCols;
            const edges = this.pieceEdges[i];

            // Check if this slot already has a piece
            if (GameState.puzzle.placed.includes(i)) {
                slot.classList.add('filled');
                const canvas = this.createPieceCanvas(i, row, col, edges, true);
                slot.appendChild(canvas);
            } else {
                // Draw slot outline showing expected shape
                slot.appendChild(this.createSlotOutline(edges));
            }

            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e, i));

            frame.appendChild(slot);
            this.slots.push(slot);
        }
    },

    createSlotOutline(edges) {
        const canvas = document.createElement('canvas');
        const size = this.pieceWidth || 80;
        const tabSize = size * 0.2;
        canvas.width = size + tabSize * 2;
        canvas.height = size + tabSize * 2;
        canvas.className = 'slot-outline';

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'rgba(255, 107, 157, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        this.drawPiecePath(ctx, tabSize, tabSize, size, size, edges, tabSize);
        ctx.stroke();

        return canvas;
    },

    setupPieces() {
        const container = document.getElementById('available-pieces');
        if (!container) return;

        container.innerHTML = '';
        this.pieces = [];

        // Get pieces that are unlocked but not placed
        const unlockedPieces = GameState.puzzle.unlocked || [];
        const availablePieces = unlockedPieces.filter(
            pieceIndex => !GameState.puzzle.placed.includes(pieceIndex)
        );

        if (availablePieces.length === 0) {
            if (unlockedPieces.length === 0 || GameState.puzzle.collected === 0) {
                container.innerHTML = '<p class="no-pieces">Complete activities to earn puzzle pieces!</p>';
            } else {
                container.innerHTML = '<p class="no-pieces">All available pieces placed! Complete more activities for more pieces.</p>';
            }
            return;
        }

        // Shuffle available pieces for display
        const shuffledPieces = [...availablePieces].sort(() => Math.random() - 0.5);

        shuffledPieces.forEach(pieceIndex => {
            const row = Math.floor(pieceIndex / this.gridCols);
            const col = pieceIndex % this.gridCols;
            const edges = this.pieceEdges[pieceIndex];

            const pieceContainer = document.createElement('div');
            pieceContainer.className = 'puzzle-piece-container';
            pieceContainer.dataset.index = pieceIndex;
            pieceContainer.draggable = true;

            const canvas = this.createPieceCanvas(pieceIndex, row, col, edges, false);
            pieceContainer.appendChild(canvas);

            pieceContainer.addEventListener('dragstart', (e) => this.handleDragStart(e, pieceIndex));
            pieceContainer.addEventListener('dragend', (e) => this.handleDragEnd(e));

            // Touch support
            pieceContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e, pieceIndex), { passive: false });
            pieceContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            pieceContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e));

            container.appendChild(pieceContainer);
            this.pieces.push({ element: pieceContainer, index: pieceIndex });
        });
    },

    createPieceCanvas(pieceIndex, row, col, edges, isPlaced) {
        const canvas = document.createElement('canvas');
        const size = this.pieceWidth || 80;
        const tabSize = size * 0.2;

        canvas.width = size + tabSize * 2;
        canvas.height = size + tabSize * 2;
        canvas.className = isPlaced ? 'placed-piece-canvas' : 'piece-canvas';

        const ctx = canvas.getContext('2d');

        // Create clipping path for jigsaw shape
        ctx.save();
        this.drawPiecePath(ctx, tabSize, tabSize, size, size, edges, tabSize);
        ctx.clip();

        // Draw the image portion
        if (this.imageLoaded && this.loadedImage) {
            const imgPieceWidth = this.loadedImage.width / this.gridCols;
            const imgPieceHeight = this.loadedImage.height / this.gridRows;

            ctx.drawImage(
                this.loadedImage,
                col * imgPieceWidth,
                row * imgPieceHeight,
                imgPieceWidth,
                imgPieceHeight,
                tabSize,
                tabSize,
                size,
                size
            );
        } else {
            // Fallback - colored piece
            const hue = (pieceIndex * 14) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw piece number for debugging
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pieceIndex + 1, canvas.width / 2, canvas.height / 2);
        }

        ctx.restore();

        // Draw outline
        ctx.strokeStyle = isPlaced ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 107, 157, 0.8)';
        ctx.lineWidth = isPlaced ? 1 : 2;
        this.drawPiecePath(ctx, tabSize, tabSize, size, size, edges, tabSize);
        ctx.stroke();

        return canvas;
    },

    drawPiecePath(ctx, x, y, width, height, edges, tabSize) {
        ctx.beginPath();

        // Start at top-left
        ctx.moveTo(x, y);

        // Top edge
        if (edges.top === 0) {
            ctx.lineTo(x + width, y);
        } else {
            ctx.lineTo(x + width * 0.35, y);
            if (edges.top === 1) {
                // Tab outward
                ctx.bezierCurveTo(
                    x + width * 0.35, y - tabSize * 0.5,
                    x + width * 0.35, y - tabSize,
                    x + width * 0.5, y - tabSize
                );
                ctx.bezierCurveTo(
                    x + width * 0.65, y - tabSize,
                    x + width * 0.65, y - tabSize * 0.5,
                    x + width * 0.65, y
                );
            } else {
                // Blank inward
                ctx.bezierCurveTo(
                    x + width * 0.35, y + tabSize * 0.5,
                    x + width * 0.35, y + tabSize,
                    x + width * 0.5, y + tabSize
                );
                ctx.bezierCurveTo(
                    x + width * 0.65, y + tabSize,
                    x + width * 0.65, y + tabSize * 0.5,
                    x + width * 0.65, y
                );
            }
            ctx.lineTo(x + width, y);
        }

        // Right edge
        if (edges.right === 0) {
            ctx.lineTo(x + width, y + height);
        } else {
            ctx.lineTo(x + width, y + height * 0.35);
            if (edges.right === 1) {
                ctx.bezierCurveTo(
                    x + width + tabSize * 0.5, y + height * 0.35,
                    x + width + tabSize, y + height * 0.35,
                    x + width + tabSize, y + height * 0.5
                );
                ctx.bezierCurveTo(
                    x + width + tabSize, y + height * 0.65,
                    x + width + tabSize * 0.5, y + height * 0.65,
                    x + width, y + height * 0.65
                );
            } else {
                ctx.bezierCurveTo(
                    x + width - tabSize * 0.5, y + height * 0.35,
                    x + width - tabSize, y + height * 0.35,
                    x + width - tabSize, y + height * 0.5
                );
                ctx.bezierCurveTo(
                    x + width - tabSize, y + height * 0.65,
                    x + width - tabSize * 0.5, y + height * 0.65,
                    x + width, y + height * 0.65
                );
            }
            ctx.lineTo(x + width, y + height);
        }

        // Bottom edge (drawn right to left)
        if (edges.bottom === 0) {
            ctx.lineTo(x, y + height);
        } else {
            ctx.lineTo(x + width * 0.65, y + height);
            if (edges.bottom === 1) {
                ctx.bezierCurveTo(
                    x + width * 0.65, y + height + tabSize * 0.5,
                    x + width * 0.65, y + height + tabSize,
                    x + width * 0.5, y + height + tabSize
                );
                ctx.bezierCurveTo(
                    x + width * 0.35, y + height + tabSize,
                    x + width * 0.35, y + height + tabSize * 0.5,
                    x + width * 0.35, y + height
                );
            } else {
                ctx.bezierCurveTo(
                    x + width * 0.65, y + height - tabSize * 0.5,
                    x + width * 0.65, y + height - tabSize,
                    x + width * 0.5, y + height - tabSize
                );
                ctx.bezierCurveTo(
                    x + width * 0.35, y + height - tabSize,
                    x + width * 0.35, y + height - tabSize * 0.5,
                    x + width * 0.35, y + height
                );
            }
            ctx.lineTo(x, y + height);
        }

        // Left edge (drawn bottom to top)
        if (edges.left === 0) {
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y + height * 0.65);
            if (edges.left === 1) {
                ctx.bezierCurveTo(
                    x - tabSize * 0.5, y + height * 0.65,
                    x - tabSize, y + height * 0.65,
                    x - tabSize, y + height * 0.5
                );
                ctx.bezierCurveTo(
                    x - tabSize, y + height * 0.35,
                    x - tabSize * 0.5, y + height * 0.35,
                    x, y + height * 0.35
                );
            } else {
                ctx.bezierCurveTo(
                    x + tabSize * 0.5, y + height * 0.65,
                    x + tabSize, y + height * 0.65,
                    x + tabSize, y + height * 0.5
                );
                ctx.bezierCurveTo(
                    x + tabSize, y + height * 0.35,
                    x + tabSize * 0.5, y + height * 0.35,
                    x, y + height * 0.35
                );
            }
            ctx.lineTo(x, y);
        }

        ctx.closePath();
    },

    handleDragStart(e, index) {
        this.draggedPiece = e.currentTarget;
        this.draggedPieceIndex = index;
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);

        // NO highlighting of correct slot - user must figure it out by shape!
    },

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        this.draggedPiece = null;
        this.draggedPieceIndex = null;
    },

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    handleDrop(e, slotIndex) {
        e.preventDefault();

        if (this.draggedPieceIndex === null) return;

        // Check if this is the correct slot for this piece
        if (this.draggedPieceIndex === slotIndex) {
            this.placePiece(this.draggedPieceIndex, slotIndex);
        } else {
            // Wrong slot - bounce back with feedback
            AudioManager.playEffect('miss');
            if (this.draggedPiece) {
                Animations.shake(this.draggedPiece);
            }
        }
    },

    // Touch support
    handleTouchStart(e, index) {
        e.preventDefault();
        this.draggedPiece = e.currentTarget;
        this.draggedPieceIndex = index;
        e.currentTarget.classList.add('dragging');
    },

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.draggedPiece) return;

        const touch = e.touches[0];
        const element = this.draggedPiece;

        element.style.position = 'fixed';
        element.style.left = (touch.clientX - 50) + 'px';
        element.style.top = (touch.clientY - 50) + 'px';
        element.style.zIndex = '1000';
    },

    handleTouchEnd(e) {
        if (!this.draggedPiece) return;

        const element = this.draggedPiece;
        element.classList.remove('dragging');
        element.style.position = '';
        element.style.left = '';
        element.style.top = '';
        element.style.zIndex = '';

        // Find slot under touch point
        const touch = e.changedTouches[0];
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);

        let slotElement = elementAtPoint;
        // Walk up to find slot if we hit a child element
        while (slotElement && !slotElement.classList.contains('puzzle-slot')) {
            slotElement = slotElement.parentElement;
        }

        if (slotElement && slotElement.classList.contains('puzzle-slot')) {
            const slotIndex = parseInt(slotElement.dataset.index);
            if (this.draggedPieceIndex === slotIndex) {
                this.placePiece(this.draggedPieceIndex, slotIndex);
            } else {
                AudioManager.playEffect('miss');
                Animations.shake(element);
            }
        }

        this.draggedPiece = null;
        this.draggedPieceIndex = null;
    },

    placePiece(pieceIndex, slotIndex) {
        AudioManager.playEffect('success');

        const result = GameState.placePiece(pieceIndex, slotIndex);

        // Update slot visual
        const slot = this.slots[slotIndex];
        slot.classList.add('filled');
        slot.innerHTML = '';

        const row = Math.floor(pieceIndex / this.gridCols);
        const col = pieceIndex % this.gridCols;
        const edges = this.pieceEdges[pieceIndex];

        const canvas = this.createPieceCanvas(pieceIndex, row, col, edges, true);
        slot.appendChild(canvas);

        // Add placement animation
        slot.classList.add('just-placed');
        setTimeout(() => slot.classList.remove('just-placed'), 500);

        // Remove piece from available
        const pieceElement = document.querySelector(`.puzzle-piece-container[data-index="${pieceIndex}"]`);
        if (pieceElement) {
            pieceElement.remove();
        }

        // Update progress display
        const progressEl = document.getElementById('puzzle-progress');
        if (progressEl) {
            progressEl.textContent = GameState.puzzle.placed.length;
        }

        // Check if puzzle is complete
        if (result === 'complete') {
            this.onPuzzleComplete();
        }

        // Check if no more pieces available
        const container = document.getElementById('available-pieces');
        if (container && container.querySelectorAll('.puzzle-piece-container').length === 0) {
            const remainingToUnlock = 25 - (GameState.puzzle.unlocked ? GameState.puzzle.unlocked.length : GameState.puzzle.collected);
            if (remainingToUnlock > 0) {
                container.innerHTML = '<p class="no-pieces">All available pieces placed! Complete more activities for more pieces.</p>';
            }
        }
    },

    onPuzzleComplete() {
        AudioManager.playEffect('celebration');

        // Trigger final reveal
        setTimeout(() => {
            window.App.showFinale();
        }, 1500);
    },

    refresh() {
        this.generatePieceEdges();
        this.setupPuzzleFrame();
        this.setupPieces();
    }
};
