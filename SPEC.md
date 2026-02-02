# Valentine's Day Website for Prashika - Complete Specification

## Project Overview
An interactive, romantic website created as a Valentine's Day proposal. The experience centers around completing 5 unique activities to collect puzzle pieces that reveal a special photo, culminating in the Valentine's Day question.

---

## Technical Requirements

### Tech Stack
- React (recommended for component structure and state management)
- HTML5 Canvas for drawing activities
- Web Audio API for music visualization
- CSS3 for animations and transitions
- WebSocket or similar for real-time multiplayer features (drawing relay)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design not critical (designed for desktop/laptop experience)

### File Structure Requirements
- `/assets/images/memories/` - Photos for Memory Lane Maze
- `/assets/images/puzzle/` - Final puzzle reveal image (bell tower photo)
- `/assets/audio/songs/` - Songs for Rhythm of Us activity
- `/assets/images/drawable/` - Reference images for drawing activity (organized by difficulty)

---

## Overall Aesthetic & Design Principles

### Visual Style
- **Color Palette:** Warm sunset tones (peachy, pink, golden, soft oranges)
- **Typography:** Elegant, readable fonts - "Prashika" should be in beautiful script/serif
- **Animations:** Smooth, flowing transitions (no harsh cuts)
- **UI Philosophy:** Clean, minimal, unobtrusive - let the experience shine

### User Experience Principles
- Clear instructions for every activity
- No harsh fail states or punishing feedback
- Forgiving mechanics (generous timing windows, helpful hints)
- Progress always visible
- Can revisit/replay activities
- Smooth, intuitive navigation

---

## LANDING PAGE

### Layout
```
┌─────────────────────────────────────────┐
│                                         │
│            "Prashika"                   │
│        (beautiful font, top)            │
│                                         │
│    [Background: Sunset + Willows]       │
│                                         │
│  [Menu Button - toggles activity list]  │
│                                         │
└─────────────────────────────────────────┘
```

### Interactive Background
**Sunset with Willow Trees:**
- Beautiful illustrated sunset scene
- Willow trees in foreground/sides

**Interactions:**
1. **Cursor Hover on Trees:** Willow branches sway gently (wind effect)
2. **Click Anywhere on Background:** Cycles through time of day
   - Sunset → Night sky (stars) → Sunrise → Day (blue sky) → Sunset
   - Smooth transitions between each state (~2 second fade)
   - Sky colors, lighting, and star visibility change accordingly

### Menu System
**Menu Button:**
- Elegant, unobtrusive design
- Click to toggle show/hide activity buttons
- When hidden: full landscape visible for appreciation

**Activity Buttons (when menu shown):**
- Vertically stacked, not taking up too much space
- Clean, minimal design
- Each button shows:
  - Activity name
  - Completion status (✓ checkmark if completed, dimmed if not started)
  
**Button List:**
1. Turn-based Drawing Relay
2. Constellation Connect
3. Garden of Wishes
4. Memory Lane Maze
5. Rhythm of Us
6. **View Puzzle Progress** (special button, maybe different color/style)

### Progress Indicator
- Visible on menu: "Puzzle Progress: X/25 pieces collected"
- Small visual indicator (progress bar or mini puzzle frame)

---

## ACTIVITY 1: TURN-BASED DRAWING RELAY

### Mode Selection Screen
Two large, clear buttons:
1. **Digital Multiplayer** - "Draw together from different devices"
2. **IRL Paper Mode** - "Draw together on paper"

### Digital Multiplayer Mode

#### Room Creation & Joining
**Host Flow:**
1. Click "Digital Multiplayer"
2. Generates unique 4-6 digit PIN code
3. Display PIN prominently: "Share this PIN: XXXX"
4. "Waiting for partner to join..." message
5. Shows when partner connects

**Guest Flow:**
1. Click "Digital Multiplayer"
2. "Enter PIN to join:" input field
3. Enter PIN and click "Join"
4. Connects to host's room

**Important:** PIN system must actually work with real-time synchronization

#### Difficulty Selection
Both players see difficulty options (one player picks):
- **Easy** - Simple shapes and silhouettes
- **Medium** - Some detail but manageable  
- **Hard** - More intricate details
- **Extreme** - Photo-realistic or very detailed

Once difficulty selected, random image from that category loads

#### Drawing Interface
**Layout:**
```
┌────────────────────────────────────────┐
│  Reference Image    │   Your Canvas    │
│   (left side)       │   (right side)   │
│                     │                  │
│                     │  Drawing Tools:  │
│                     │  - Color picker  │
│     [IMAGE]         │  - Brush size    │
│                     │  - Eraser        │
│                     │  - Undo button   │
│                     │                  │
│        TIMER: 2:00  ←  (centered)      │
└────────────────────────────────────────┘
```

**Drawing Tools:**
- Color picker (full spectrum)
- Brush thickness slider (thin to thick)
- Eraser tool
- Undo button (for current turn only)

**Turn Mechanics:**
- 2-minute timer counts down prominently
- When it's YOUR turn:
  - Canvas and tools are active
  - Clear indication: "Your turn! Draw!"
- When it's THEIR turn:
  - Canvas locked (can't draw)
  - Tools greyed out/disabled
  - Timer still visible counting down
  - **CRITICAL:** You CANNOT see their drawing in real-time
  - Canvas shows last state (what was there when your turn ended)
- When timer hits 0:
  - **Big reveal:** Their additions suddenly appear!
  - Brief transition/animation (swoosh, fade-in)
  - Turn switches
  - Timer resets to 2:00

**Game End:**
- After 5-6 rounds (or player-chosen), game ends
- Shows final collaborative drawing
- "Save Drawing" button
- "Play Again" option
- Awards 5 puzzle pieces

### IRL Paper Mode

#### Simple Interface
```
┌─────────────────────────────────────┐
│                                     │
│      [REFERENCE IMAGE]              │
│         (large, centered)           │
│                                     │
│        TIMER: 2:00                  │
│     (large, prominent)              │
│                                     │
│     "Your turn!" / "Switch!"        │
│                                     │
└─────────────────────────────────────┘
```

**Difficulty Selection:**
- Same 4 difficulties as digital mode
- Loads appropriate reference image

**Timer Behavior:**
- Counts down from 2:00
- When hits 0:
  - Sound effect or animation
  - Message: "Switch! [Other person]'s turn!"
  - Automatically resets and starts counting again

**Game End:**
- Manual "Finish" button
- Awards 5 puzzle pieces

### Reference Images Requirements

**Image Categories by Difficulty:**

**Easy:**
- Simple willow tree silhouette
- Basic mountain outline
- Crescent moon
- Simple heart shape
- Single flower outline
- Sun/sunrise simple

**Medium:**
- Willow tree with branch detail
- Sunset with clouds
- Mountain range with trees
- Flower with defined petals (sunflower, rose)
- Simple landscape scene
- Bird or butterfly

**Hard:**
- Detailed landscape scene
- Complex flower arrangements
- Animal with some texture
- Architectural element (bridge, temple)
- Multiple-element composition

**Extreme:**
- Photo-realistic landscape
- Detailed portrait or figure
- Complex mandala
- Intricate architectural detail
- Very detailed animal
- Complex multi-element scene

**Image Style:** Illustrated/line art style preferred over photographs (more drawable)

**File Organization:**
```
/assets/images/drawable/
  /easy/
    - image1.jpg/png
    - image2.jpg/png
    ...
  /medium/
  /hard/
  /extreme/
```

---

## ACTIVITY 2: CONSTELLATION CONNECT

### Visual Design
- Deep navy/purple night sky background
- Twinkling stars of varying brightness
- Silhouette of mountains or willow trees at bottom horizon
- Ethereal, dreamy atmosphere
- Soft ambient background music

### Instructions Modal
"Connect the stars to form constellations and reveal messages about us!"
- "Click stars in sequence to connect them"
- "? button for hints if you need help"

### Gameplay

**Star Layout:**
- 3-4 different constellations hidden in the starfield
- Stars are clickable points of light
- Non-constellation stars also present (decorative)

**Connection Mechanics:**
- Click first star → glows brightly
- Click next star in sequence → line draws between them with glow effect
- Correct connection: Line stays, subtle sparkle animation
- Wrong connection: Line fades away gently (no harsh feedback)

**When Constellation Complete:**
- Entire constellation lights up brilliantly
- Beautiful glow/pulse animation
- Text reveals below or over constellation
- Satisfying sound effect
- That constellation becomes "locked" (can't edit anymore)

### Messages/Words Revealed
Each constellation reveals something meaningful:

**Examples:**
- "You Make My World Brighter"
- "Creative • Funny • Beautiful Soul"
- "Every Moment With You"
- "Our Adventure Together"

**Note:** These should be customizable/editable

### Hint System
- "?" button always visible in corner
- Click for hint: Next star in sequence glows/pulses
- Unlimited hints (no penalty)

### Completion
- All 3-4 constellations completed
- Final message appears: "You light up my sky ✨"
- Awards 5 puzzle pieces

---

## ACTIVITY 3: GARDEN OF WISHES

### Visual Design
- Soft watercolor-style garden scene
- Warm golden afternoon light
- Gentle breeze animation (grass/leaves swaying)
- Peaceful, serene atmosphere
- Ambient nature sounds (birds chirping, gentle wind)

### Instructions Modal
"Plant and nurture flowers to discover my wishes for us!"
- "Click a plot to plant a seed"
- "Water the plant to help it grow"
- "Watch it bloom to reveal a wish"

### Layout
```
┌─────────────────────────────────────┐
│         Garden Scene                │
│                                     │
│   [Plot1]  [Plot2]  [Plot3]        │
│   [Plot4]  [Plot5]  [Plot6]        │
│                                     │
│   (5-6 empty garden plots/pots)    │
│                                     │
└─────────────────────────────────────┘
```

### Gameplay Flow

**Planting:**
1. Click empty plot → seed appears in soil
2. Watering can icon/cursor appears

**Watering:**
- Click and hold on planted seed, OR
- Drag watering can over seed
- Water animation (droplets falling)
- Watering sound effect

**Growth Animation:**
- Time-lapse style growth (not too slow - 3-5 seconds total)
- Seed → Sprout → Stem grows → Bud forms → Flower blooms
- Smooth, satisfying animation

**When Fully Bloomed:**
- Flower opens beautifully
- Message appears above/below flower in elegant text
- Soft glow around the message
- That plot is now "complete"

### Flower Types
Different flower types for variety:
- Roses (red/pink)
- Sunflowers (yellow)
- Lotus (white/pink)
- Tulips (various colors)
- Daisies (white)
- Lavender (purple)

### Wish Messages
5-6 wishes total - mix of sweet, funny, and deep:

**Examples:**
- "I wish to make you laugh every day"
- "I wish to explore the world with you"
- "I wish to support your dreams always"
- "I wish to grow old beside you"
- "I wish to create beautiful memories together"
- "I wish to be your biggest cheerleader"

**Note:** These should be customizable/editable

### Additional Animations
- Butterflies or fireflies floating around
- Petals occasionally falling
- Gentle breeze effect

### Completion
- All 5-6 flowers grown and bloomed
- Garden is full of beautiful flowers with messages
- Final message: "Every wish includes you 🌸"
- Awards 5 puzzle pieces
- Can revisit garden to see all bloomed flowers

---

## ACTIVITY 4: MEMORY LANE MAZE

### Avatar Customization Screen

**Appears before maze:**
```
┌─────────────────────────────────────┐
│     "Customize Your Character"      │
│                                     │
│  Character Type:                    │
│  [Heart] [Firefly] [Bird] [Star]   │
│  [Butterfly] [Flower] [Simple Human]│
│                                     │
│  Color: [Color palette selector]    │
│                                     │
│  Trail Effect:                      │
│  [Sparkles] [Glow] [Petals] [Stars]│
│                                     │
│  Size: [Small] [Medium] [Large]     │
│                                     │
│         [Continue to Maze]          │
└─────────────────────────────────────┘
```

**Customization Options:**
- **Character Type:** Heart, Firefly, Bird (simple), Butterfly, Star, Flower, Simple human figure
- **Color:** Warm color palette (pinks, golds, oranges, purples) - matches aesthetic
- **Trail Effect:** Sparkles, Glowing line, Flower petals, Stars, Light particles
- **Size:** Small, Medium, Large (affects character sprite size)

**For Duet Mode:** Both players customize their characters

### Mode Selection
Two buttons:
1. **Solo Mode** - "Navigate the maze alone"
2. **Duet Mode** - "Explore together"

### Maze Design

**Visual Style:**
- Top-down view
- Illustrated garden maze
- Winding paths through willow trees, flowers, small bridges
- Warm, nostalgic color palette
- Soft lighting

**Path Elements:**
- Main pathways (clearly walkable)
- Decorative elements (trees, flowers, grass)
- Some dead ends (gently blocked, not punishing)
- Glowing memory markers along paths

### Solo Mode Controls
- **Movement:** Arrow keys OR WASD
- Character moves smoothly along paths
- Leaves trail effect behind them

### Duet Mode Controls
- **Player 1:** WASD keys
- **Player 2:** IJKL keys
- Both characters visible simultaneously
- Instructions clearly displayed: "Player 1: WASD | Player 2: IJKL"

**Duet Mode Special Mechanics:**
- Some memory markers require BOTH players to reach them
  - Shows as dual-colored glow
  - Both characters must be near it to activate
- Optional: Pressure plate puzzles (one player activates to open path for other)
- If players get too far apart: Subtle visual cue (arrow pointing toward partner)

### Memory Markers

**Appearance:**
- Glowing spots/orbs along the path
- Soft pulsing animation
- Different colors maybe (golden, pink, white)

**When Reached:**
- Character touches marker → it activates
- Beautiful activation animation (burst of light, particles)
- Photo pops up in elegant frame
- Short caption appears (date, location, or sweet note)
- Marker remains but changes appearance (completed state)

**Photo Requirements:**
- Use photos from `/assets/images/memories/` folder
- Should be 10-15 photos total for the maze
- Each photo should have an associated caption

**Caption Format (in code):**
```javascript
{
  image: "photo1.jpg",
  caption: "Our first date at the coffee shop ☕",
  requiresBothPlayers: false // or true for duet markers
}
```

### Path Guidance
- Maze shouldn't be frustratingly difficult
- Clear main path exists
- Dead ends are short (quick to backtrack)
- Optional: Mini-map in corner (shows explored areas)

### Animations Along Path
- Butterflies flying
- Falling flower petals
- Birds occasionally flying across
- Gentle sparkles

### Completion
- All memory markers collected
- Reach the maze center/exit
- Final marker reveals: "Every path led me to you 💕"
- Celebration animation (sparkles, hearts)
- Awards 5 puzzle pieces

### Celebratory Touches
- When both players reach a duet marker together: Both avatars do happy animation (jump, spin, hearts)
- Trail effects leave beautiful patterns as you explore

---

## ACTIVITY 5: RHYTHM OF US

### Song Selection Screen

**Layout:**
```
┌─────────────────────────────────────┐
│       "Choose Your Song"            │
│                                     │
│   [Song 1]                          │
│   "Song Title" - Artist             │
│   Memory: "Our first dance"         │
│   [Preview ▶]                       │
│                                     │
│   [Song 2]                          │
│   "Song Title" - Artist             │
│   Memory: "Road trip anthem"        │
│   [Preview ▶]                       │
│                                     │
│   [Song 3]                          │
│   "Song Title" - Artist             │
│   Memory: "Your favorite"           │
│   [Preview ▶]                       │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 2-3 songs to choose from
- Each song shows title, artist, and why it's meaningful
- Preview button plays 10-15 second snippet
- Click song card to select it

**Song File Requirements:**
- Audio files in `/assets/audio/songs/` folder
- Format: MP3 or OGG (browser compatible)
- Good quality audio

### Mode Selection
Two buttons after song selection:
1. **Solo Mode** - "Play along yourself"
2. **Duet Mode** - "Play together in harmony"

### Game Interface

**Layout:**
```
┌──────────────────────────────────────┐
│     ■■■■■■■■■■░░░░░░  (progress)     │
│                                      │
│         [Music Visualizer]           │
│     (gradient background pulses)     │
│                                      │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │    Notes falling ↓             │ │
│  │         ↓                      │ │
│  │         ↓                      │ │
│  │    ─────────────  Hit Zone     │ │
│  └────────────────────────────────┘ │
│                                      │
│   Score: 0000  Combo: x0            │
└──────────────────────────────────────┘
```

### Solo Mode Mechanics

**Note Falling:**
- Notes fall down a single vertical track/lane
- Notes are circles or musical note symbols
- Fall in rhythm with the music

**Timing Windows (very forgiving):**
- **Perfect:** ±100ms from exact beat (full points, satisfying effect)
- **Good:** ±200ms (most points, positive feedback)
- **Okay:** ±300ms (some points, neutral feedback)
- **Miss:** Outside window (no points, gentle fade)

**Controls:**
- Press **SPACEBAR** when note reaches hit zone
- Visual feedback on hit zone when key pressed

**Visual Feedback:**
- **Perfect hit:** Bright burst of color, sparkles explode, "Perfect!" text
- **Good hit:** Ripple effect, warm glow, "Good!" text  
- **Okay hit:** Subtle pulse, "Okay" text
- **Miss:** Note just fades away (no harsh feedback)

### Duet Mode Mechanics

**Two Lanes:**
```
┌──────────────────────────────────────┐
│   [Pink Lane]    │   [Gold Lane]     │
│    Player 1      │    Player 2       │
│                  │                   │
│      ●           │         ●         │
│      ●           │         ●         │
│      ↓           │         ↓         │
│  ─────────       │      ─────────    │
│   Hit Zone       │      Hit Zone     │
│                  │                   │
│    Press D       │      Press K      │
└──────────────────────────────────────┘
```

**Controls:**
- **Player 1:** Press **D key** for pink notes
- **Player 2:** Press **K key** for gold notes
- Clear label shows: "Player 1: D | Player 2: K"

**Special Combined Notes:**
- Some notes require BOTH players to hit simultaneously
- Shows as merged/combined note (pink + gold colors)
- Beautiful effect when both hit together (colors burst, hearts appear)
- Bonus points for synchronized hits

**Harmony Mechanics:**
- Playing together creates visual harmony (colors blend beautifully)
- Consecutive perfect synced hits create special effects

### Scoring System

**Points:**
- Perfect: 300 points
- Good: 200 points
- Okay: 100 points
- Miss: 0 points

**Combo System:**
- Consecutive hits (good or perfect) build combo
- Combo multiplier: x2, x3, x4, etc.
- Missing a note doesn't break combo harshly (just resets multiplier)
- Combo counter visible

**No Fail State:**
- Can complete song with any score
- Need ~60-70% accuracy to get "Great job!" message
- Lower scores still complete activity (just less enthusiastic message)

### Visual Effects

**Background Visualizer:**
- Gradient background (sunset colors)
- Pulses and shifts with music intensity
- Waveform or particle visualization
- Reacts to bass/treble

**Streak Effects:**
- 10+ combo: Small hearts float up
- 20+ combo: Screen edges glow
- 30+ combo: Intense particle effects

**Sound Effects:**
- Satisfying "tick" or "ding" on successful hit
- Different pitch for perfect vs good
- Gentle sound for misses (not punishing)

### Practice Mode (Optional)
- First 10-15 seconds of song can be practice
- "Practice Mode - Score doesn't count yet"
- Helps players get timing feel
- Real game starts after practice section

### Song End Screen

**Results Display:**
```
┌─────────────────────────────────────┐
│        "Amazing!"                   │
│                                     │
│      Final Score: 24,500            │
│      Accuracy: 87%                  │
│      Perfect Hits: 45               │
│      Max Combo: x23                 │
│                                     │
│   "You two are in perfect harmony!" │
│                                     │
│  Why this song matters:             │
│  "This was playing on our first     │
│   road trip together 🚗"            │
│                                     │
│   [Play Again] [Choose New Song]    │
└─────────────────────────────────────┘
```

**Encouragement Messages (based on accuracy):**
- 90%+: "Perfect harmony! 🎵"
- 70-89%: "You two are in sync! 💕"
- 50-69%: "Beautiful effort together! ✨"
- <50%: "Music sounds better with you! 🎶"

### Completion
- Finish any song (any score)
- Awards 5 puzzle pieces
- Can replay or try different songs
- Scores saved for each song (can try to beat high score)

---

## PUZZLE SYSTEM

### Overview
- 25-piece jigsaw puzzle (5x5 grid)
- Reveals photo of couple making heart shape at bell tower
- Manual piece placement (drag and drop)
- Each completed activity awards 5 pieces

### Puzzle Page

**Access:**
- "View Puzzle Progress" button on main menu
- Accessible anytime
- Shows current state of puzzle

**Layout:**
```
┌──────────────────────────────────────┐
│       Puzzle Progress: 15/25         │
│                                      │
│   ┌──────────────────────┐          │
│   │                      │          │
│   │   Puzzle Frame       │          │
│   │   (5x5 grid)         │          │
│   │   Some pieces placed │          │
│   │   Some slots empty   │          │
│   │                      │          │
│   └──────────────────────┘          │
│                                      │
│  ┌───────────────────────────────┐  │
│  │  Available Pieces:            │  │
│  │  [piece] [piece] [piece]      │  │
│  │  [piece] [piece]              │  │
│  └───────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Piece Management

**Earning Pieces:**
- Complete activity → "You've earned 5 puzzle pieces!" message
- Pieces automatically added to collection
- Celebratory animation when pieces are earned

**Piece Collection Display:**
- Shows all collected pieces at bottom/side
- Pieces are draggable
- Maybe shows thumbnail preview of each piece

### Placement Mechanics

**Drag and Drop:**
- Click and hold piece from collection
- Drag to puzzle frame
- Pieces can be placed in any empty slot initially

**Correct Placement:**
- When piece is in correct position → snaps into place
- Satisfying "click" sound
- Piece locks (can't be moved again)
- Glow effect briefly

**Incorrect Placement:**
- Two options:
  - **Option A:** Piece bounces back to collection (won't stay in wrong spot)
  - **Option B:** Piece can stay anywhere, but only "locks" when correct

**Recommendation:** Option A (bounces back) - cleaner UX

### Visual Feedback

**Empty Slots:**
- Subtle glow or pulse animation
- Draws eye to where pieces can go

**Completed Sections:**
- As more pieces placed, image becomes clearer
- Maybe slight glow around completed sections

**Progress Bar:**
- Visual progress indicator: "15/25 pieces placed"
- Or percentage: "60% complete"

### Puzzle Image
- Photo of couple making heart at bell tower (uploaded image)
- Image divided into 25 equal pieces
- Pieces should fit together seamlessly

---

## FINAL REVEAL SEQUENCE

### Trigger
When 25th puzzle piece is placed correctly

### Sequence

**Step 1: Final Piece Locks (0-2 seconds)**
- Piece clicks into place
- Satisfying lock sound (deeper, more resonant than regular pieces)
- Brief pause (anticipation moment)

**Step 2: Puzzle Illumination (2-4 seconds)**
- Entire puzzle glows with golden/warm light
- Light pulses from center outward
- Shimmer effect around edges
- Maybe subtle particle effects (sparkles floating up)

**Step 3: Image Full Reveal (4-6 seconds)**
- Puzzle pieces "dissolve" or fade away smoothly
- Full, clear photo is revealed
- Photo slightly enlarges or comes forward
- Beautiful framing effect appears around it

**Step 4: "I Love You" Appears (6-8 seconds)**
- Text fades in below/over photo
- "I love you" in beautiful, elegant script font
- Warm glow around text
- Maybe heart symbol or subtle animation with text

**Step 5: Instruction (8-10 seconds)**
- Below text, smaller instruction appears:
- "Click anywhere to continue" or "Click to reveal more"
- Gentle pulsing of instruction text

### Click-Triggered Romantic Animations

**When user clicks anywhere on screen:**

**Animation Sequence (builds with each click):**

**Click 1:**
- Hearts begin floating up from bottom of screen
- Various sizes, soft colors (pink, red, white)
- Gentle upward drift, slight sway
- Fade out as they reach top

**Click 2:**
- Flower petals begin falling from top
- Soft pink/white petals
- Gentle falling motion with rotation
- Some drift left/right

**Click 3:**
- Sparkles/particles appear
- Golden sparkles around the edges
- Gentle twinkling effect
- Build in intensity

**Click 4:**
- Background begins to transform
- Shifts to romantic sunset/starry sky
- Warm colors intensify
- Willow trees animate in background (swaying)

**Click 5:**
- Music swells (if background music playing)
- More intense particle effects
- Screen edges glow softly
- Fireflies/stars appear and twinkle

**Click 6:**
- Effects combine and intensify
- Multiple hearts, petals, sparkles simultaneously
- Beautiful, magical atmosphere created

**After 6-8 clicks (or time-based - after 10-15 seconds):**

### Message Reveal Sequence

**Messages appear one by one:**

**Message 1:**
- "I love you" (already visible)

**Message 2:**
- Fades in: "You make my world brighter"
- Gentle animation (slight fade up, glow)

**Message 3:**
- Fades in: "Every moment with you is a gift"
- Beautiful transition

**Final Message:**
- Large, centered text appears:
- "Will you be my Valentine?"
- Most prominent, elegant font
- Warm glow around text

### The Question Interface

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│   Will you be my Valentine?         │
│          (large, beautiful text)    │
│                                     │
│   ┌─────────┐     ┌─────────┐      │
│   │ Yes! 💕 │     │   No    │      │
│   └─────────┘     └─────────┘      │
│                                     │
└─────────────────────────────────────┘
```

### "Yes" Button Behavior
- Stays perfectly still and centered
- Gentle pulsing glow (warm, inviting)
- Maybe grows slightly bigger over time
- Clearly the "right" choice visually

### "No" Button Behavior (THE FUN PART)

**On Hover (cursor approaches):**
- Button sprouts little cartoon legs
- Runs away from cursor to random position
- Quick animation (scurrying motion)
- Leaves small dust cloud or motion lines

**On Each Hover Attempt:**
- Moves to new random position
- Gets progressively faster/more frantic
- Maybe different running animations (variety)
- Sound effects: Little footstep sounds, cartoon "boing"

**Additional Humor:**
- Every few attempts, button might:
  - Jump to opposite corner
  - Do a little spin before running
  - Hide behind "Yes" button briefly
  - Shake nervously before running

**Easter Egg (if somehow clicked):**
- Multiple outcomes possible:
  1. Button splits into two "No" buttons that both run away
  2. Transforms instantly into "Yes" button
  3. Says "Nice try! 😊" and disappears, leaving only "Yes"
  4. Says "That's not an option!" and teleports away

### When "Yes" is Clicked

**MASSIVE CELEBRATION:**

**Immediate Response (0-1 second):**
- Button press animation (satisfying click)
- Bright flash of light from button

**Explosion of Joy (1-3 seconds):**
- HUGE confetti explosion from all sides
- Hearts burst outward from center
- Sparkles/particles everywhere
- Bright, celebratory colors

**Confetti Details:**
- Various colors (pink, red, gold, white)
- Different shapes (hearts, circles, stars)
- Falls with physics (tumbling, drifting)
- Fills entire screen

**Additional Effects:**
- Fireworks burst in background
- Screen flashes with warm colors
- Triumphant sound effect (celebratory chime)

**Photo Reappears (3-5 seconds):**
- The bell tower photo comes back into focus
- Now surrounded by celebration effects
- Maybe enlarged or with special frame

**Message Appears (5-7 seconds):**
- Text fades in: "I can't wait to celebrate with you! ❤️"
- Or: "You've made me the happiest! 💕"
- Or: "Happy Valentine's Day, Prashika! 💝"
- Beautiful, heartfelt message

**Confetti Continues:**
- Effects continue for 10-15 seconds
- Gradually slow down
- Don't disappear instantly

### End Screen

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│      [Photo of You Both]            │
│                                     │
│   Happy Valentine's Day, Prashika   │
│              💕                     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Replay Activities:          │  │
│  │  • Turn-based Drawing        │  │
│  │  • Constellation Connect     │  │
│  │  • Garden of Wishes          │  │
│  │  • Memory Lane Maze          │  │
│  │  • Rhythm of Us              │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  [Download Puzzle Image]     │  │
│  │  [View All Memories]         │  │
│  │  [Start Over]                │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Options:**

1. **Replay Activities:**
   - List of all 5 activities
   - Click any to replay
   - Scores/pieces already earned remain

2. **Download Puzzle Image:**
   - Downloads the completed puzzle photo
   - High quality version

3. **View All Memories:**
   - Gallery of all photos from Memory Lane Maze
   - With captions
   - Can browse through them

4. **View All Messages:**
   - Shows all constellation messages
   - All garden wishes
   - Can revisit the sweet words

5. **Start Over:**
   - Resets all progress
   - Can experience everything fresh
   - Confirmation dialog: "Are you sure?"

**Website Remains Accessible:**
- Everything stays interactive
- Can revisit any activity anytime
- Perfect for looking back on later

---

## TECHNICAL IMPLEMENTATION NOTES

### State Management
- Track completion status of each activity (boolean)
- Track puzzle pieces collected (number, 0-25)
- Track which pieces have been placed (array/object)
- Track scores/progress for each activity

### Data Structures

**Activities:**
```javascript
const activities = [
  {
    id: 1,
    name: "Turn-based Drawing Relay",
    completed: false,
    piecesAwarded: 5
  },
  // ... etc
]
```

**Puzzle Pieces:**
```javascript
const puzzlePieces = {
  collected: 15,
  placed: [1, 2, 3, 5, 7, ...], // piece IDs
  total: 25
}
```

**Memory Markers (for maze):**
```javascript
const memories = [
  {
    id: 1,
    image: "photo1.jpg",
    caption: "Our first date ☕",
    position: {x: 100, y: 200},
    requiresBothPlayers: false
  },
  // ... etc
]
```

**Songs:**
```javascript
const songs = [
  {
    id: 1,
    title: "Song Name",
    artist: "Artist Name",
    file: "song1.mp3",
    memory: "This was our road trip song",
    notes: [
      {time: 1.5, lane: 1}, // timestamp in seconds, lane for duet mode
      {time: 2.0, lane: 2},
      // ... note chart
    ]
  },
  // ... etc
]
```

### Canvas/Drawing Implementation
- HTML5 Canvas for drawing activities
- Track brush strokes as paths (for undo functionality)
- For multiplayer: WebSocket or Socket.io for real-time sync
- Store drawing data structure that can be transmitted

### Real-Time Multiplayer (Drawing Relay)
- Use WebSocket connection (Socket.io recommended)
- Room system with PIN codes
- Sync drawing state between clients
- Handle turn switching server-side (authoritative timer)

### Audio Implementation
- Web Audio API for music playback
- Audio analysis for visualizer
- Precise timing for rhythm game (use audio context time)
- Preload audio files for smooth experience

### Animation Framework
- CSS transitions for simple animations
- JavaScript (requestAnimationFrame) for complex animations
- Consider anime.js or GSAP for advanced effects
- Particle systems for confetti/sparkles

### Responsive Considerations
- Primarily desktop experience
- Minimum resolution: 1280x720
- Scale UI elements proportionally
- Touch support nice-to-have (for drawing)

### Performance
- Optimize particle counts (don't overload with too many)
- Use CSS transforms for better animation performance
- Lazy load images/audio as needed
- Efficient canvas rendering (don't redraw entire canvas unnecessarily)

### Browser Compatibility
- Test in Chrome, Firefox, Safari, Edge
- Use polyfills if needed for older browsers
- Fallbacks for unsupported features

---

## ASSETS CHECKLIST

### Required Assets

**Images:**
- [ ] 10-15 photos for Memory Lane Maze (in `/assets/images/memories/`)
- [ ] 1 bell tower photo for puzzle reveal (in `/assets/images/puzzle/`)
- [ ] 20-30 drawable reference images organized by difficulty (in `/assets/images/drawable/`)

**Audio:**
- [ ] 2-3 meaningful songs (in `/assets/audio/songs/`)
- [ ] Optional: Background ambient music for activities
- [ ] Sound effects (button clicks, success sounds, etc.)

**Fonts:**
- [ ] Beautiful script/serif font for "Prashika"
- [ ] Clean readable font for UI elements
- [ ] Elegant font for romantic messages

**Icons/UI Elements:**
- [ ] Watering can graphic (for garden)
- [ ] Heart shapes (various sizes)
- [ ] Star shapes (for constellations)
- [ ] Musical note icons

---

## CONTENT TO CUSTOMIZE

The following content should be personalized with specific details:

### Constellation Messages (4 messages)
1. _______________
2. _______________
3. _______________
4. _______________

### Garden Wishes (5-6 wishes)
1. _______________
2. _______________
3. _______________
4. _______________
5. _______________
6. _______________

### Memory Captions (10-15 captions for maze photos)
Format: "Caption text ❤️"
1. _______________
2. _______________
... etc

### Song Memories (2-3 why each song is meaningful)
Song 1: _______________
Song 2: _______________
Song 3: _______________

### Final Messages
- Message after "I love you": _______________
- Message after "Yes" clicked: _______________

---

## DEVELOPMENT PHASES

### Phase 1: Foundation
- Set up project structure
- Create landing page with interactive background
- Build menu system
- Implement basic navigation between activities

### Phase 2: Activity Development
- Build each activity one by one
- Test thoroughly
- Ensure smooth UX for each

### Phase 3: Puzzle System
- Implement puzzle piece collection
- Build puzzle assembly interface
- Test piece placement mechanics

### Phase 4: Final Reveal
- Create reveal sequence
- Implement romantic animations
- Build "Yes/No" button interaction
- Create end screen

### Phase 5: Polish
- Refine all animations
- Add sound effects
- Optimize performance
- Cross-browser testing
- Final content insertion

---

## TESTING CHECKLIST

- [ ] All activities completable
- [ ] Puzzle pieces awarded correctly
- [ ] Puzzle pieces placeable
- [ ] All 25 pieces place correctly
- [ ] Final reveal triggers properly
- [ ] "No" button runs away on hover
- [ ] "Yes" button works and triggers celebration
- [ ] All photos load correctly
- [ ] All songs play correctly
- [ ] Multiplayer drawing relay works with two devices
- [ ] All animations smooth and performant
- [ ] No console errors
- [ ] Works in multiple browsers
- [ ] Responsive at different resolutions
- [ ] Audio plays correctly
- [ ] All interactive elements have clear feedback

---

## NICE-TO-HAVE FEATURES (Optional)

- Save progress to localStorage (resume if page refreshed)
- Leaderboard for rhythm game scores
- Ability to share/export completed activities
- Photo filters in memory gallery
- Replay animation of puzzle being assembled
- Time-lapse of entire experience
- Hidden Easter eggs throughout site
- Music volume controls
- Accessibility features (keyboard navigation, screen reader support)

---

## FINAL NOTES

This website is a labor of love - prioritize smooth UX, beautiful aesthetics, and emotional impact over technical complexity. Every interaction should feel magical and intentional. The goal is to create a memorable, romantic experience that Prashika will treasure.

Good luck building! 💕
