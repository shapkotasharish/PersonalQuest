// Garden of Wishes Activity
const GardenActivity = {
    plots: [],
    flowers: ['🌹', '🌻', '🌸', '🌺', '🌷', '💐'],
    butterflies: [],
    wateringMode: false,
    completedPlots: 0,
    animationFrame: null,

    init(container) {
        this.plots = [];
        this.completedPlots = 0;

        container.innerHTML = `
            <div class="garden-container" id="garden-scene">
                <div class="garden-scene" id="plots-container"></div>
                <div id="butterflies-container"></div>
            </div>
        `;

        this.showInstructions(() => {
            this.createPlots();
            this.createButterflies();
            this.animate();
        });
    },

    showInstructions(callback) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const text = document.getElementById('modal-text');
        const closeBtn = document.getElementById('modal-close');

        title.textContent = 'Garden of Wishes';
        text.innerHTML = `
            Plant and nurture flowers to discover my wishes for us!<br><br>
            <strong>How to play:</strong><br>
            • Click an empty plot to plant a seed<br>
            • Click and hold to water the plant<br>
            • Watch it bloom to reveal a wish<br><br>
            🌸 Let's grow our garden of dreams!
        `;

        modal.classList.remove('hidden');

        const handleClose = () => {
            modal.classList.add('hidden');
            closeBtn.removeEventListener('click', handleClose);
            callback();
        };

        closeBtn.addEventListener('click', handleClose);
    },

    createPlots() {
        const container = document.getElementById('plots-container');

        WishData.forEach((wish, index) => {
            const plot = document.createElement('div');
            plot.className = 'garden-plot';
            plot.dataset.index = index;

            const plotData = {
                element: plot,
                state: 'empty', // empty, planted, growing, bloomed
                wish: wish,
                flower: this.flowers[index % this.flowers.length],
                growthProgress: 0,
                waterHeld: false
            };

            this.plots.push(plotData);

            plot.addEventListener('click', () => this.handlePlotClick(index));
            plot.addEventListener('mousedown', () => this.startWatering(index));
            plot.addEventListener('mouseup', () => this.stopWatering(index));
            plot.addEventListener('mouseleave', () => this.stopWatering(index));

            // Touch events
            plot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startWatering(index);
            });
            plot.addEventListener('touchend', () => this.stopWatering(index));

            container.appendChild(plot);
        });
    },

    handlePlotClick(index) {
        const plot = this.plots[index];

        if (plot.state === 'empty') {
            this.plantSeed(index);
        }
    },

    plantSeed(index) {
        const plot = this.plots[index];
        plot.state = 'planted';

        AudioManager.playEffect('click');

        // Add seed visual
        plot.element.innerHTML = `
            <div class="seed"></div>
            <span style="position: absolute; bottom: 10px; font-size: 0.8rem; color: rgba(255,255,255,0.7);">
                Hold to water
            </span>
        `;
    },

    startWatering(index) {
        const plot = this.plots[index];

        if (plot.state !== 'planted' && plot.state !== 'growing') return;

        plot.waterHeld = true;
        plot.state = 'growing';

        // Show watering effect
        this.showWaterDrops(plot.element);
    },

    stopWatering(index) {
        const plot = this.plots[index];
        plot.waterHeld = false;
    },

    showWaterDrops(plotElement) {
        const rect = plotElement.getBoundingClientRect();

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const drop = document.createElement('div');
                drop.className = 'water-drop';
                drop.style.left = (rect.left + 50 + Math.random() * 50) + 'px';
                drop.style.top = (rect.top - 20) + 'px';
                document.body.appendChild(drop);

                setTimeout(() => drop.remove(), 500);
            }, i * 100);
        }
    },

    updateGrowth(index) {
        const plot = this.plots[index];

        if (plot.state !== 'growing' || !plot.waterHeld) return;

        plot.growthProgress += 2;

        // Update visual
        const stemHeight = Math.min(60, plot.growthProgress * 0.6);

        if (plot.growthProgress < 100) {
            plot.element.innerHTML = `
                <div style="
                    position: absolute;
                    bottom: 40px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: ${stemHeight}px;
                    background: linear-gradient(to top, #228B22, #32CD32);
                    border-radius: 2px;
                "></div>
                ${plot.growthProgress > 50 ? `
                    <div style="
                        position: absolute;
                        bottom: ${40 + stemHeight - 10}px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: ${0.5 + plot.growthProgress / 100}rem;
                        opacity: ${plot.growthProgress / 100};
                    ">${plot.flower}</div>
                ` : ''}
            `;
        } else {
            this.bloomFlower(index);
        }
    },

    bloomFlower(index) {
        const plot = this.plots[index];
        plot.state = 'bloomed';
        plot.waterHeld = false;

        AudioManager.playEffect('success');

        plot.element.innerHTML = `
            <div class="flower bloomed">
                <div class="flower-head">${plot.flower}</div>
                <div class="flower-stem"></div>
            </div>
            <div class="wish-message">${plot.wish}</div>
        `;

        plot.element.style.cursor = 'default';
        this.completedPlots++;

        // Check if all plots are bloomed
        if (this.completedPlots === this.plots.length) {
            setTimeout(() => this.completeActivity(), 2000);
        }
    },

    createButterflies() {
        const container = document.getElementById('butterflies-container');

        for (let i = 0; i < 5; i++) {
            const butterfly = document.createElement('div');
            butterfly.className = 'butterfly';
            butterfly.innerHTML = '🦋';
            butterfly.style.left = Math.random() * 80 + 10 + '%';
            butterfly.style.top = Math.random() * 50 + 10 + '%';
            butterfly.style.animationDelay = Math.random() * 5 + 's';
            butterfly.style.animationDuration = (8 + Math.random() * 4) + 's';

            container.appendChild(butterfly);

            this.butterflies.push(butterfly);
        }
    },

    animate() {
        // Update growth for plots being watered
        this.plots.forEach((plot, index) => {
            if (plot.waterHeld && plot.state === 'growing') {
                this.updateGrowth(index);
            }
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    completeActivity() {
        cancelAnimationFrame(this.animationFrame);
        AudioManager.playEffect('celebration');

        const isNew = GameState.completeActivity('garden');
        const container = document.getElementById('activity-content');

        container.innerHTML = `
            <div class="activity-complete">
                <h2>Every Wish Includes You!</h2>
                <div class="puzzle-piece-animation">🌸</div>
                <p class="pieces-earned">${isNew ? 'You earned 5 puzzle pieces!' : 'Activity completed!'}</p>
                <div style="margin: 30px 0;">
                    <p style="font-family: 'Dancing Script', cursive; font-size: 1.5rem; color: var(--warm-pink);">
                        Our garden of dreams is blooming
                    </p>
                </div>
                <button class="action-btn" id="back-to-menu">Back to Menu</button>
            </div>
        `;

        document.getElementById('back-to-menu').addEventListener('click', () => {
            window.App.showLanding();
        });
    },

    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.plots = [];
        this.butterflies = [];
        this.completedPlots = 0;
    }
};
