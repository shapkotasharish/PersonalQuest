// Garden of Wishes Activity - Enhanced with bees, pollination, and day/night cycle
const GardenActivity = {
    plots: [],
    bees: [],
    flowers: ['🌹', '🌻', '🌸', '🌺', '🌷', '💐'],
    completedPlots: 0,
    animationFrame: null,
    canvas: null,
    ctx: null,

    // Day/Night cycle (30 seconds each = 60 second total cycle)
    dayNightCycle: {
        time: 0, // 0-60 seconds
        isDay: true,
        cycleDuration: 60, // Total cycle in seconds
        dayStart: 0,
        nightStart: 30
    },

    // Growth stages: empty -> planted -> sprouting -> needsPollination -> pollinated -> flowering -> bloomed
    growthStages: {
        empty: 0,
        planted: 1,
        sprouting: 2,
        needsPollination: 3,
        pollinated: 4,
        flowering: 5,
        bloomed: 6
    },

    init(container) {
        this.plots = [];
        this.bees = [];
        this.completedPlots = 0;
        this.dayNightCycle.time = 15; // Start at midday
        this.dayNightCycle.isDay = true;
        this.lastTime = Date.now();

        container.innerHTML = `
            <div class="garden-container" id="garden-scene">
                <canvas id="garden-sky-canvas"></canvas>
                <div class="garden-time-indicator" id="time-indicator">
                    <span class="sun-icon">☀️</span>
                    <span class="time-text">Day</span>
                </div>
                <div class="garden-scene" id="plots-container"></div>
                <div id="bees-container"></div>
                <button class="reset-btn garden-reset" id="garden-reset-btn">Reset Garden</button>
            </div>
        `;

        this.canvas = document.getElementById('garden-sky-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Setup reset button
        document.getElementById('garden-reset-btn').addEventListener('click', () => this.resetGarden());

        this.showInstructions(() => {
            this.createPlots();
            this.createBees();
            this.animate();
        });
    },

    resizeCanvas() {
        const container = document.getElementById('garden-scene');
        if (container && this.canvas) {
            this.canvas.width = container.offsetWidth;
            this.canvas.height = container.offsetHeight;
        }
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
            • Hold click on planted seeds to water them<br>
            • Wait for your plant to need pollination (🐝)<br>
            • Click a bee near your flower to pollinate it<br>
            • Continue watering until it blooms!<br><br>
            <strong>Note:</strong> Bees only come out during the day!<br>
            Watch the sky - day and night cycle every 30 seconds.<br><br>
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
                state: 'empty',
                stageNum: this.growthStages.empty,
                wish: wish,
                flower: this.flowers[index % this.flowers.length],
                growthProgress: 0,
                waterHeld: false,
                isPollinated: false,
                needsPollination: false,
                pollinationProgress: 0
            };

            this.plots.push(plotData);

            plot.addEventListener('click', (e) => this.handlePlotClick(index, e));
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
        plot.stageNum = this.growthStages.planted;
        plot.growthProgress = 0;

        AudioManager.playEffect('click');

        this.updatePlotVisual(index);
    },

    startWatering(index) {
        const plot = this.plots[index];

        // Can only water if planted/sprouting or pollinated/flowering
        const canWater = (
            plot.state === 'planted' ||
            plot.state === 'sprouting' ||
            plot.state === 'pollinated' ||
            plot.state === 'flowering'
        );

        if (!canWater) return;

        plot.waterHeld = true;
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
                drop.style.left = (rect.left + 30 + Math.random() * 60) + 'px';
                drop.style.top = (rect.top - 20) + 'px';
                document.body.appendChild(drop);

                setTimeout(() => drop.remove(), 500);
            }, i * 100);
        }
    },

    updateGrowth(index, deltaTime) {
        const plot = this.plots[index];

        if (!plot.waterHeld) return;

        const growthRate = 15 * deltaTime; // Slower growth

        switch (plot.state) {
            case 'planted':
                plot.growthProgress += growthRate;
                if (plot.growthProgress >= 30) {
                    plot.state = 'sprouting';
                    plot.stageNum = this.growthStages.sprouting;
                }
                break;

            case 'sprouting':
                plot.growthProgress += growthRate;
                if (plot.growthProgress >= 60) {
                    plot.state = 'needsPollination';
                    plot.stageNum = this.growthStages.needsPollination;
                    plot.needsPollination = true;
                    plot.waterHeld = false;
                }
                break;

            case 'pollinated':
                plot.growthProgress += growthRate;
                if (plot.growthProgress >= 80) {
                    plot.state = 'flowering';
                    plot.stageNum = this.growthStages.flowering;
                }
                break;

            case 'flowering':
                plot.growthProgress += growthRate;
                if (plot.growthProgress >= 100) {
                    this.bloomFlower(index);
                }
                break;
        }

        this.updatePlotVisual(index);
    },

    updatePlotVisual(index) {
        const plot = this.plots[index];
        const progress = plot.growthProgress;

        let html = '';

        switch (plot.state) {
            case 'planted':
                html = `
                    <div class="seed"></div>
                    <span class="plot-hint">Hold to water</span>
                `;
                break;

            case 'sprouting':
                const sproutHeight = Math.min(30, (progress - 30) * 1);
                html = `
                    <div class="plant-stem" style="height: ${sproutHeight}px;"></div>
                    <div class="plant-leaves" style="opacity: ${(progress - 30) / 30};">🌱</div>
                    <span class="plot-hint">Keep watering...</span>
                `;
                break;

            case 'needsPollination':
                html = `
                    <div class="plant-stem" style="height: 30px;"></div>
                    <div class="plant-bud">🌼</div>
                    <div class="pollination-indicator ${this.dayNightCycle.isDay ? 'active' : ''}">
                        ${this.dayNightCycle.isDay ? '🐝 Click a bee!' : '☾ Wait for day...'}
                    </div>
                `;
                break;

            case 'pollinated':
                html = `
                    <div class="plant-stem" style="height: 40px;"></div>
                    <div class="plant-bud pollinated">🌼✨</div>
                    <span class="plot-hint">Water to bloom!</span>
                `;
                break;

            case 'flowering':
                const flowerSize = 1 + (progress - 80) / 40;
                html = `
                    <div class="plant-stem" style="height: 50px;"></div>
                    <div class="flower-growing" style="font-size: ${flowerSize}rem;">${plot.flower}</div>
                    <span class="plot-hint">Almost there!</span>
                `;
                break;

            case 'bloomed':
                html = `
                    <div class="flower bloomed">
                        <div class="flower-head">${plot.flower}</div>
                        <div class="flower-stem"></div>
                    </div>
                    <div class="wish-message">${plot.wish}</div>
                `;
                break;
        }

        plot.element.innerHTML = html;
    },

    bloomFlower(index) {
        const plot = this.plots[index];
        plot.state = 'bloomed';
        plot.stageNum = this.growthStages.bloomed;
        plot.waterHeld = false;

        AudioManager.playEffect('success');
        this.updatePlotVisual(index);

        plot.element.style.cursor = 'default';
        this.completedPlots++;

        // Check if all plots are bloomed
        if (this.completedPlots === this.plots.length) {
            setTimeout(() => this.completeActivity(), 2000);
        }
    },

    createBees() {
        const container = document.getElementById('bees-container');

        for (let i = 0; i < 8; i++) {
            const bee = document.createElement('div');
            bee.className = 'garden-bee';
            bee.innerHTML = '🐝';
            bee.dataset.index = i;

            const beeData = {
                element: bee,
                x: Math.random() * 80 + 10,
                y: Math.random() * 40 + 10,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                targetPlot: null,
                isVisible: true
            };

            this.bees.push(beeData);

            bee.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleBeeClick(i);
            });

            container.appendChild(bee);
        }
    },

    handleBeeClick(beeIndex) {
        if (!this.dayNightCycle.isDay) return;

        const bee = this.bees[beeIndex];

        // Find nearest plot that needs pollination
        let nearestPlot = null;
        let nearestDist = Infinity;

        this.plots.forEach((plot, index) => {
            if (plot.state === 'needsPollination') {
                const plotRect = plot.element.getBoundingClientRect();
                const beeRect = bee.element.getBoundingClientRect();

                const dx = plotRect.left + plotRect.width/2 - (beeRect.left + beeRect.width/2);
                const dy = plotRect.top + plotRect.height/2 - (beeRect.top + beeRect.height/2);
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < nearestDist && dist < 150) {
                    nearestDist = dist;
                    nearestPlot = index;
                }
            }
        });

        if (nearestPlot !== null) {
            this.pollinatePlot(nearestPlot, beeIndex);
        }
    },

    pollinatePlot(plotIndex, beeIndex) {
        const plot = this.plots[plotIndex];
        const bee = this.bees[beeIndex];

        // Animate bee to flower
        const plotRect = plot.element.getBoundingClientRect();
        const container = document.getElementById('garden-scene').getBoundingClientRect();

        bee.x = ((plotRect.left - container.left + plotRect.width/2) / container.width) * 100;
        bee.y = ((plotRect.top - container.top) / container.height) * 100;

        // Create pollination effect
        this.showPollinationEffect(plot.element);

        // Update plot state
        plot.state = 'pollinated';
        plot.stageNum = this.growthStages.pollinated;
        plot.isPollinated = true;
        plot.needsPollination = false;
        plot.growthProgress = 65; // Start a bit ahead

        AudioManager.playEffect('click');
        this.updatePlotVisual(plotIndex);

        // Make bee fly away
        bee.vx = (Math.random() - 0.5) * 4;
        bee.vy = -Math.abs((Math.random() + 0.5) * 3);
    },

    showPollinationEffect(plotElement) {
        const rect = plotElement.getBoundingClientRect();

        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'pollen-particle';
                particle.innerHTML = '✨';
                particle.style.left = (rect.left + rect.width/2 + (Math.random() - 0.5) * 60) + 'px';
                particle.style.top = (rect.top + 20 + (Math.random() - 0.5) * 40) + 'px';
                document.body.appendChild(particle);

                setTimeout(() => particle.remove(), 1000);
            }, i * 50);
        }
    },

    updateBees(deltaTime) {
        const isDay = this.dayNightCycle.isDay;
        const container = document.getElementById('bees-container');

        this.bees.forEach(bee => {
            // Show/hide bees based on day/night
            if (isDay && !bee.isVisible) {
                bee.isVisible = true;
                bee.element.style.opacity = '1';
                bee.element.style.pointerEvents = 'auto';
            } else if (!isDay && bee.isVisible) {
                bee.isVisible = false;
                bee.element.style.opacity = '0';
                bee.element.style.pointerEvents = 'none';
            }

            if (!isDay) return;

            // Move bees
            bee.x += bee.vx * deltaTime * 30;
            bee.y += bee.vy * deltaTime * 30;

            // Bounce off walls
            if (bee.x < 5 || bee.x > 95) {
                bee.vx *= -1;
                bee.x = Math.max(5, Math.min(95, bee.x));
            }
            if (bee.y < 5 || bee.y > 60) {
                bee.vy *= -1;
                bee.y = Math.max(5, Math.min(60, bee.y));
            }

            // Random direction changes
            if (Math.random() < 0.02) {
                bee.vx += (Math.random() - 0.5) * 1;
                bee.vy += (Math.random() - 0.5) * 1;
                bee.vx = Math.max(-2, Math.min(2, bee.vx));
                bee.vy = Math.max(-2, Math.min(2, bee.vy));
            }

            // Attract bees toward plants needing pollination
            this.plots.forEach(plot => {
                if (plot.state === 'needsPollination' && Math.random() < 0.01) {
                    const plotRect = plot.element.getBoundingClientRect();
                    const containerRect = document.getElementById('garden-scene').getBoundingClientRect();
                    const plotX = ((plotRect.left - containerRect.left + plotRect.width/2) / containerRect.width) * 100;
                    const plotY = ((plotRect.top - containerRect.top) / containerRect.height) * 100;

                    const dx = plotX - bee.x;
                    const dy = plotY - bee.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist > 0) {
                        bee.vx += (dx / dist) * 0.3;
                        bee.vy += (dy / dist) * 0.3;
                    }
                }
            });

            // Update position
            bee.element.style.left = bee.x + '%';
            bee.element.style.top = bee.y + '%';
            bee.element.style.transform = bee.vx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
        });
    },

    updateDayNightCycle(deltaTime) {
        this.dayNightCycle.time += deltaTime;

        if (this.dayNightCycle.time >= this.dayNightCycle.cycleDuration) {
            this.dayNightCycle.time = 0;
        }

        const wasDay = this.dayNightCycle.isDay;
        this.dayNightCycle.isDay = this.dayNightCycle.time < 30;

        // Update indicator
        const indicator = document.getElementById('time-indicator');
        if (indicator) {
            if (this.dayNightCycle.isDay) {
                indicator.innerHTML = '<span class="sun-icon">☀️</span><span class="time-text">Day</span>';
                indicator.className = 'garden-time-indicator day';
            } else {
                indicator.innerHTML = '<span class="moon-icon">🌙</span><span class="time-text">Night</span>';
                indicator.className = 'garden-time-indicator night';
            }
        }

        // Update pollination hints when day/night changes
        if (wasDay !== this.dayNightCycle.isDay) {
            this.plots.forEach((plot, index) => {
                if (plot.state === 'needsPollination') {
                    this.updatePlotVisual(index);
                }
            });
        }

        // Draw sky
        this.drawSky();
    },

    drawSky() {
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const time = this.dayNightCycle.time;

        // Calculate color based on time
        let skyGradient;

        if (time < 5) {
            // Sunrise (0-5)
            const t = time / 5;
            skyGradient = ctx.createLinearGradient(0, 0, 0, h);
            skyGradient.addColorStop(0, this.lerpColor('#1a1a3a', '#ff9a56', t));
            skyGradient.addColorStop(0.5, this.lerpColor('#2d2d5a', '#ffcc88', t));
            skyGradient.addColorStop(1, this.lerpColor('#4a4a7a', '#87CEEB', t));
        } else if (time < 25) {
            // Day (5-25)
            skyGradient = ctx.createLinearGradient(0, 0, 0, h);
            skyGradient.addColorStop(0, '#87CEEB');
            skyGradient.addColorStop(0.5, '#b8e2f2');
            skyGradient.addColorStop(1, '#e8f4f8');
        } else if (time < 30) {
            // Sunset (25-30)
            const t = (time - 25) / 5;
            skyGradient = ctx.createLinearGradient(0, 0, 0, h);
            skyGradient.addColorStop(0, this.lerpColor('#87CEEB', '#ff6b35', t));
            skyGradient.addColorStop(0.5, this.lerpColor('#b8e2f2', '#ff9a56', t));
            skyGradient.addColorStop(1, this.lerpColor('#e8f4f8', '#1a1a3a', t));
        } else if (time < 35) {
            // Dusk (30-35)
            const t = (time - 30) / 5;
            skyGradient = ctx.createLinearGradient(0, 0, 0, h);
            skyGradient.addColorStop(0, this.lerpColor('#ff6b35', '#1a1a3a', t));
            skyGradient.addColorStop(0.5, this.lerpColor('#ff9a56', '#2d2d5a', t));
            skyGradient.addColorStop(1, this.lerpColor('#1a1a3a', '#0d0d1a', t));
        } else if (time < 55) {
            // Night (35-55)
            skyGradient = ctx.createLinearGradient(0, 0, 0, h);
            skyGradient.addColorStop(0, '#0d0d1a');
            skyGradient.addColorStop(0.5, '#1a1a3a');
            skyGradient.addColorStop(1, '#2d2d5a');
        } else {
            // Pre-dawn (55-60)
            const t = (time - 55) / 5;
            skyGradient = ctx.createLinearGradient(0, 0, 0, h);
            skyGradient.addColorStop(0, this.lerpColor('#0d0d1a', '#1a1a3a', t));
            skyGradient.addColorStop(0.5, this.lerpColor('#1a1a3a', '#2d2d5a', t));
            skyGradient.addColorStop(1, this.lerpColor('#2d2d5a', '#4a4a7a', t));
        }

        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h);

        // Draw stars at night
        if (!this.dayNightCycle.isDay) {
            this.drawStars(time);
        }

        // Draw sun or moon
        this.drawCelestialBody(time);
    },

    drawStars(time) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Create consistent star positions using a seed
        const starCount = 50;
        const seed = 12345;

        for (let i = 0; i < starCount; i++) {
            const pseudoRandom = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
            const pseudoRandom2 = ((seed * (i + 2) * 9301 + 49297) % 233280) / 233280;
            const pseudoRandom3 = ((seed * (i + 3) * 9301 + 49297) % 233280) / 233280;

            const x = pseudoRandom * w;
            const y = pseudoRandom2 * h * 0.6;
            const size = 1 + pseudoRandom3 * 2;

            // Twinkle effect
            const twinkle = Math.sin(time * 2 + i) * 0.3 + 0.7;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.fill();
        }
    },

    drawCelestialBody(time) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        if (this.dayNightCycle.isDay) {
            // Draw sun
            const sunProgress = time / 30;
            const sunX = w * 0.1 + sunProgress * w * 0.8;
            const sunY = h * 0.15 + Math.sin(sunProgress * Math.PI) * (-h * 0.1);

            // Sun glow
            const glowGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
            glowGradient.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
            glowGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.2)');
            glowGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(sunX - 60, sunY - 60, 120, 120);

            // Sun
            ctx.beginPath();
            ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
        } else {
            // Draw moon
            const moonProgress = (time - 30) / 30;
            const moonX = w * 0.1 + moonProgress * w * 0.8;
            const moonY = h * 0.15 + Math.sin(moonProgress * Math.PI) * (-h * 0.1);

            // Moon glow
            const glowGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 50);
            glowGradient.addColorStop(0, 'rgba(200, 200, 255, 0.5)');
            glowGradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.1)');
            glowGradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(moonX - 50, moonY - 50, 100, 100);

            // Moon
            ctx.beginPath();
            ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
            ctx.fillStyle = '#F0F0F0';
            ctx.fill();

            // Moon craters
            ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
            ctx.beginPath();
            ctx.arc(moonX - 5, moonY - 5, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(moonX + 8, moonY + 3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
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

    animate() {
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Update day/night cycle
        this.updateDayNightCycle(deltaTime);

        // Update bees
        this.updateBees(deltaTime);

        // Update growth for plots being watered
        this.plots.forEach((plot, index) => {
            if (plot.waterHeld) {
                this.updateGrowth(index, deltaTime);
            }
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    resetGarden() {
        if (confirm('Are you sure you want to reset the garden? All progress will be lost.')) {
            this.plots.forEach((plot, index) => {
                plot.state = 'empty';
                plot.stageNum = this.growthStages.empty;
                plot.growthProgress = 0;
                plot.waterHeld = false;
                plot.isPollinated = false;
                plot.needsPollination = false;
                plot.element.innerHTML = '';
                plot.element.style.cursor = 'pointer';
            });
            this.completedPlots = 0;
        }
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
        window.removeEventListener('resize', () => this.resizeCanvas());
        this.plots = [];
        this.bees = [];
        this.completedPlots = 0;
    }
};
