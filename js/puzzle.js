// Puzzle System
const PuzzleSystem = {
    puzzleImage: 'assets/images/puzzle/main.jpg',
    pieces: [],
    slots: [],
    draggedPiece: null,
    imageLoaded: false,

    init() {
        this.setupPuzzleFrame();
        this.setupPieces();
        this.loadImage();
    },

    setupPuzzleFrame() {
        const frame = document.getElementById('puzzle-frame');
        frame.innerHTML = '';

        for (let i = 0; i < 25; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.dataset.index = i;

            // Check if this slot already has a piece
            if (GameState.puzzle.placed.includes(i)) {
                slot.classList.add('filled');
                const row = Math.floor(i / 5);
                const col = i % 5;
                slot.innerHTML = `<div class="placed-piece" style="background-image: url('${this.puzzleImage}'); background-position: ${col * 25}% ${row * 25}%;"></div>`;
            }

            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e, i));

            frame.appendChild(slot);
            this.slots.push(slot);
        }
    },

    setupPieces() {
        const container = document.getElementById('available-pieces');
        container.innerHTML = '';
        this.pieces = [];

        // Calculate available pieces (collected but not placed)
        const availableCount = GameState.puzzle.collected - GameState.puzzle.placed.length;

        if (availableCount <= 0) {
            container.innerHTML = '<p class="no-pieces">Complete activities to earn puzzle pieces!</p>';
            return;
        }

        // Find which pieces are available
        const placedSet = new Set(GameState.puzzle.placed);
        let piecesAdded = 0;

        for (let i = 0; i < 25 && piecesAdded < availableCount; i++) {
            if (!placedSet.has(i)) {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.dataset.index = i;
                piece.draggable = true;

                const row = Math.floor(i / 5);
                const col = i % 5;
                piece.style.backgroundImage = `url('${this.puzzleImage}')`;
                piece.style.backgroundPosition = `${col * 25}% ${row * 25}%`;

                piece.addEventListener('dragstart', (e) => this.handleDragStart(e, i));
                piece.addEventListener('dragend', (e) => this.handleDragEnd(e));

                // Touch support
                piece.addEventListener('touchstart', (e) => this.handleTouchStart(e, i));
                piece.addEventListener('touchmove', (e) => this.handleTouchMove(e));
                piece.addEventListener('touchend', (e) => this.handleTouchEnd(e));

                container.appendChild(piece);
                this.pieces.push({ element: piece, index: i });
                piecesAdded++;
            }
        }
    },

    loadImage() {
        const img = new Image();
        img.onload = () => {
            this.imageLoaded = true;
        };
        img.src = this.puzzleImage;
    },

    handleDragStart(e, index) {
        this.draggedPiece = index;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);

        // Highlight correct slot
        this.slots[index].classList.add('highlight');
    },

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.slots.forEach(slot => slot.classList.remove('highlight'));
        this.draggedPiece = null;
    },

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    handleDrop(e, slotIndex) {
        e.preventDefault();

        if (this.draggedPiece === null) return;

        // Check if correct slot
        if (this.draggedPiece === slotIndex) {
            this.placePiece(this.draggedPiece, slotIndex);
        } else {
            // Wrong slot - bounce back
            AudioManager.playEffect('miss');
            Animations.shake(document.querySelector(`[data-index="${this.draggedPiece}"].puzzle-piece`));
        }
    },

    // Touch support
    handleTouchStart(e, index) {
        this.draggedPiece = index;
        e.target.classList.add('dragging');
        this.slots[index].classList.add('highlight');
    },

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = e.target;

        element.style.position = 'fixed';
        element.style.left = (touch.clientX - 40) + 'px';
        element.style.top = (touch.clientY - 40) + 'px';
        element.style.zIndex = '1000';
    },

    handleTouchEnd(e) {
        const element = e.target;
        element.classList.remove('dragging');
        element.style.position = '';
        element.style.left = '';
        element.style.top = '';
        element.style.zIndex = '';

        this.slots.forEach(slot => slot.classList.remove('highlight'));

        // Find slot under touch point
        const touch = e.changedTouches[0];
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);

        if (elementAtPoint && elementAtPoint.classList.contains('puzzle-slot')) {
            const slotIndex = parseInt(elementAtPoint.dataset.index);
            if (this.draggedPiece === slotIndex) {
                this.placePiece(this.draggedPiece, slotIndex);
            } else {
                AudioManager.playEffect('miss');
            }
        }

        this.draggedPiece = null;
    },

    placePiece(pieceIndex, slotIndex) {
        AudioManager.playEffect('success');

        const result = GameState.placePiece(pieceIndex, slotIndex);

        // Update slot visual
        const slot = this.slots[slotIndex];
        slot.classList.add('filled');

        const row = Math.floor(pieceIndex / 5);
        const col = pieceIndex % 5;
        slot.innerHTML = `<div class="placed-piece" style="background-image: url('${this.puzzleImage}'); background-position: ${col * 25}% ${row * 25}%;"></div>`;

        // Remove piece from available
        const pieceElement = document.querySelector(`.puzzle-piece[data-index="${pieceIndex}"]`);
        if (pieceElement) {
            pieceElement.remove();
        }

        // Update progress display
        document.getElementById('puzzle-progress').textContent = GameState.puzzle.placed.length;

        // Check if puzzle is complete
        if (result === 'complete') {
            this.onPuzzleComplete();
        }

        // Check if no more pieces available
        if (document.getElementById('available-pieces').children.length === 0) {
            document.getElementById('available-pieces').innerHTML =
                '<p class="no-pieces">All available pieces placed! Complete more activities for more pieces.</p>';
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
    }
};
