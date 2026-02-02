// Puzzle System - Simple grid with even sides (5 columns x 4 rows = 20 pieces)
const PuzzleSystem = {
    puzzleImage: 'assets/images/puzzle/main.jpg',
    pieces: [],
    slots: [],
    draggedPiece: null,
    draggedPieceIndex: null,
    imageLoaded: false,
    loadedImage: null,

    // Grid dimensions - 5 columns x 4 rows = 20 pieces
    gridCols: 5,
    gridRows: 4,
    pieceWidth: 0,
    pieceHeight: 0,

    init() {
        this.loadImage(() => {
            this.setupPuzzleFrame();
            this.setupPieces();
        });
    },

    loadImage(callback) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.imageLoaded = true;
            this.loadedImage = img;

            // Calculate piece dimensions based on display size
            const frameWidth = Math.min(500, window.innerWidth - 100);
            const frameHeight = frameWidth * (this.gridRows / this.gridCols);

            this.pieceWidth = frameWidth / this.gridCols;
            this.pieceHeight = frameHeight / this.gridRows;

            if (callback) callback();
        };
        img.onerror = () => {
            console.error('Failed to load puzzle image');
            this.imageLoaded = false;

            const frameWidth = Math.min(500, window.innerWidth - 100);
            const frameHeight = frameWidth * (this.gridRows / this.gridCols);
            this.pieceWidth = frameWidth / this.gridCols;
            this.pieceHeight = frameHeight / this.gridRows;

            if (callback) callback();
        };
        img.src = this.puzzleImage;
    },

    setupPuzzleFrame() {
        const frame = document.getElementById('puzzle-frame');
        if (!frame) return;

        frame.innerHTML = '';
        this.slots = [];

        // Style the frame - 5 columns x 4 rows
        const frameWidth = Math.min(500, window.innerWidth - 100);
        const frameHeight = frameWidth * (this.gridRows / this.gridCols);
        frame.style.width = frameWidth + 'px';
        frame.style.height = frameHeight + 'px';
        frame.style.gridTemplateColumns = `repeat(${this.gridCols}, 1fr)`;
        frame.style.gridTemplateRows = `repeat(${this.gridRows}, 1fr)`;

        const totalPieces = this.gridCols * this.gridRows;

        for (let i = 0; i < totalPieces; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.dataset.index = i;

            const row = Math.floor(i / this.gridCols);
            const col = i % this.gridCols;

            // Check if this slot already has a piece
            if (GameState.puzzle.placed.includes(i)) {
                slot.classList.add('filled');
                const canvas = this.createPieceCanvas(i, row, col, true);
                slot.appendChild(canvas);
            } else {
                // Show subtle grid outline for empty slots
                slot.style.border = '1px dashed rgba(255, 107, 157, 0.3)';
            }

            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e, i));

            frame.appendChild(slot);
            this.slots.push(slot);
        }
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

            const pieceContainer = document.createElement('div');
            pieceContainer.className = 'puzzle-piece-container';
            pieceContainer.dataset.index = pieceIndex;
            pieceContainer.draggable = true;

            const canvas = this.createPieceCanvas(pieceIndex, row, col, false);
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

    createPieceCanvas(pieceIndex, row, col, isPlaced) {
        const canvas = document.createElement('canvas');
        const width = this.pieceWidth || 80;
        const height = this.pieceHeight || 80;

        canvas.width = width;
        canvas.height = height;
        canvas.className = isPlaced ? 'placed-piece-canvas' : 'piece-canvas';

        const ctx = canvas.getContext('2d');

        // Draw the image portion - simple square piece
        if (this.imageLoaded && this.loadedImage) {
            const imgPieceWidth = this.loadedImage.width / this.gridCols;
            const imgPieceHeight = this.loadedImage.height / this.gridRows;

            ctx.drawImage(
                this.loadedImage,
                col * imgPieceWidth,
                row * imgPieceHeight,
                imgPieceWidth,
                imgPieceHeight,
                0,
                0,
                width,
                height
            );
        } else {
            // Fallback - colored piece with number
            const hue = (pieceIndex * 18) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.fillRect(0, 0, width, height);

            // Draw piece number
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pieceIndex + 1, width / 2, height / 2);
        }

        // Draw border
        ctx.strokeStyle = isPlaced ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 107, 157, 0.8)';
        ctx.lineWidth = isPlaced ? 1 : 2;
        ctx.strokeRect(0, 0, width, height);

        return canvas;
    },

    handleDragStart(e, index) {
        this.draggedPiece = e.currentTarget;
        this.draggedPieceIndex = index;
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
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
        element.style.left = (touch.clientX - 40) + 'px';
        element.style.top = (touch.clientY - 40) + 'px';
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
        slot.style.border = 'none';

        const row = Math.floor(pieceIndex / this.gridCols);
        const col = pieceIndex % this.gridCols;

        const canvas = this.createPieceCanvas(pieceIndex, row, col, true);
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
            const totalPieces = this.gridCols * this.gridRows;
            const remainingToUnlock = totalPieces - (GameState.puzzle.unlocked ? GameState.puzzle.unlocked.length : GameState.puzzle.collected);
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
        this.setupPuzzleFrame();
        this.setupPieces();
    },

    // For compatibility - no longer needed but keep for reset function
    generatePieceEdges() {
        // No longer using jigsaw edges
    }
};
