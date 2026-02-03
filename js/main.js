// Main Application Controller
const App = {
    currentPage: 'landing',
    currentActivity: null,

    init() {
        // Load saved state
        GameState.load();
        GameState.updateUI();

        // Initialize landing page
        Landing.init();

        // Attach navigation listeners
        this.attachNavigationListeners();

        // Check if finale was already reached
        if (GameState.finaleReached) {
            // Allow revisiting activities but puzzle is complete
        }

        console.log('✨ Welcome to Prashika\'s Valentine\'s Experience! ✨');
    },

    attachNavigationListeners() {
        // Activity menu items
        document.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('click', () => {
                const activity = item.dataset.activity;
                AudioManager.playEffect('click');

                if (activity === 'puzzle') {
                    this.showPuzzle();
                } else {
                    this.startActivity(activity);
                }
            });
        });

        // Back buttons
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showLanding();
        });

        document.getElementById('puzzle-back-btn').addEventListener('click', () => {
            this.showLanding();
        });
    },

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        this.currentPage = pageId;
    },

    showLanding() {
        // Cleanup current activity if any
        if (this.currentActivity) {
            this.cleanupActivity();
        }

        this.showPage('landing-page');
        GameState.updateUI();

        // Reinitialize landing if needed
        if (!Landing.animationFrame) {
            Landing.init();
        }
    },

    startActivity(activityName) {
        this.currentActivity = activityName;
        this.showPage('activity-container');

        const container = document.getElementById('activity-content');
        container.innerHTML = '<div style="text-align: center; padding: 50px;"><p>Loading...</p></div>';

        // Initialize the appropriate activity
        switch (activityName) {
            case 'drawing':
                DrawingActivity.init(container);
                break;
            case 'constellation':
                ConstellationActivity.init(container);
                break;
            case 'garden':
                GardenActivity.init(container);
                break;
            case 'maze':
                MazeActivity.init(container);
                break;
            case 'karaoke':
                KaraokeActivity.init(container);
                break;
            default:
                container.innerHTML = '<p>Activity not found</p>';
        }
    },

    cleanupActivity() {
        switch (this.currentActivity) {
            case 'drawing':
                DrawingActivity.cleanup();
                break;
            case 'constellation':
                ConstellationActivity.cleanup();
                break;
            case 'garden':
                GardenActivity.cleanup();
                break;
            case 'maze':
                MazeActivity.cleanup();
                break;
            case 'karaoke':
                KaraokeActivity.cleanup();
                break;
        }
        this.currentActivity = null;
    },

    showPuzzle() {
        this.showPage('puzzle-page');
        PuzzleSystem.init();
    },

    showFinale() {
        GameState.finaleReached = true;
        GameState.save();

        this.showPage('finale-page');
        FinaleSystem.init();
    },

    // Utility: Check if all activities are complete
    allActivitiesComplete() {
        return Object.values(GameState.activities).every(a => a.completed);
    },

    // Utility: Get completion percentage
    getCompletionPercentage() {
        const completed = Object.values(GameState.activities).filter(a => a.completed).length;
        return (completed / 5) * 100; // 5 activities now
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Expose App globally for activities to use
window.App = App;

// Handle page visibility (pause/resume audio)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        AudioManager.pause();
    } else {
        AudioManager.resume();
    }
});

// Prevent accidental navigation away
window.addEventListener('beforeunload', (e) => {
    // Only warn if there's progress
    if (GameState.puzzle.collected > 0 && !GameState.finaleReached) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to go back
    if (e.key === 'Escape') {
        if (App.currentPage !== 'landing-page') {
            App.showLanding();
        }
    }
});
