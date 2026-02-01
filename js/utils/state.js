// State Management
const GameState = {
    activities: {
        drawing: { completed: false, data: null },
        constellation: { completed: false, data: null },
        garden: { completed: false, data: null },
        maze: { completed: false, data: null },
        rhythm: { completed: false, data: null }
    },
    puzzle: {
        collected: 0,
        placed: [],
        total: 25
    },
    finaleReached: false,

    // Save state to localStorage
    save() {
        localStorage.setItem('prashikaQuest', JSON.stringify({
            activities: this.activities,
            puzzle: this.puzzle,
            finaleReached: this.finaleReached
        }));
    },

    // Load state from localStorage
    load() {
        const saved = localStorage.getItem('prashikaQuest');
        if (saved) {
            const data = JSON.parse(saved);
            this.activities = data.activities || this.activities;
            this.puzzle = data.puzzle || this.puzzle;
            this.finaleReached = data.finaleReached || false;
        }
    },

    // Mark activity as complete and award pieces
    completeActivity(activityName) {
        if (!this.activities[activityName].completed) {
            this.activities[activityName].completed = true;
            this.puzzle.collected = Math.min(this.puzzle.collected + 5, this.puzzle.total);
            this.save();
            this.updateUI();
            return true;
        }
        return false;
    },

    // Place a puzzle piece
    placePiece(pieceIndex, slotIndex) {
        if (!this.puzzle.placed.includes(pieceIndex)) {
            this.puzzle.placed.push(pieceIndex);
            this.save();
            this.updateUI();

            // Check if puzzle is complete
            if (this.puzzle.placed.length === this.puzzle.total) {
                return 'complete';
            }
        }
        return 'placed';
    },

    // Update UI elements
    updateUI() {
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        const progressCount = document.getElementById('progress-count');
        const puzzleProgress = document.getElementById('puzzle-progress');

        if (progressFill) {
            progressFill.style.width = `${(this.puzzle.collected / this.puzzle.total) * 100}%`;
        }
        if (progressCount) {
            progressCount.textContent = `${this.puzzle.collected}/${this.puzzle.total} pieces`;
        }
        if (puzzleProgress) {
            puzzleProgress.textContent = this.puzzle.placed.length;
        }

        // Update activity completion status
        Object.keys(this.activities).forEach(activity => {
            const item = document.querySelector(`[data-activity="${activity}"]`);
            if (item && this.activities[activity].completed) {
                item.classList.add('completed');
            }
        });
    },

    // Reset all progress
    reset() {
        this.activities = {
            drawing: { completed: false, data: null },
            constellation: { completed: false, data: null },
            garden: { completed: false, data: null },
            maze: { completed: false, data: null },
            rhythm: { completed: false, data: null }
        };
        this.puzzle = {
            collected: 0,
            placed: [],
            total: 25
        };
        this.finaleReached = false;
        this.save();
        this.updateUI();
    }
};

// Memory data for the maze
const MemoryData = [
    { id: 1, image: 'assets/images/memories/IMG_0095.jpg', caption: 'Fashion show, funtastic wonderful' },
    { id: 2, image: 'assets/images/memories/IMG_0105.jpg', caption: '🧛 Halloween' },
    { id: 3, image: 'assets/images/memories/IMG_0106.jpg', caption: 'Bloodrushhh' },
    { id: 4, image: 'assets/images/memories/IMG_0108.jpg', caption: 'First Date 🍎🌳' },
    { id: 5, image: 'assets/images/memories/IMG_0110.jpg', caption: 'Swervinnn' },
    { id: 6, image: 'assets/images/memories/IMG_0116.jpg', caption: 'Glo!' },
    { id: 7, image: 'assets/images/memories/IMG_0120.jpg', caption: 'Musica 🎵🎶' },
    { id: 8, image: 'assets/images/memories/IMG_0122.jpg', caption: 'Valas 🎢' },
    { id: 9, image: 'assets/images/memories/IMG_0150.jpg', caption: 'Hehe' },
    { id: 10, image: 'assets/images/memories/IMG_0203.jpg', caption: '❤️' }
];

// Song data for rhythm game
const SongData = [
    {
        id: 1,
        title: '20 Something',
        artist: 'SZA',
        file: 'assets/audio/songs/SpotiDownloader.com - 20 Something - SZA.mp3',
        memory: 'For all our twenties adventures'
    },
    {
        id: 2,
        title: 'Barbaad',
        artist: 'The Rish',
        file: 'assets/audio/songs/SpotiDownloader.com - Barbaad (From _Saiyaara_) - The Rish.mp3',
        memory: 'Our song that speaks to the heart'
    },
    {
        id: 3,
        title: 'K Yo Maya Ho',
        artist: 'B-8eight',
        file: 'assets/audio/songs/SpotiDownloader.com - K Yo Maya Ho - B-8eight.mp3',
        memory: 'What is this love?'
    },
    {
        id: 4,
        title: 'Open Arms',
        artist: 'SZA ft. Travis Scott',
        file: 'assets/audio/songs/SpotiDownloader.com - Open Arms (feat. Travis Scott) - SZA.mp3',
        memory: 'Always with open arms for you'
    },
    {
        id: 5,
        title: 'Raindance',
        artist: 'Dave ft. Tems',
        file: 'assets/audio/songs/SpotiDownloader.com - Raindance (feat. Tems) - Dave.mp3',
        memory: 'Dancing in the rain together'
    }
];

// Garden wishes
const WishData = [
    "I wish to make you laugh every day",
    "I wish to explore the world with you",
    "I wish to support your dreams always",
    "I wish to grow old beside you",
    "I wish to create beautiful memories together",
    "I wish to be your biggest cheerleader"
];

// Constellation messages
const ConstellationData = [
    { message: "You Make My World Brighter", points: [[100, 150], [150, 100], [200, 120], [250, 90], [300, 130], [280, 180], [220, 200], [160, 190]] },
    { message: "Creative, Funny, Beautiful Soul", points: [[400, 200], [450, 150], [500, 180], [550, 140], [600, 170], [580, 220], [520, 250], [460, 230]] },
    { message: "Every Moment With You", points: [[150, 350], [200, 300], [250, 330], [300, 290], [280, 370], [220, 400]] },
    { message: "Our Adventure Together", points: [[450, 380], [500, 340], [550, 370], [600, 330], [620, 400], [560, 430], [500, 410]] }
];

// Initialize state on load
document.addEventListener('DOMContentLoaded', () => {
    GameState.load();
    GameState.updateUI();
});
