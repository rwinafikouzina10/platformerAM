/**
 * GameScene - Main gameplay scene
 * 2D Platformer with Arabic letter learning mechanics
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Game state
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.isPaused = false;

        // Level system
        this.currentLevel = window.GameData.currentLevel || 1;
        this.levelLetters = this.getLettersForLevel(this.currentLevel);
        this.completedLettersInLevel = [];

        // Current target letter
        this.currentTarget = null;
        this.targetLetter = null;

        // Level dimensions (will be set during generation)
        this.levelWidth = 3000;
        this.levelHeight = 720;

        // Platform generation settings
        this.tileSize = 32;
        this.groundY = this.levelHeight - 64;

        // Player physics settings (balanced for platformer)
        this.playerSpeed = 320;
        this.jumpForce = -620;
        this.gravity = 900;

        // Player state
        this.canJump = true;
        this.isOnGround = true;

        // Sound debounce
        this.lastSoundTime = 0;
        this.soundCooldown = 1500; // ms between sounds
    }

    create() {
        // Set world bounds for the level
        this.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight);

        // Create game layers in order
        this.createBackground();
        this.createLevel();
        this.createPlayer();
        this.createUI();
        this.createControls();

        // Setup camera to follow player
        this.setupCamera();

        // Start the game
        this.startGame();

        // Camera fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    createBackground() {
        // Sky color and tints based on level theme
        // Level 1: Summer (bright blue sky), Level 2: Autumn (warm orange), Level 3: Winter (cool blue/gray)
        const levelThemes = {
            1: { sky: 0x87CEEB, tint: null },           // Summer: bright blue
            2: { sky: 0xE8B87C, tint: 0xFFD4A0 },       // Autumn: warm orange/brown
            3: { sky: 0xB8D4E8, tint: 0xC4E8FF }        // Winter: cool blue/white
        };

        const theme = levelThemes[this.currentLevel] || levelThemes[1];

        // Create sky that fills the level
        this.add.rectangle(this.levelWidth / 2, this.levelHeight / 2, this.levelWidth, this.levelHeight, theme.sky);

        // Parallax background layers (will scroll with camera)
        this.parallaxLayers = [];

        // Mountains (furthest back)
        for (let x = 0; x < this.levelWidth + 1280; x += 1280) {
            const mountains = this.add.image(x, this.levelHeight / 2, 'parallax_mountains');
            mountains.setScrollFactor(0.2);
            this.parallaxLayers.push(mountains);
        }

        // Far terrain
        for (let x = 0; x < this.levelWidth + 1280; x += 1280) {
            const far = this.add.image(x, this.levelHeight / 2, 'parallax_far');
            far.setScrollFactor(0.4);
            this.parallaxLayers.push(far);
        }

        // Mid terrain
        for (let x = 0; x < this.levelWidth + 1280; x += 1280) {
            const mid = this.add.image(x, this.levelHeight / 2, 'parallax_mid');
            mid.setScrollFactor(0.6);
            this.parallaxLayers.push(mid);
        }

        // Apply tint based on level theme
        if (theme.tint) {
            this.parallaxLayers.forEach(layer => layer.setTint(theme.tint));
        }
    }

    createLevel() {
        // Create physics groups
        this.platforms = this.physics.add.staticGroup();
        this.letterBoxes = this.physics.add.group({ allowGravity: false });
        this.decorations = this.add.group();

        // Generate the level procedurally
        this.generateLevel();
    }

    generateLevel() {
        // Choose tileset based on level - each has unique visual theme
        // Level 1: Summer (green grass), Level 2: Autumn (orange/brown), Level 3: Winter (snow/ice)
        const tilesetConfig = {
            1: {
                tileset: 'tileset_summer',
                // Summer: grass top row, dirt fill
                primary: { topLeft: 0, topMid: 1, topRight: 2, midLeft: 7, midMid: 8, midRight: 9 },
                secondary: { topLeft: 14, topMid: 15, topRight: 16, midLeft: 21, midMid: 22, midRight: 23 },
                accent: { topLeft: 28, topMid: 29, topRight: 30, midLeft: 35, midMid: 36, midRight: 37 }
            },
            2: {
                tileset: 'tileset_autumn',
                // Autumn: orange/brown theme with varied textures
                primary: { topLeft: 0, topMid: 1, topRight: 2, midLeft: 5, midMid: 6, midRight: 7 },
                secondary: { topLeft: 10, topMid: 11, topRight: 12, midLeft: 15, midMid: 16, midRight: 17 },
                accent: { topLeft: 20, topMid: 21, topRight: 22, midLeft: 25, midMid: 26, midRight: 27 }
            },
            3: {
                tileset: 'tileset_winter',
                // Winter: snow/ice platforms with cyan accents
                primary: { topLeft: 7, topMid: 8, topRight: 9, midLeft: 14, midMid: 15, midRight: 16 },
                secondary: { topLeft: 28, topMid: 29, topRight: 30, midLeft: 35, midMid: 36, midRight: 37 },
                accent: { topLeft: 42, topMid: 43, topRight: 44, midLeft: 49, midMid: 50, midRight: 51 }
            }
        };

        // Get config for current level (default to level 1 if not found)
        const config = tilesetConfig[this.currentLevel] || tilesetConfig[1];
        this.currentTileset = config.tileset;
        this.tileStyles = {
            grass: config.primary,
            orange: config.secondary,
            stone: config.accent
        };

        // Create ground along the entire level
        this.createGround();

        // Generate platforms with guaranteed reachability
        this.generatePlatforms();

        // Place letters ONLY on platforms (never blocking ground)
        this.placeLetters();

        // Add decorations
        this.addDecorations();
    }

    createGround() {
        // Create ground using level-specific tileset tiles (32x32)
        const tileSize = 32;
        const style = this.tileStyles.grass;

        for (let x = 0; x < this.levelWidth; x += tileSize) {
            // Top layer (grass/snow/etc)
            const topTile = this.platforms.create(x, this.groundY, this.currentTileset, style.topMid);
            topTile.setOrigin(0, 0);
            topTile.refreshBody();

            // Fill layer 1
            const fillTile = this.platforms.create(x, this.groundY + tileSize, this.currentTileset, style.midMid);
            fillTile.setOrigin(0, 0);
            fillTile.refreshBody();

            // Fill layer 2
            const fill2Tile = this.platforms.create(x, this.groundY + tileSize * 2, this.currentTileset, style.midMid);
            fill2Tile.setOrigin(0, 0);
            fill2Tile.refreshBody();
        }
    }

    generatePlatforms() {
        // Jump physics analysis:
        // jumpForce: -620, gravity: 900, speed: 320
        // Max jump height: ~213 pixels (practical: ~180)
        // Max horizontal jump: ~400 pixels (practical: ~300)

        const tileSize = 32;

        // Store platforms for letter placement
        this.platformPositions = [];

        // Level sections - each section has a specific pattern
        const sectionWidth = 600;
        const numSections = Math.floor(this.levelWidth / sectionWidth);

        for (let section = 0; section < numSections; section++) {
            const sectionStart = 300 + section * sectionWidth;
            const pattern = section % 5; // Rotate through 5 patterns

            switch(pattern) {
                case 0:
                    this.createStaircaseSection(sectionStart, tileSize);
                    break;
                case 1:
                    this.createFloatingIslandsSection(sectionStart, tileSize);
                    break;
                case 2:
                    this.createZigzagSection(sectionStart, tileSize);
                    break;
                case 3:
                    this.createBridgeSection(sectionStart, tileSize);
                    break;
                case 4:
                    this.createPyramidSection(sectionStart, tileSize);
                    break;
            }
        }
    }

    createStaircaseSection(startX, tileSize) {
        // Ascending staircase - easy to climb
        const steps = 4;
        const stepHeight = 50; // Each step rises 50px
        const stepWidth = 100; // Each step is 100px wide

        for (let i = 0; i < steps; i++) {
            const x = startX + i * stepWidth;
            const y = this.groundY - 80 - (i * stepHeight);
            const width = 3 + Math.floor(Math.random() * 2);

            this.createTilesetPlatform(x, y, width, 1, 'grass');

            this.platformPositions.push({
                x: x + (width * tileSize) / 2,
                y: y,
                width: width * tileSize,
                hasLetter: false
            });
        }
    }

    createFloatingIslandsSection(startX, tileSize) {
        // Floating islands at varying heights - all reachable from ground or each other
        const islands = [
            { x: 0, y: -120, w: 4 },
            { x: 150, y: -180, w: 3 },
            { x: 280, y: -140, w: 5 },
            { x: 430, y: -200, w: 3 }
        ];

        islands.forEach((island, i) => {
            const x = startX + island.x;
            const y = this.groundY + island.y;

            // Vary platform style
            const style = i % 2 === 0 ? 'grass' : 'orange';
            this.createTilesetPlatform(x, y, island.w, 1, style);

            this.platformPositions.push({
                x: x + (island.w * tileSize) / 2,
                y: y,
                width: island.w * tileSize,
                hasLetter: false
            });
        });
    }

    createZigzagSection(startX, tileSize) {
        // Zigzag pattern - alternating heights
        const platforms = [
            { x: 0, y: -100 },
            { x: 130, y: -170 },
            { x: 260, y: -100 },
            { x: 390, y: -170 },
            { x: 520, y: -130 }
        ];

        platforms.forEach((plat, i) => {
            const x = startX + plat.x;
            const y = this.groundY + plat.y;
            const width = 3;

            this.createTilesetPlatform(x, y, width, 1, 'stone');

            this.platformPositions.push({
                x: x + (width * tileSize) / 2,
                y: y,
                width: width * tileSize,
                hasLetter: false
            });
        });
    }

    createBridgeSection(startX, tileSize) {
        // Long bridge with gaps - player runs across
        const bridgeY = this.groundY - 150;

        // First platform
        this.createTilesetPlatform(startX, bridgeY, 5, 1, 'orange');
        this.platformPositions.push({
            x: startX + 80,
            y: bridgeY,
            width: 5 * tileSize,
            hasLetter: false
        });

        // Gap (jumpable)

        // Middle platform
        this.createTilesetPlatform(startX + 220, bridgeY, 6, 1, 'orange');
        this.platformPositions.push({
            x: startX + 220 + 96,
            y: bridgeY,
            width: 6 * tileSize,
            hasLetter: false
        });

        // Gap

        // End platform
        this.createTilesetPlatform(startX + 440, bridgeY, 4, 1, 'orange');
        this.platformPositions.push({
            x: startX + 440 + 64,
            y: bridgeY,
            width: 4 * tileSize,
            hasLetter: false
        });
    }

    createPyramidSection(startX, tileSize) {
        // Pyramid shape - wide base, narrow top
        const layers = [
            { x: 0, y: -80, w: 8 },
            { x: 48, y: -140, w: 5 },
            { x: 80, y: -200, w: 3 }
        ];

        layers.forEach((layer, i) => {
            const x = startX + layer.x;
            const y = this.groundY + layer.y;

            this.createTilesetPlatform(x, y, layer.w, 1, 'grass');

            // Only add letter positions on upper layers
            if (i > 0) {
                this.platformPositions.push({
                    x: x + (layer.w * tileSize) / 2,
                    y: y,
                    width: layer.w * tileSize,
                    hasLetter: false
                });
            }
        });
    }

    createTilesetPlatform(x, y, widthInTiles, heightInTiles, style = 'grass') {
        const tileSize = 32;

        // Get tile indices from level-specific tileStyles
        const tileStyle = this.tileStyles[style] || this.tileStyles.grass;
        const { topLeft, topMid, topRight, midLeft, midMid, midRight } = tileStyle;

        // Create top row
        for (let i = 0; i < widthInTiles; i++) {
            let tileFrame;
            if (widthInTiles === 1) {
                tileFrame = topMid;
            } else if (i === 0) {
                tileFrame = topLeft;
            } else if (i === widthInTiles - 1) {
                tileFrame = topRight;
            } else {
                tileFrame = topMid;
            }

            const tile = this.platforms.create(x + (i * tileSize), y, this.currentTileset, tileFrame);
            tile.setOrigin(0, 0);
            tile.refreshBody();
        }

        // Create bottom rows for thicker platforms
        for (let row = 1; row < heightInTiles; row++) {
            for (let i = 0; i < widthInTiles; i++) {
                let tileFrame;
                if (widthInTiles === 1) {
                    tileFrame = midMid;
                } else if (i === 0) {
                    tileFrame = midLeft;
                } else if (i === widthInTiles - 1) {
                    tileFrame = midRight;
                } else {
                    tileFrame = midMid;
                }

                const tile = this.platforms.create(x + (i * tileSize), y + (row * tileSize), this.currentTileset, tileFrame);
                tile.setOrigin(0, 0);
                tile.refreshBody();
            }
        }
    }

    placeLetters() {
        // IMPORTANT: Letters are ONLY placed on platforms, NEVER on ground
        // This ensures the player always has a clear path on the ground

        // Filter platforms that are suitable for letters
        const validPlatforms = this.platformPositions.filter(p => p.y < this.groundY - 60);

        // Shuffle and select platforms for letters
        Phaser.Utils.Array.Shuffle(validPlatforms);

        // Place letters on a subset of platforms (not all)
        const numLetters = Math.min(validPlatforms.length, 10);

        for (let i = 0; i < numLetters; i++) {
            const platform = validPlatforms[i];
            if (!platform || platform.hasLetter) continue;

            // Place letter box ABOVE the platform (player jumps to get it)
            const letterY = platform.y - 55;

            this.createLetterBox(platform.x, letterY, null, false, true);
            platform.hasLetter = true;
        }
    }

    addDecorations() {
        // Decorations disabled - the tileset frames were showing as confusing blocks
        // Future: Add proper decoration sprites (flowers, grass tufts, etc.)
    }

    createLetterBox(x, y, letter, isCorrect, isPlaceholder = false) {
        // Create container for letter box
        const boxWidth = 80;
        const boxHeight = 80;

        // Background box
        const bg = this.add.image(x, y, 'gui_box_orange');
        bg.setDisplaySize(boxWidth, boxHeight);
        bg.setDepth(10);

        // Letter text (empty if placeholder)
        const displayLetter = isPlaceholder ? '?' : letter;
        const letterText = this.add.text(x, y, displayLetter, {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '44px',
            color: '#2c1810',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        // Physics body for collision
        const hitbox = this.letterBoxes.create(x, y, null);
        hitbox.setVisible(false);
        hitbox.body.setSize(boxWidth, boxHeight);
        hitbox.body.setAllowGravity(false);
        hitbox.body.setImmovable(true);

        // Store references
        hitbox.letterBg = bg;
        hitbox.letterText = letterText;
        hitbox.letter = letter;
        hitbox.isCorrect = isCorrect;
        hitbox.isPlaceholder = isPlaceholder;
        hitbox.collected = false;

        // Bobbing animation
        this.tweens.add({
            targets: [bg, letterText],
            y: y - 8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return hitbox;
    }

    updateLetterBoxes() {
        // Update all letter boxes with current target
        if (!this.currentTarget) return;

        const letters = window.GameData.letters;
        const letterBoxes = this.letterBoxes.getChildren().filter(box => !box.collected);

        // Shuffle to randomize which box gets the correct letter
        Phaser.Utils.Array.Shuffle(letterBoxes);

        // Assign one correct letter, rest are wrong
        let correctAssigned = false;

        letterBoxes.forEach(box => {
            if (box.collected) return;

            let letter, isCorrect;

            if (!correctAssigned) {
                // Assign correct letter
                const targetForms = this.currentTarget.forms || [this.currentTarget.char];
                letter = this.currentLevel === 1 ? targetForms[0] :
                    targetForms[Phaser.Math.Between(0, targetForms.length - 1)];
                isCorrect = true;
                correctAssigned = true;
            } else {
                // Assign wrong letter
                let wrongLetterData;
                do {
                    wrongLetterData = letters[Phaser.Math.Between(0, letters.length - 1)];
                } while (wrongLetterData.char === this.currentTarget.char);

                const wrongForms = wrongLetterData.forms || [wrongLetterData.char];
                letter = this.currentLevel === 1 ? wrongForms[0] :
                    wrongForms[Phaser.Math.Between(0, wrongForms.length - 1)];
                isCorrect = false;
            }

            // Update the box
            box.letter = letter;
            box.isCorrect = isCorrect;
            box.isPlaceholder = false;
            box.letterText.setText(letter);
        });
    }

    createPlayer() {
        // Create player at start position
        const startX = 150;
        const startY = this.groundY - 100;

        this.player = this.physics.add.sprite(startX, startY, 'player_idle');
        this.player.setScale(1.4);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);

        // Set custom gravity for player
        this.player.body.setGravityY(this.gravity - 800); // Add to world gravity

        // Adjust hitbox
        this.player.body.setSize(40, 55);
        this.player.body.setOffset(12, 9);

        // Start with idle animation
        this.player.play('player_idle_anim');

        // Collisions
        this.physics.add.collider(this.player, this.platforms, this.onPlatformLand, null, this);
        this.physics.add.overlap(this.player, this.letterBoxes, this.onCollectLetter, null, this);
    }

    setupCamera() {
        // Set camera bounds to level size
        this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);

        // Follow player with some deadzone for smoother scrolling
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(200, 100);

        // Keep some look-ahead in the direction player is moving
        this.cameras.main.setFollowOffset(-100, 0);
    }

    createUI() {
        // Create UI container that stays fixed on screen
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setScrollFactor(0);
        this.uiContainer.setDepth(100);

        // Menu button - top left
        const menuBtn = this.add.image(35, 35, 'gui_btn_menu');
        menuBtn.setDisplaySize(45, 45);
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => this.returnToMenu());
        menuBtn.on('pointerover', () => menuBtn.setTint(0xcccccc));
        menuBtn.on('pointerout', () => menuBtn.clearTint());
        this.uiContainer.add(menuBtn);

        // Score
        const scorePanel = this.add.image(160, 35, 'score_panel');
        this.uiContainer.add(scorePanel);

        const scoreIcon = this.add.sprite(85, 35, 'apple').setScale(1);
        scoreIcon.play('apple_anim');
        this.uiContainer.add(scoreIcon);

        this.scoreText = this.add.text(115, 35, '0', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.uiContainer.add(this.scoreText);

        // Lives (hearts)
        this.hearts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(1200 - (i * 40), 35, 'gui_heart_full');
            heart.setDisplaySize(32, 27);
            this.hearts.push(heart);
            this.uiContainer.add(heart);
        }

        // Progress indicator
        this.progressText = this.add.text(640, 35, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.uiContainer.add(this.progressText);

        // Target letter display (shows what to find)
        this.targetDisplay = this.add.text(640, 80, '', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '36px',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        this.uiContainer.add(this.targetDisplay);

        // Listen again button
        this.listenAgainBtn = this.add.text(640, 130, '🔊 Luister', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#98D8E8',
            backgroundColor: '#00000066',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.listenAgainBtn.on('pointerdown', () => {
            if (window.AudioSynth && this.currentTarget) {
                window.AudioSynth.speakLetter(this.currentTarget.sound, this);
            }
        });
        this.uiContainer.add(this.listenAgainBtn);

        // Feedback text
        this.feedbackText = this.add.text(640, 300, '', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.uiContainer.add(this.feedbackText);
    }

    createControls() {
        // Virtual Joystick (left side)
        this.joystick = this.plugins.get('rexVirtualJoystick').add(this, {
            x: 120,
            y: 580,
            radius: 60,
            base: this.add.image(0, 0, 'joystick_base').setAlpha(0.6).setScrollFactor(0).setDepth(100),
            thumb: this.add.image(0, 0, 'joystick_thumb').setAlpha(0.8).setScrollFactor(0).setDepth(100),
            dir: 'left&right',
            enable: true
        });

        // Jump button (right side)
        this.jumpButton = this.add.image(1160, 580, 'jump_button')
            .setInteractive()
            .setAlpha(0.7)
            .setScale(1.2)
            .setScrollFactor(0)
            .setDepth(100);

        this.jumpButton.on('pointerdown', () => {
            this.jump();
            this.jumpButton.setScale(1.0).setAlpha(0.9);
        });

        this.jumpButton.on('pointerup', () => {
            this.jumpButton.setScale(1.2).setAlpha(0.7);
        });

        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Touch jump on right side of screen
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x > 800 && pointer.y < 450) {
                this.jump();
            }
        });
    }

    startGame() {
        this.isGameOver = false;
        this.score = 0;
        this.lives = 3;
        this.updateScore(0);

        // Start background music
        this.startBackgroundMusic();

        // Select first target letter
        this.time.delayedCall(500, () => {
            this.selectNewTarget();
        });
    }

    startBackgroundMusic() {
        const musicTracks = ['music1', 'music2', 'music3'];
        const randomTrack = musicTracks[Phaser.Math.Between(0, musicTracks.length - 1)];

        if (this.cache.audio.exists(randomTrack)) {
            this.bgMusic = this.sound.add(randomTrack, {
                volume: 0.15,
                loop: true
            });
            this.bgMusic.play();
        }
    }

    stopBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgMusic = null;
        }
    }

    getLettersForLevel(level) {
        const letters = window.GameData.letters;

        if (level === 2) {
            // Level 2: All letter forms
            const allForms = [];
            const formNames = ['alleenstaand', 'begin', 'midden', 'eind'];

            letters.forEach(letter => {
                const uniqueForms = [...new Set(letter.forms)];
                uniqueForms.forEach((form) => {
                    allForms.push({
                        char: form,
                        name: `${letter.name} (${formNames[letter.forms.indexOf(form)]})`,
                        sound: letter.sound,
                        forms: [form],
                        baseChar: letter.char
                    });
                });
            });
            return allForms;
        }

        if (level === 3) {
            // Level 3: Letters with harakat
            const combinations = [];
            const harakat = window.GameData.harakat || [];

            letters.forEach(letter => {
                harakat.forEach(h => {
                    combinations.push({
                        char: letter.char + h.char,
                        name: `${letter.name} met ${h.name}`,
                        sound: `${letter.sound}_${h.sound === 'a' ? 'fatha' : h.sound === 'i' ? 'kasra' : 'damma'}`,
                        forms: [letter.char + h.char],
                        baseChar: letter.char
                    });
                });
            });
            return combinations;
        }

        return letters;
    }

    selectNewTarget() {
        if (this.isGameOver) return;

        // Check if level complete
        if (this.completedLettersInLevel.length >= this.levelLetters.length) {
            this.levelComplete();
            return;
        }

        // Get uncompleted letters
        const uncompletedLetters = this.levelLetters.filter(
            letter => !this.completedLettersInLevel.includes(letter.char)
        );

        if (uncompletedLetters.length === 0) {
            this.levelComplete();
            return;
        }

        // Pick random letter
        const randomIndex = Phaser.Math.Between(0, uncompletedLetters.length - 1);
        this.currentTarget = uncompletedLetters[randomIndex];
        this.targetLetter = this.currentTarget.char;

        // Update UI
        this.updateProgressDisplay();
        this.targetDisplay.setText(`Zoek: ${this.targetLetter}`);

        // Speak the letter
        if (window.AudioSynth) {
            window.AudioSynth.speakLetter(this.currentTarget.sound, this);
        }

        // Update letter boxes with new target
        this.updateLetterBoxes();

        this.showFeedback('Luister goed!', '#f4d03f', 1500);
    }

    updateProgressDisplay() {
        const remaining = this.levelLetters.length - this.completedLettersInLevel.length;
        this.progressText.setText(`Niveau ${this.currentLevel} | Nog ${remaining} te gaan`);
    }

    onPlatformLand(player, platform) {
        if (player.body.touching.down) {
            this.isOnGround = true;
            this.canJump = true;

            // Play run or idle animation based on movement
            if (Math.abs(player.body.velocity.x) > 10) {
                player.play('player_run_anim', true);
            } else {
                player.play('player_idle_anim', true);
            }
        }
    }

    onCollectLetter(player, letterObj) {
        if (!letterObj.active || letterObj.collected) return;

        // Check sound cooldown to prevent rapid repetition
        const now = this.time.now;
        if (now - this.lastSoundTime < this.soundCooldown) return;
        this.lastSoundTime = now;

        letterObj.collected = true;

        if (letterObj.isCorrect) {
            // Correct letter!
            if (window.AudioSynth) window.AudioSynth.playCorrect();

            this.updateScore(100);
            this.showFeedback('Goed zo! ممتاز', '#27ae60', 1000);
            this.createStarBurst(letterObj.x, letterObj.y);

            // Mark letter as completed
            if (!this.completedLettersInLevel.includes(this.currentTarget.char)) {
                this.completedLettersInLevel.push(this.currentTarget.char);
            }

            // Remove the box
            if (letterObj.letterBg) letterObj.letterBg.destroy();
            if (letterObj.letterText) letterObj.letterText.destroy();
            letterObj.destroy();

            // Select next target after delay
            this.time.delayedCall(1500, () => {
                this.selectNewTarget();
            });
        } else {
            // Wrong letter
            if (window.AudioSynth) window.AudioSynth.playWrong();

            this.showFeedback('Probeer opnieuw!', '#e74c3c', 1000);

            // Shake the box
            this.tweens.add({
                targets: [letterObj.letterBg, letterObj.letterText],
                x: letterObj.x + 10,
                duration: 50,
                yoyo: true,
                repeat: 3
            });

            // Speak correct letter again after delay
            this.time.delayedCall(1000, () => {
                if (window.AudioSynth && this.currentTarget) {
                    window.AudioSynth.speakLetter(this.currentTarget.sound, this);
                }
            });

            // Reset collected flag after cooldown so player can try again
            this.time.delayedCall(this.soundCooldown, () => {
                if (letterObj.active) {
                    letterObj.collected = false;
                }
            });
        }
    }

    jump() {
        if (this.isGameOver || !this.canJump) return;

        if (this.player.body.touching.down || this.isOnGround) {
            this.player.setVelocityY(this.jumpForce);
            this.player.play('player_jump_anim');
            this.canJump = false;
            this.isOnGround = false;

            if (window.AudioSynth) window.AudioSynth.playJump();
        }
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText(this.score.toString());

        if (points > 0) {
            this.tweens.add({
                targets: this.scoreText,
                scale: { from: 1.3, to: 1 },
                duration: 200
            });
        }
    }

    showFeedback(text, color, duration) {
        this.feedbackText.setText(text);
        this.feedbackText.setColor(color);
        this.feedbackText.setAlpha(1);
        this.feedbackText.setScale(1);

        this.tweens.add({
            targets: this.feedbackText,
            alpha: 0,
            scale: 1.2,
            duration: duration,
            ease: 'Power2'
        });
    }

    createStarBurst(x, y) {
        for (let i = 0; i < 5; i++) {
            const star = this.add.image(x, y, 'gui_star').setScale(0.4);
            const angle = (i / 5) * Math.PI * 2;

            this.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * 80,
                y: y + Math.sin(angle) * 80 - 30,
                scale: 0,
                alpha: 0,
                rotation: Math.PI,
                duration: 600,
                ease: 'Power2',
                onComplete: () => star.destroy()
            });
        }
    }

    levelComplete() {
        this.isGameOver = true;
        this.stopBackgroundMusic();

        // Save progress
        const unlockedLevel = parseInt(localStorage.getItem('farisUnlockedLevel') || '1');
        if (this.currentLevel >= unlockedLevel && this.currentLevel < 3) {
            localStorage.setItem('farisUnlockedLevel', (this.currentLevel + 1).toString());
        }

        const completedLetters = JSON.parse(localStorage.getItem('farisCompletedLetters') || '{}');
        completedLetters[this.currentLevel] = this.completedLettersInLevel;
        localStorage.setItem('farisCompletedLetters', JSON.stringify(completedLetters));

        this.showLevelCompleteScreen();
    }

    showLevelCompleteScreen() {
        // Darken background
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
        overlay.setScrollFactor(0).setDepth(150);

        // Level complete text
        const completeText = this.add.text(640, 180, 'Niveau Compleet!', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#27ae60',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        // Arabic congratulations
        this.add.text(640, 250, 'أحسنت!', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '48px',
            color: '#f4d03f'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        // Score
        this.add.text(640, 320, `Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        // Letters learned
        this.add.text(640, 380, `Letters geleerd: ${this.completedLettersInLevel.length}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#98D8E8'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        // Next level button
        if (this.currentLevel < 3) {
            const nextBtn = this.add.text(640, 480, '▶ Volgende Niveau', {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#27ae60',
                padding: { x: 30, y: 15 }
            }).setOrigin(0.5).setScrollFactor(0).setDepth(151).setInteractive({ useHandCursor: true });

            nextBtn.on('pointerdown', () => {
                window.GameData.currentLevel = this.currentLevel + 1;
                this.scene.restart();
            });
            nextBtn.on('pointerover', () => nextBtn.setScale(1.1));
            nextBtn.on('pointerout', () => nextBtn.setScale(1));
        }

        // Menu button
        const menuBtn = this.add.text(640, 560, '← Terug naar Menu', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
        menuBtn.on('pointerover', () => menuBtn.setScale(1.1));
        menuBtn.on('pointerout', () => menuBtn.setScale(1));
    }

    returnToMenu() {
        this.stopBackgroundMusic();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }

    gameOver() {
        this.isGameOver = true;
        this.stopBackgroundMusic();

        window.GameData.saveHighScore(this.score);

        this.player.setVelocity(0, 0);
        this.player.body.enable = false;
        this.player.play('player_hit_anim');

        this.joystick.enable = false;
        this.jumpButton.disableInteractive();

        this.time.delayedCall(500, () => this.showGameOverScreen());
    }

    showGameOverScreen() {
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        overlay.setScrollFactor(0).setDepth(150);

        this.add.text(640, 200, 'Einde Spel', {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        this.add.text(640, 270, 'انتهت اللعبة', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        this.add.text(640, 340, `Je score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        this.add.text(640, 400, `Beste: ${window.GameData.highScore}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        const restartBtn = this.add.image(640, 520, 'gui_btn_replay')
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(151)
            .setScale(1.5);

        restartBtn.on('pointerdown', () => this.scene.restart());
        restartBtn.on('pointerover', () => restartBtn.setScale(1.7));
        restartBtn.on('pointerout', () => restartBtn.setScale(1.5));
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Handle player movement
        this.handlePlayerMovement();

        // Check if player fell off the world
        if (this.player.y > this.levelHeight) {
            this.loseLife();
            this.respawnPlayer();
        }
    }

    handlePlayerMovement() {
        const cursorKeys = this.joystick.createCursorKeys();
        const left = cursorKeys.left.isDown || this.cursors.left.isDown;
        const right = cursorKeys.right.isDown || this.cursors.right.isDown;
        const jumpKey = this.cursors.up.isDown || this.spaceKey.isDown;

        // Horizontal movement
        if (left) {
            this.player.setVelocityX(-this.playerSpeed);
            this.player.setFlipX(true);
            if (this.isOnGround) this.player.play('player_run_anim', true);
        } else if (right) {
            this.player.setVelocityX(this.playerSpeed);
            this.player.setFlipX(false);
            if (this.isOnGround) this.player.play('player_run_anim', true);
        } else {
            this.player.setVelocityX(0);
            if (this.isOnGround) this.player.play('player_idle_anim', true);
        }

        // Falling animation
        if (!this.isOnGround && this.player.body.velocity.y > 0) {
            this.player.play('player_fall_anim', true);
        }

        // Jump from keyboard
        if (jumpKey && this.canJump) {
            this.jump();
        }

        // Check if player is on ground
        if (!this.player.body.touching.down) {
            this.isOnGround = false;
        }
    }

    loseLife() {
        this.lives--;

        if (this.hearts[this.lives]) {
            this.tweens.add({
                targets: this.hearts[this.lives],
                scale: 0,
                alpha: 0,
                duration: 300
            });
        }

        if (window.AudioSynth) window.AudioSynth.playWrong();

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    respawnPlayer() {
        if (this.isGameOver) return;

        // Respawn at start of level
        this.player.setPosition(150, this.groundY - 100);
        this.player.setVelocity(0, 0);

        // Flash effect
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
    }
}
