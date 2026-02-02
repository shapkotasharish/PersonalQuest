// Turn-based Drawing Relay Activity - Simplified
const DrawingActivity = {
    mode: null, // 'irl' or 'digital'
    canvas: null,
    ctx: null,
    drawing: false,
    currentColor: '#000000',
    brushSize: 5,
    isEraser: false,
    timer: 120,
    timerInterval: null,
    currentPlayer: 1,
    strokes: [],
    currentStroke: [],
    difficulty: 'easy',
    refImageName: '',

    // Reference images by difficulty
    // Easy: Simple outlines only - NO color, thick strokes, 5th-grader level
    // Medium: Basic shapes with simple structure
    // Hard: More detail with shading guides
    // Extreme: Full color with gradients

    drawRefImages: {
        easy: [
            { name: 'Heart', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.3);
                ctx.bezierCurveTo(w*0.2, h*0.1, w*0.05, h*0.4, w/2, h*0.8);
                ctx.moveTo(w/2, h*0.3);
                ctx.bezierCurveTo(w*0.8, h*0.1, w*0.95, h*0.4, w/2, h*0.8);
                ctx.stroke();
            }},
            { name: 'Star', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                ctx.beginPath();
                for(let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI / 5) - Math.PI/2;
                    const x = w/2 + Math.cos(angle) * w*0.35;
                    const y = h/2 + Math.sin(angle) * h*0.35;
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }},
            { name: 'Smiley Face', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                // Face
                ctx.beginPath();
                ctx.arc(w/2, h/2, w*0.35, 0, Math.PI*2);
                ctx.stroke();
                // Eyes
                ctx.beginPath();
                ctx.arc(w*0.38, h*0.4, w*0.05, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(w*0.62, h*0.4, w*0.05, 0, Math.PI*2);
                ctx.stroke();
                // Smile
                ctx.beginPath();
                ctx.arc(w/2, h*0.5, w*0.2, 0.2, Math.PI-0.2);
                ctx.stroke();
            }},
            { name: 'House', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                // Body
                ctx.strokeRect(w*0.2, h*0.45, w*0.6, h*0.45);
                // Roof
                ctx.beginPath();
                ctx.moveTo(w*0.15, h*0.45);
                ctx.lineTo(w/2, h*0.15);
                ctx.lineTo(w*0.85, h*0.45);
                ctx.stroke();
                // Door
                ctx.strokeRect(w*0.4, h*0.6, w*0.2, h*0.3);
            }},
            { name: 'Sun', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                // Circle
                ctx.beginPath();
                ctx.arc(w/2, h/2, w*0.2, 0, Math.PI*2);
                ctx.stroke();
                // Rays
                for(let i = 0; i < 8; i++) {
                    const angle = i * Math.PI / 4;
                    ctx.beginPath();
                    ctx.moveTo(w/2 + Math.cos(angle)*w*0.25, h/2 + Math.sin(angle)*w*0.25);
                    ctx.lineTo(w/2 + Math.cos(angle)*w*0.4, h/2 + Math.sin(angle)*w*0.4);
                    ctx.stroke();
                }
            }},
            { name: 'Tree', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                // Trunk
                ctx.strokeRect(w*0.42, h*0.6, w*0.16, h*0.35);
                // Leaves (triangle)
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.1);
                ctx.lineTo(w*0.2, h*0.65);
                ctx.lineTo(w*0.8, h*0.65);
                ctx.closePath();
                ctx.stroke();
            }}
        ],
        medium: [
            { name: 'Flower in Pot', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                // Pot
                ctx.beginPath();
                ctx.moveTo(w*0.3, h*0.65);
                ctx.lineTo(w*0.35, h*0.92);
                ctx.lineTo(w*0.65, h*0.92);
                ctx.lineTo(w*0.7, h*0.65);
                ctx.closePath();
                ctx.stroke();
                // Pot rim
                ctx.strokeRect(w*0.28, h*0.6, w*0.44, h*0.08);
                // Stem
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.6);
                ctx.quadraticCurveTo(w*0.45, h*0.45, w/2, h*0.35);
                ctx.stroke();
                // Leaves on stem
                ctx.beginPath();
                ctx.ellipse(w*0.38, h*0.5, w*0.08, w*0.04, -0.5, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(w*0.6, h*0.45, w*0.07, w*0.035, 0.5, 0, Math.PI*2);
                ctx.stroke();
                // Petals (6 overlapping)
                for(let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    ctx.beginPath();
                    ctx.ellipse(w/2 + Math.cos(angle)*w*0.1, h*0.25 + Math.sin(angle)*w*0.1, w*0.1, w*0.06, angle, 0, Math.PI*2);
                    ctx.stroke();
                }
                // Center with detail
                ctx.beginPath();
                ctx.arc(w/2, h*0.25, w*0.05, 0, Math.PI*2);
                ctx.stroke();
                // Inner center dots
                for(let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.arc(w/2 + Math.cos(i*1.2)*w*0.02, h*0.25 + Math.sin(i*1.2)*w*0.02, 2, 0, Math.PI*2);
                    ctx.fill();
                }
            }},
            { name: 'Dog', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                // Body
                ctx.beginPath();
                ctx.ellipse(w*0.45, h*0.55, w*0.22, w*0.14, 0, 0, Math.PI*2);
                ctx.stroke();
                // Head
                ctx.beginPath();
                ctx.arc(w*0.72, h*0.4, w*0.12, 0, Math.PI*2);
                ctx.stroke();
                // Snout
                ctx.beginPath();
                ctx.ellipse(w*0.85, h*0.43, w*0.06, w*0.04, 0, 0, Math.PI*2);
                ctx.stroke();
                // Nose
                ctx.beginPath();
                ctx.arc(w*0.9, h*0.43, w*0.02, 0, Math.PI*2);
                ctx.fill();
                // Ears (floppy)
                ctx.beginPath();
                ctx.ellipse(w*0.65, h*0.32, w*0.04, w*0.1, -0.3, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(w*0.78, h*0.3, w*0.04, w*0.1, 0.3, 0, Math.PI*2);
                ctx.stroke();
                // Eyes
                ctx.beginPath();
                ctx.arc(w*0.68, h*0.38, w*0.02, 0, Math.PI*2);
                ctx.arc(w*0.76, h*0.38, w*0.02, 0, Math.PI*2);
                ctx.fill();
                // Legs
                ctx.strokeRect(w*0.28, h*0.65, w*0.06, h*0.2);
                ctx.strokeRect(w*0.38, h*0.65, w*0.06, h*0.2);
                ctx.strokeRect(w*0.52, h*0.65, w*0.06, h*0.2);
                ctx.strokeRect(w*0.62, h*0.65, w*0.06, h*0.2);
                // Tail
                ctx.beginPath();
                ctx.moveTo(w*0.23, h*0.52);
                ctx.quadraticCurveTo(w*0.1, h*0.35, w*0.15, h*0.25);
                ctx.stroke();
            }},
            { name: 'Fish', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                // Body
                ctx.beginPath();
                ctx.ellipse(w*0.5, h*0.5, w*0.28, w*0.15, 0, 0, Math.PI*2);
                ctx.stroke();
                // Tail
                ctx.beginPath();
                ctx.moveTo(w*0.22, h*0.5);
                ctx.lineTo(w*0.08, h*0.3);
                ctx.lineTo(w*0.08, h*0.7);
                ctx.closePath();
                ctx.stroke();
                // Dorsal fin
                ctx.beginPath();
                ctx.moveTo(w*0.4, h*0.35);
                ctx.quadraticCurveTo(w*0.5, h*0.15, w*0.6, h*0.35);
                ctx.stroke();
                // Bottom fin
                ctx.beginPath();
                ctx.moveTo(w*0.45, h*0.65);
                ctx.quadraticCurveTo(w*0.5, h*0.8, w*0.55, h*0.65);
                ctx.stroke();
                // Eye
                ctx.beginPath();
                ctx.arc(w*0.68, h*0.47, w*0.04, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(w*0.69, h*0.46, w*0.015, 0, Math.PI*2);
                ctx.fill();
                // Scales pattern
                for(let row = 0; row < 3; row++) {
                    for(let col = 0; col < 4; col++) {
                        ctx.beginPath();
                        ctx.arc(w*(0.35 + col*0.08), h*(0.42 + row*0.06), w*0.03, 0, Math.PI);
                        ctx.stroke();
                    }
                }
                // Mouth
                ctx.beginPath();
                ctx.arc(w*0.78, h*0.52, w*0.02, Math.PI*0.5, Math.PI*1.5);
                ctx.stroke();
            }},
            { name: 'Mushroom', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                // Stem
                ctx.beginPath();
                ctx.moveTo(w*0.38, h*0.55);
                ctx.lineTo(w*0.35, h*0.9);
                ctx.lineTo(w*0.65, h*0.9);
                ctx.lineTo(w*0.62, h*0.55);
                ctx.stroke();
                // Cap
                ctx.beginPath();
                ctx.arc(w/2, h*0.4, w*0.3, Math.PI, 0);
                ctx.lineTo(w*0.62, h*0.55);
                ctx.lineTo(w*0.38, h*0.55);
                ctx.closePath();
                ctx.stroke();
                // Spots on cap
                ctx.beginPath();
                ctx.arc(w*0.35, h*0.32, w*0.05, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(w*0.55, h*0.22, w*0.04, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(w*0.65, h*0.35, w*0.035, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(w*0.45, h*0.38, w*0.03, 0, Math.PI*2);
                ctx.stroke();
                // Grass
                for(let i = 0; i < 7; i++) {
                    ctx.beginPath();
                    ctx.moveTo(w*(0.2 + i*0.1), h*0.92);
                    ctx.lineTo(w*(0.22 + i*0.1), h*0.82);
                    ctx.stroke();
                }
            }}
        ],
        hard: [
            { name: 'Detailed Rose', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Stem with thorns
                ctx.beginPath();
                ctx.moveTo(w/2, h*0.55);
                ctx.quadraticCurveTo(w*0.42, h*0.7, w*0.48, h*0.95);
                ctx.stroke();
                // Thorns
                for(let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(w*(0.46 - i*0.01), h*(0.62 + i*0.1));
                    ctx.lineTo(w*(0.4 - i*0.01), h*(0.6 + i*0.1));
                    ctx.stroke();
                }
                // Detailed leaves with veins
                ctx.beginPath();
                ctx.ellipse(w*0.32, h*0.72, w*0.12, w*0.05, -0.5, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(w*0.24, h*0.72);
                ctx.lineTo(w*0.4, h*0.72);
                ctx.stroke();
                for(let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(w*(0.28 + i*0.04), h*0.72);
                    ctx.lineTo(w*(0.26 + i*0.04), h*(0.69 + (i%2)*0.06));
                    ctx.stroke();
                }
                // Multi-layer petals (4 layers)
                const cx = w/2, cy = h*0.35;
                for(let layer = 0; layer < 4; layer++) {
                    const r = w*(0.06 + layer*0.05);
                    const petals = 5 + layer;
                    for(let i = 0; i < petals; i++) {
                        const angle = (i/petals)*Math.PI*2 + layer*0.3;
                        ctx.beginPath();
                        ctx.ellipse(cx + Math.cos(angle)*r*0.5, cy + Math.sin(angle)*r*0.5, r*0.3, r*0.18, angle, 0, Math.PI*2);
                        ctx.stroke();
                    }
                }
                // Shading guides (dashed)
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = '#888';
                ctx.beginPath();
                ctx.arc(cx - w*0.05, cy - h*0.02, w*0.08, Math.PI*0.6, Math.PI*1.4);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cx + w*0.04, cy + h*0.02, w*0.06, Math.PI*1.6, Math.PI*0.4);
                ctx.stroke();
                ctx.setLineDash([]);
            }},
            { name: 'Castle', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Main wall
                ctx.strokeRect(w*0.2, h*0.45, w*0.6, h*0.5);
                // Battlements
                for(let i = 0; i < 5; i++) {
                    ctx.strokeRect(w*(0.2 + i*0.15), h*0.38, w*0.1, h*0.07);
                }
                // Left tower
                ctx.strokeRect(w*0.1, h*0.25, w*0.15, h*0.7);
                ctx.beginPath();
                ctx.moveTo(w*0.1, h*0.25);
                ctx.lineTo(w*0.175, h*0.1);
                ctx.lineTo(w*0.25, h*0.25);
                ctx.stroke();
                // Right tower
                ctx.strokeRect(w*0.75, h*0.25, w*0.15, h*0.7);
                ctx.beginPath();
                ctx.moveTo(w*0.75, h*0.25);
                ctx.lineTo(w*0.825, h*0.1);
                ctx.lineTo(w*0.9, h*0.25);
                ctx.stroke();
                // Gate
                ctx.beginPath();
                ctx.moveTo(w*0.4, h*0.95);
                ctx.lineTo(w*0.4, h*0.65);
                ctx.arc(w*0.5, h*0.65, w*0.1, Math.PI, 0);
                ctx.lineTo(w*0.6, h*0.95);
                ctx.stroke();
                // Gate grid
                ctx.beginPath();
                ctx.moveTo(w*0.5, h*0.55);
                ctx.lineTo(w*0.5, h*0.95);
                ctx.moveTo(w*0.4, h*0.75);
                ctx.lineTo(w*0.6, h*0.75);
                ctx.moveTo(w*0.4, h*0.85);
                ctx.lineTo(w*0.6, h*0.85);
                ctx.stroke();
                // Windows
                ctx.strokeRect(w*0.3, h*0.55, w*0.06, h*0.08);
                ctx.strokeRect(w*0.64, h*0.55, w*0.06, h*0.08);
                // Tower windows
                ctx.beginPath();
                ctx.arc(w*0.175, h*0.4, w*0.03, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(w*0.825, h*0.4, w*0.03, 0, Math.PI*2);
                ctx.stroke();
                // Flag
                ctx.beginPath();
                ctx.moveTo(w*0.175, h*0.1);
                ctx.lineTo(w*0.175, h*0.02);
                ctx.lineTo(w*0.25, h*0.06);
                ctx.lineTo(w*0.175, h*0.1);
                ctx.stroke();
            }},
            { name: 'Owl', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Body
                ctx.beginPath();
                ctx.ellipse(w/2, h*0.6, w*0.22, h*0.3, 0, 0, Math.PI*2);
                ctx.stroke();
                // Head
                ctx.beginPath();
                ctx.arc(w/2, h*0.28, w*0.18, 0, Math.PI*2);
                ctx.stroke();
                // Ear tufts
                ctx.beginPath();
                ctx.moveTo(w*0.35, h*0.18);
                ctx.lineTo(w*0.28, h*0.05);
                ctx.lineTo(w*0.4, h*0.15);
                ctx.moveTo(w*0.65, h*0.18);
                ctx.lineTo(w*0.72, h*0.05);
                ctx.lineTo(w*0.6, h*0.15);
                ctx.stroke();
                // Eye circles (large)
                ctx.beginPath();
                ctx.arc(w*0.4, h*0.28, w*0.08, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(w*0.6, h*0.28, w*0.08, 0, Math.PI*2);
                ctx.stroke();
                // Pupils
                ctx.beginPath();
                ctx.arc(w*0.4, h*0.28, w*0.03, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(w*0.6, h*0.28, w*0.03, 0, Math.PI*2);
                ctx.fill();
                // Beak
                ctx.beginPath();
                ctx.moveTo(w*0.47, h*0.32);
                ctx.lineTo(w*0.5, h*0.4);
                ctx.lineTo(w*0.53, h*0.32);
                ctx.stroke();
                // Feather pattern on chest
                for(let row = 0; row < 4; row++) {
                    for(let col = 0; col < 3 + row; col++) {
                        const x = w*(0.35 + col*0.08 - row*0.04);
                        const y = h*(0.5 + row*0.1);
                        ctx.beginPath();
                        ctx.arc(x, y, w*0.025, 0, Math.PI);
                        ctx.stroke();
                    }
                }
                // Wings
                ctx.beginPath();
                ctx.ellipse(w*0.25, h*0.6, w*0.06, h*0.2, -0.2, 0, Math.PI*2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(w*0.75, h*0.6, w*0.06, h*0.2, 0.2, 0, Math.PI*2);
                ctx.stroke();
                // Feet
                ctx.beginPath();
                ctx.moveTo(w*0.4, h*0.88);
                ctx.lineTo(w*0.35, h*0.95);
                ctx.moveTo(w*0.4, h*0.88);
                ctx.lineTo(w*0.4, h*0.95);
                ctx.moveTo(w*0.4, h*0.88);
                ctx.lineTo(w*0.45, h*0.95);
                ctx.moveTo(w*0.6, h*0.88);
                ctx.lineTo(w*0.55, h*0.95);
                ctx.moveTo(w*0.6, h*0.88);
                ctx.lineTo(w*0.6, h*0.95);
                ctx.moveTo(w*0.6, h*0.88);
                ctx.lineTo(w*0.65, h*0.95);
                ctx.stroke();
            }},
            { name: 'Ship', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Hull
                ctx.beginPath();
                ctx.moveTo(w*0.1, h*0.65);
                ctx.lineTo(w*0.15, h*0.85);
                ctx.lineTo(w*0.85, h*0.85);
                ctx.lineTo(w*0.95, h*0.65);
                ctx.closePath();
                ctx.stroke();
                // Deck line
                ctx.beginPath();
                ctx.moveTo(w*0.12, h*0.68);
                ctx.lineTo(w*0.93, h*0.68);
                ctx.stroke();
                // Mast
                ctx.beginPath();
                ctx.moveTo(w*0.5, h*0.65);
                ctx.lineTo(w*0.5, h*0.1);
                ctx.stroke();
                // Sails
                ctx.beginPath();
                ctx.moveTo(w*0.5, h*0.15);
                ctx.quadraticCurveTo(w*0.7, h*0.25, w*0.5, h*0.4);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(w*0.5, h*0.42);
                ctx.quadraticCurveTo(w*0.72, h*0.52, w*0.5, h*0.62);
                ctx.stroke();
                // Flag
                ctx.beginPath();
                ctx.moveTo(w*0.5, h*0.1);
                ctx.lineTo(w*0.6, h*0.13);
                ctx.lineTo(w*0.5, h*0.16);
                ctx.stroke();
                // Portholes
                for(let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.arc(w*(0.25 + i*0.15), h*0.75, w*0.025, 0, Math.PI*2);
                    ctx.stroke();
                }
                // Waves
                ctx.beginPath();
                for(let x = 0; x < w; x += 30) {
                    ctx.moveTo(x, h*0.88);
                    ctx.quadraticCurveTo(x + 15, h*0.85, x + 30, h*0.88);
                }
                ctx.stroke();
            }}
        ],
        extreme: [
            { name: 'Dragon', draw: (ctx, w, h) => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Body with gradient
                const bodyGrad = ctx.createLinearGradient(w*0.2, h*0.3, w*0.8, h*0.7);
                bodyGrad.addColorStop(0, 'rgba(50, 150, 50, 0.3)');
                bodyGrad.addColorStop(1, 'rgba(20, 80, 20, 0.4)');
                ctx.fillStyle = bodyGrad;
                // Main body
                ctx.beginPath();
                ctx.ellipse(w*0.5, h*0.55, w*0.25, h*0.18, 0.1, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
                // Neck
                ctx.beginPath();
                ctx.moveTo(w*0.7, h*0.45);
                ctx.quadraticCurveTo(w*0.8, h*0.3, w*0.75, h*0.2);
                ctx.quadraticCurveTo(w*0.85, h*0.25, w*0.78, h*0.42);
                ctx.fill();
                ctx.stroke();
                // Head
                ctx.beginPath();
                ctx.ellipse(w*0.78, h*0.15, w*0.1, h*0.08, 0.3, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
                // Snout
                ctx.beginPath();
                ctx.moveTo(w*0.85, h*0.12);
                ctx.lineTo(w*0.95, h*0.1);
                ctx.lineTo(w*0.95, h*0.18);
                ctx.lineTo(w*0.85, h*0.18);
                ctx.stroke();
                // Eye
                ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
                ctx.beginPath();
                ctx.ellipse(w*0.8, h*0.12, w*0.02, h*0.015, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(w*0.8, h*0.12, w*0.008, h*0.012, 0, 0, Math.PI*2);
                ctx.fill();
                // Horns
                ctx.beginPath();
                ctx.moveTo(w*0.72, h*0.1);
                ctx.lineTo(w*0.68, h*0.02);
                ctx.moveTo(w*0.77, h*0.08);
                ctx.lineTo(w*0.75, h*0.01);
                ctx.stroke();
                // Wings
                ctx.fillStyle = 'rgba(100, 180, 100, 0.25)';
                ctx.beginPath();
                ctx.moveTo(w*0.45, h*0.45);
                ctx.lineTo(w*0.2, h*0.15);
                ctx.lineTo(w*0.15, h*0.3);
                ctx.lineTo(w*0.25, h*0.35);
                ctx.lineTo(w*0.1, h*0.4);
                ctx.lineTo(w*0.3, h*0.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Wing membrane lines
                ctx.beginPath();
                ctx.moveTo(w*0.45, h*0.45);
                ctx.lineTo(w*0.2, h*0.15);
                ctx.moveTo(w*0.4, h*0.47);
                ctx.lineTo(w*0.15, h*0.3);
                ctx.moveTo(w*0.35, h*0.48);
                ctx.lineTo(w*0.1, h*0.4);
                ctx.stroke();
                // Legs
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(w*0.35, h*0.68);
                ctx.lineTo(w*0.3, h*0.85);
                ctx.lineTo(w*0.25, h*0.88);
                ctx.moveTo(w*0.3, h*0.85);
                ctx.lineTo(w*0.32, h*0.88);
                ctx.moveTo(w*0.55, h*0.7);
                ctx.lineTo(w*0.6, h*0.85);
                ctx.lineTo(w*0.55, h*0.88);
                ctx.moveTo(w*0.6, h*0.85);
                ctx.lineTo(w*0.62, h*0.88);
                ctx.stroke();
                // Tail
                ctx.beginPath();
                ctx.moveTo(w*0.25, h*0.55);
                ctx.quadraticCurveTo(w*0.1, h*0.6, w*0.05, h*0.75);
                ctx.quadraticCurveTo(w*0.08, h*0.8, w*0.12, h*0.72);
                ctx.stroke();
                // Spikes along back
                for(let i = 0; i < 6; i++) {
                    ctx.beginPath();
                    ctx.moveTo(w*(0.35 + i*0.07), h*(0.4 - i*0.02));
                    ctx.lineTo(w*(0.38 + i*0.07), h*(0.32 - i*0.02));
                    ctx.lineTo(w*(0.41 + i*0.07), h*(0.4 - i*0.02));
                    ctx.stroke();
                }
                // Fire breath
                ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
                ctx.beginPath();
                ctx.moveTo(w*0.95, h*0.14);
                ctx.quadraticCurveTo(w*1.05, h*0.1, w*1.0, h*0.05);
                ctx.quadraticCurveTo(w*1.08, h*0.12, w*1.05, h*0.2);
                ctx.quadraticCurveTo(w*1.0, h*0.16, w*0.95, h*0.18);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 50, 0, 0.5)';
                ctx.stroke();
            }},
            { name: 'Underwater Scene', draw: (ctx, w, h) => {
                // Water gradient background
                const waterGrad = ctx.createLinearGradient(0, 0, 0, h);
                waterGrad.addColorStop(0, 'rgba(0, 150, 200, 0.2)');
                waterGrad.addColorStop(0.5, 'rgba(0, 100, 180, 0.3)');
                waterGrad.addColorStop(1, 'rgba(0, 50, 100, 0.4)');
                ctx.fillStyle = waterGrad;
                ctx.fillRect(0, 0, w, h);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Coral formations
                ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
                ctx.beginPath();
                ctx.moveTo(w*0.1, h*0.95);
                for(let i = 0; i < 5; i++) {
                    ctx.quadraticCurveTo(w*(0.1 + i*0.03), h*(0.7 - i*0.05), w*(0.12 + i*0.03), h*(0.75 - i*0.03));
                }
                ctx.lineTo(w*0.25, h*0.95);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // More coral
                ctx.fillStyle = 'rgba(255, 150, 50, 0.4)';
                ctx.beginPath();
                ctx.moveTo(w*0.75, h*0.95);
                for(let i = 0; i < 4; i++) {
                    ctx.lineTo(w*(0.78 + i*0.04), h*(0.65 + (i%2)*0.1));
                }
                ctx.lineTo(w*0.92, h*0.95);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Fish 1 (detailed)
                ctx.fillStyle = 'rgba(255, 180, 0, 0.5)';
                ctx.beginPath();
                ctx.ellipse(w*0.35, h*0.35, w*0.1, h*0.06, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
                // Fish tail
                ctx.beginPath();
                ctx.moveTo(w*0.25, h*0.35);
                ctx.lineTo(w*0.15, h*0.28);
                ctx.lineTo(w*0.15, h*0.42);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Fish fins
                ctx.beginPath();
                ctx.moveTo(w*0.35, h*0.29);
                ctx.lineTo(w*0.38, h*0.2);
                ctx.lineTo(w*0.4, h*0.29);
                ctx.stroke();
                // Fish eye
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(w*0.42, h*0.33, w*0.015, 0, Math.PI*2);
                ctx.fill();
                // Stripes on fish
                ctx.beginPath();
                ctx.moveTo(w*0.32, h*0.29);
                ctx.lineTo(w*0.3, h*0.41);
                ctx.moveTo(w*0.38, h*0.3);
                ctx.lineTo(w*0.36, h*0.4);
                ctx.stroke();
                // Jellyfish
                ctx.fillStyle = 'rgba(200, 100, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(w*0.7, h*0.25, w*0.08, Math.PI, 0);
                ctx.fill();
                ctx.stroke();
                // Tentacles
                for(let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.moveTo(w*(0.64 + i*0.03), h*0.25);
                    ctx.quadraticCurveTo(w*(0.62 + i*0.03), h*0.4, w*(0.65 + i*0.03), h*0.5);
                    ctx.stroke();
                }
                // Bubbles
                for(let i = 0; i < 8; i++) {
                    const bx = w*(0.2 + Math.random()*0.6);
                    const by = h*(0.1 + Math.random()*0.7);
                    const br = w*(0.01 + Math.random()*0.02);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.arc(bx, by, br, 0, Math.PI*2);
                    ctx.fill();
                    ctx.stroke();
                }
                // Seaweed
                ctx.strokeStyle = 'rgba(0, 100, 50, 0.8)';
                ctx.lineWidth = 3;
                for(let s = 0; s < 3; s++) {
                    ctx.beginPath();
                    ctx.moveTo(w*(0.5 + s*0.08), h*0.95);
                    for(let i = 0; i < 4; i++) {
                        ctx.quadraticCurveTo(
                            w*(0.48 + s*0.08 + (i%2)*0.06),
                            h*(0.85 - i*0.15),
                            w*(0.5 + s*0.08),
                            h*(0.8 - i*0.15)
                        );
                    }
                    ctx.stroke();
                }
                // Sandy bottom
                ctx.fillStyle = 'rgba(220, 200, 150, 0.4)';
                ctx.fillRect(0, h*0.9, w, h*0.1);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, h*0.9);
                ctx.lineTo(w, h*0.9);
                ctx.stroke();
            }},
            { name: 'Forest Path', draw: (ctx, w, h) => {
                // Sky through trees
                const skyGrad = ctx.createLinearGradient(0, 0, 0, h*0.4);
                skyGrad.addColorStop(0, 'rgba(135, 200, 250, 0.3)');
                skyGrad.addColorStop(1, 'rgba(200, 230, 200, 0.2)');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, w, h*0.5);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                // Path (perspective)
                ctx.fillStyle = 'rgba(180, 150, 100, 0.4)';
                ctx.beginPath();
                ctx.moveTo(w*0.3, h);
                ctx.lineTo(w*0.45, h*0.4);
                ctx.lineTo(w*0.55, h*0.4);
                ctx.lineTo(w*0.7, h);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Trees on left
                for(let i = 0; i < 3; i++) {
                    const tx = w*(0.05 + i*0.08);
                    const scale = 1 - i*0.15;
                    // Trunk
                    ctx.fillStyle = 'rgba(100, 70, 40, 0.5)';
                    ctx.fillRect(tx, h*(0.3 + i*0.1), w*0.04*scale, h*0.5*scale);
                    ctx.strokeRect(tx, h*(0.3 + i*0.1), w*0.04*scale, h*0.5*scale);
                    // Foliage layers
                    ctx.fillStyle = 'rgba(30, 100, 30, 0.4)';
                    for(let layer = 0; layer < 3; layer++) {
                        ctx.beginPath();
                        ctx.moveTo(tx + w*0.02*scale, h*(0.15 + i*0.1 + layer*0.08));
                        ctx.lineTo(tx - w*0.06*scale + layer*w*0.02, h*(0.35 + i*0.1 + layer*0.08));
                        ctx.lineTo(tx + w*0.1*scale - layer*w*0.02, h*(0.35 + i*0.1 + layer*0.08));
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                }
                // Trees on right
                for(let i = 0; i < 3; i++) {
                    const tx = w*(0.82 - i*0.08);
                    const scale = 1 - i*0.15;
                    ctx.fillStyle = 'rgba(100, 70, 40, 0.5)';
                    ctx.fillRect(tx, h*(0.3 + i*0.1), w*0.04*scale, h*0.5*scale);
                    ctx.strokeRect(tx, h*(0.3 + i*0.1), w*0.04*scale, h*0.5*scale);
                    ctx.fillStyle = 'rgba(30, 100, 30, 0.4)';
                    for(let layer = 0; layer < 3; layer++) {
                        ctx.beginPath();
                        ctx.moveTo(tx + w*0.02*scale, h*(0.15 + i*0.1 + layer*0.08));
                        ctx.lineTo(tx - w*0.06*scale + layer*w*0.02, h*(0.35 + i*0.1 + layer*0.08));
                        ctx.lineTo(tx + w*0.1*scale - layer*w*0.02, h*(0.35 + i*0.1 + layer*0.08));
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                }
                // Sun rays through trees
                ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(w*0.5, h*0.1);
                ctx.lineTo(w*0.3, h*0.6);
                ctx.moveTo(w*0.5, h*0.1);
                ctx.lineTo(w*0.5, h*0.5);
                ctx.moveTo(w*0.5, h*0.1);
                ctx.lineTo(w*0.7, h*0.6);
                ctx.stroke();
                // Grass/undergrowth
                ctx.strokeStyle = 'rgba(50, 120, 50, 0.6)';
                ctx.lineWidth = 2;
                for(let i = 0; i < 20; i++) {
                    const gx = w*(0.05 + Math.random()*0.2);
                    ctx.beginPath();
                    ctx.moveTo(gx, h*0.95);
                    ctx.lineTo(gx + w*0.02, h*(0.85 + Math.random()*0.05));
                    ctx.stroke();
                }
                for(let i = 0; i < 20; i++) {
                    const gx = w*(0.75 + Math.random()*0.2);
                    ctx.beginPath();
                    ctx.moveTo(gx, h*0.95);
                    ctx.lineTo(gx - w*0.02, h*(0.85 + Math.random()*0.05));
                    ctx.stroke();
                }
                // Mushrooms on path edge
                ctx.fillStyle = 'rgba(200, 50, 50, 0.5)';
                ctx.beginPath();
                ctx.arc(w*0.32, h*0.85, w*0.025, Math.PI, 0);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = 'rgba(240, 230, 200, 0.6)';
                ctx.fillRect(w*0.315, h*0.85, w*0.01, h*0.04);
                ctx.strokeRect(w*0.315, h*0.85, w*0.01, h*0.04);
                // White spots on mushroom
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(w*0.31, h*0.82, w*0.005, 0, Math.PI*2);
                ctx.arc(w*0.33, h*0.83, w*0.004, 0, Math.PI*2);
                ctx.fill();
            }}
        ]
    },

    init(container) {
        this.resetState();
        container.innerHTML = this.getModeSelectionHTML();
        this.attachModeListeners(container);
    },

    resetState() {
        this.mode = null;
        this.drawing = false;
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.isEraser = false;
        this.timer = 120;
        this.currentPlayer = 1;
        this.strokes = [];
        this.currentStroke = [];
        this.refImageName = '';
        if (this.timerInterval) clearInterval(this.timerInterval);
    },

    getModeSelectionHTML() {
        return `
            <div class="drawing-container">
                <div class="mode-selection">
                    <h2>Turn-based Drawing Relay</h2>
                    <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">
                        Take turns drawing together to create a masterpiece!
                    </p>
                    <div class="mode-buttons">
                        <button class="mode-btn" data-mode="digital">
                            <span class="icon">🎨</span>
                            <span>Digital Canvas</span>
                            <span style="font-size: 0.8rem; opacity: 0.7;">Share one screen together</span>
                        </button>
                        <button class="mode-btn" data-mode="irl">
                            <span class="icon">📝</span>
                            <span>IRL Paper Mode</span>
                            <span style="font-size: 0.8rem; opacity: 0.7;">Draw on real paper</span>
                        </button>
                    </div>
                    <button class="reset-btn" id="reset-activity" style="margin-top: 30px;">Reset Activity</button>
                </div>
            </div>
        `;
    },

    attachModeListeners(container) {
        container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                AudioManager.playEffect('click');
                this.showDifficultySelection(container);
            });
        });

        const resetBtn = container.querySelector('#reset-activity');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset drawing activity progress?')) {
                    GameState.activities.drawing.completed = false;
                    GameState.save();
                    this.init(container);
                }
            });
        }
    },

    showDifficultySelection(container) {
        const drawingContainer = container.querySelector('.drawing-container') || container;

        drawingContainer.innerHTML = `
            <div class="difficulty-selection">
                <h3>Choose Difficulty</h3>
                <p style="color: rgba(255,255,255,0.6); margin-bottom: 20px;">
                    <strong>Easy:</strong> Simple outlines (heart, star, smiley)<br>
                    <strong>Medium:</strong> Basic shapes with more detail<br>
                    <strong>Hard:</strong> Detailed with shading guides<br>
                    <strong>Extreme:</strong> Complex with colors
                </p>
                <div class="difficulty-buttons">
                    <button class="diff-btn" data-diff="easy">Easy</button>
                    <button class="diff-btn" data-diff="medium">Medium</button>
                    <button class="diff-btn" data-diff="hard">Hard</button>
                    <button class="diff-btn" data-diff="extreme">Extreme</button>
                </div>
                <button class="reset-btn" id="back-btn" style="margin-top: 20px;">Back</button>
            </div>
        `;

        drawingContainer.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                AudioManager.playEffect('click');
                this.startDrawing(container);
            });
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            this.init(container);
        });
    },

    generateRefImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 300, 300);

        const images = this.drawRefImages[this.difficulty];
        const selected = images[Math.floor(Math.random() * images.length)];

        selected.draw(ctx, 300, 300);
        this.refImageName = selected.name;

        return { canvas, name: selected.name };
    },

    startDrawing(container) {
        if (this.mode === 'irl') {
            this.startIRLMode(container);
        } else {
            this.startDigitalMode(container);
        }
    },

    startIRLMode(container) {
        const ref = this.generateRefImage();

        container.innerHTML = `
            <div class="drawing-container">
                <div class="drawing-interface">
                    <h3 style="color: var(--warm-pink); margin-bottom: 10px;">
                        Draw: ${ref.name}
                    </h3>
                    <p style="color: rgba(255,255,255,0.6); margin-bottom: 15px;">
                        Grab paper and pencils! Take turns drawing every 2 minutes.
                    </p>
                    <div class="timer-display" id="timer">2:00</div>
                    <div class="turn-indicator" id="turn-indicator">
                        Player ${this.currentPlayer}'s turn!
                    </div>
                    <div class="canvas-panel" style="margin: 20px 0;">
                        <h4>Reference Image</h4>
                        <div id="ref-container" style="border: 3px solid var(--primary-pink); border-radius: 15px; overflow: hidden; display: inline-block;"></div>
                    </div>
                    <div class="irl-controls">
                        <button class="action-btn" id="switch-turn-btn">Switch Turn</button>
                        <button class="action-btn" id="finish-btn">Finish Drawing</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ref-container').appendChild(ref.canvas);
        ref.canvas.style.display = 'block';

        this.startTimer(false); // No auto-switch for IRL

        document.getElementById('switch-turn-btn').addEventListener('click', () => {
            this.switchTurn();
        });

        document.getElementById('finish-btn').addEventListener('click', () => {
            this.completeActivity(container);
        });
    },

    startDigitalMode(container) {
        const ref = this.generateRefImage();
        const showColorTools = this.difficulty === 'hard' || this.difficulty === 'extreme';

        container.innerHTML = `
            <div class="drawing-container">
                <div class="drawing-interface">
                    <h3 style="color: var(--warm-pink); margin-bottom: 5px;">Draw: ${ref.name}</h3>
                    <p style="color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 10px;">
                        Both players share this canvas - take turns!
                    </p>
                    <div class="timer-display" id="timer">2:00</div>
                    <div class="turn-indicator" id="turn-indicator">
                        Player ${this.currentPlayer}'s turn!
                    </div>
                    <div class="canvas-container">
                        <div class="canvas-panel">
                            <h4>Reference</h4>
                            <div id="ref-container" style="border: 3px solid var(--primary-pink); border-radius: 15px; overflow: hidden;"></div>
                        </div>
                        <div class="canvas-panel">
                            <h4>Your Canvas</h4>
                            <canvas id="drawing-canvas" class="drawing-canvas" width="300" height="300"></canvas>
                        </div>
                    </div>
                    <div class="tools-panel">
                        ${showColorTools ? '<input type="color" class="color-picker" id="color-picker" value="#000000">' : ''}
                        <input type="range" class="brush-size" id="brush-size" min="1" max="${showColorTools ? 20 : 12}" value="5">
                        <button class="tool-btn" id="eraser-btn">Eraser</button>
                        <button class="tool-btn" id="pen-btn">Pen</button>
                        <button class="tool-btn" id="undo-btn">Undo</button>
                        <button class="tool-btn" id="clear-btn">Clear</button>
                    </div>
                    <div class="action-buttons" style="margin-top: 15px;">
                        <button class="action-btn" id="switch-turn-btn">Switch Turn</button>
                        <button class="action-btn" id="finish-btn">Finish</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ref-container').appendChild(ref.canvas);
        ref.canvas.style.display = 'block';

        this.setupCanvas(showColorTools);
        this.startTimer(false); // Timer doesn't auto-switch, just tracks time

        document.getElementById('switch-turn-btn').addEventListener('click', () => {
            this.switchTurn();
        });
    },

    setupCanvas(showColorTools) {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startStroke(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.endStroke());
        this.canvas.addEventListener('mouseleave', () => this.endStroke());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startStroke(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.endStroke());

        // Tool controls
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.currentColor = e.target.value;
                this.isEraser = false;
                document.getElementById('eraser-btn').classList.remove('active');
                document.getElementById('pen-btn').classList.add('active');
            });
        }

        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
        });

        document.getElementById('eraser-btn').addEventListener('click', (e) => {
            this.isEraser = true;
            e.target.classList.add('active');
            document.getElementById('pen-btn').classList.remove('active');
        });

        document.getElementById('pen-btn').addEventListener('click', (e) => {
            this.isEraser = false;
            e.target.classList.add('active');
            document.getElementById('eraser-btn').classList.remove('active');
        });

        document.getElementById('undo-btn').addEventListener('click', () => this.undo());

        document.getElementById('clear-btn').addEventListener('click', () => {
            if (confirm('Clear the entire canvas?')) {
                this.strokes = [];
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                AudioManager.playEffect('click');
            }
        });

        document.getElementById('finish-btn').addEventListener('click', () => {
            this.completeActivity(document.getElementById('activity-content'));
        });
    },

    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    },

    startStroke(e) {
        this.drawing = true;
        const coords = this.getCanvasCoords(e);
        this.currentStroke = [{...coords, color: this.isEraser ? 'white' : this.currentColor, size: this.brushSize}];

        this.ctx.beginPath();
        this.ctx.moveTo(coords.x, coords.y);
    },

    draw(e) {
        if (!this.drawing) return;

        const coords = this.getCanvasCoords(e);
        this.currentStroke.push(coords);

        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.strokeStyle = this.isEraser ? 'white' : this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    },

    endStroke() {
        if (this.drawing && this.currentStroke.length > 0) {
            const stroke = {
                points: [...this.currentStroke],
                color: this.currentStroke[0].color,
                size: this.currentStroke[0].size
            };
            this.strokes.push(stroke);
        }
        this.drawing = false;
        this.currentStroke = [];
    },

    undo() {
        if (this.strokes.length === 0) return;
        this.strokes.pop();
        this.redrawCanvas();
        AudioManager.playEffect('click');
    },

    redrawCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;

            this.ctx.beginPath();
            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            for (let i = 1; i < stroke.points.length; i++) {
                this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }

            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
        });
    },

    startTimer(autoSwitch = false) {
        this.timer = 120;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();

            if (this.timer <= 0) {
                if (autoSwitch) {
                    this.switchTurn();
                } else {
                    // Just reset timer, don't force switch
                    this.timer = 120;
                    AudioManager.playEffect('switch');
                }
            }
        }, 1000);
    },

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const display = document.getElementById('timer');
        if (display) {
            display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (this.timer <= 10) {
                display.style.color = '#ff4444';
            } else if (this.timer <= 30) {
                display.style.color = '#ffaa00';
            } else {
                display.style.color = 'var(--primary-gold)';
            }
        }
    },

    switchTurn() {
        AudioManager.playEffect('switch');
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.timer = 120;

        const indicator = document.getElementById('turn-indicator');
        if (indicator) {
            indicator.textContent = `Player ${this.currentPlayer}'s turn!`;
            indicator.style.background = this.currentPlayer === 1
                ? 'rgba(255, 107, 157, 0.2)'
                : 'rgba(100, 200, 255, 0.2)';
        }
    },

    completeActivity(container) {
        clearInterval(this.timerInterval);
        AudioManager.playEffect('celebration');

        const isNew = GameState.completeActivity('drawing');

        container.innerHTML = `
            <div class="activity-complete">
                <h2>Beautiful Creation!</h2>
                <div class="puzzle-piece-animation">🎨</div>
                <p class="pieces-earned">${isNew ? 'You earned 5 puzzle pieces!' : 'Activity completed!'}</p>
                <p style="color: rgba(255,255,255,0.7); margin: 20px 0;">
                    Drawing together creates the most beautiful memories!
                </p>
                <button class="action-btn" id="back-to-menu">Back to Menu</button>
            </div>
        `;

        document.getElementById('back-to-menu').addEventListener('click', () => {
            window.App.showLanding();
        });
    },

    cleanup() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.strokes = [];
        this.currentPlayer = 1;
    }
};
