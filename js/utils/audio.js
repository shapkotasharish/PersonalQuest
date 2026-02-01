// Audio Management
const AudioManager = {
    context: null,
    currentAudio: null,
    analyser: null,
    dataArray: null,

    init() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    async loadAudio(url) {
        this.init();

        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.crossOrigin = 'anonymous';
            audio.src = url;

            audio.addEventListener('canplaythrough', () => {
                resolve(audio);
            });

            audio.addEventListener('error', (e) => {
                reject(e);
            });

            audio.load();
        });
    },

    async play(url, loop = false) {
        try {
            if (this.currentAudio) {
                this.stop();
            }

            this.currentAudio = await this.loadAudio(url);
            this.currentAudio.loop = loop;

            // Create analyser for visualizations
            const source = this.context.createMediaElementSource(this.currentAudio);
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);
            this.analyser.connect(this.context.destination);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            await this.currentAudio.play();
            return this.currentAudio;
        } catch (error) {
            console.error('Error playing audio:', error);
            return null;
        }
    },

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    },

    pause() {
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
    },

    resume() {
        if (this.currentAudio) {
            this.currentAudio.play();
        }
    },

    setVolume(volume) {
        if (this.currentAudio) {
            this.currentAudio.volume = Math.max(0, Math.min(1, volume));
        }
    },

    getCurrentTime() {
        return this.currentAudio ? this.currentAudio.currentTime : 0;
    },

    getDuration() {
        return this.currentAudio ? this.currentAudio.duration : 0;
    },

    getFrequencyData() {
        if (this.analyser && this.dataArray) {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        }
        return null;
    },

    getAverageFrequency() {
        const data = this.getFrequencyData();
        if (data) {
            const sum = data.reduce((a, b) => a + b, 0);
            return sum / data.length;
        }
        return 0;
    },

    // Play a simple sound effect
    playEffect(type) {
        this.init();

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        switch (type) {
            case 'success':
                oscillator.frequency.setValueAtTime(523.25, this.context.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, this.context.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, this.context.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.4);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.4);
                break;

            case 'click':
                oscillator.frequency.setValueAtTime(800, this.context.currentTime);
                gainNode.gain.setValueAtTime(0.2, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.1);
                break;

            case 'hit':
                oscillator.frequency.setValueAtTime(440, this.context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, this.context.currentTime + 0.05);
                gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.15);
                break;

            case 'perfect':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, this.context.currentTime);
                oscillator.frequency.setValueAtTime(1108.73, this.context.currentTime + 0.08);
                gainNode.gain.setValueAtTime(0.25, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.2);
                break;

            case 'miss':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(200, this.context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.15, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.2);
                break;

            case 'celebration':
                // Play a cheerful arpeggio
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, i) => {
                    const osc = this.context.createOscillator();
                    const gain = this.context.createGain();
                    osc.connect(gain);
                    gain.connect(this.context.destination);
                    osc.frequency.setValueAtTime(freq, this.context.currentTime + i * 0.1);
                    gain.gain.setValueAtTime(0.2, this.context.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.1 + 0.3);
                    osc.start(this.context.currentTime + i * 0.1);
                    osc.stop(this.context.currentTime + i * 0.1 + 0.3);
                });
                break;

            case 'switch':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(600, this.context.currentTime);
                oscillator.frequency.setValueAtTime(800, this.context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.15, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.2);
                break;
        }
    }
};
