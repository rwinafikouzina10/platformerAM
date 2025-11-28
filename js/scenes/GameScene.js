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
        // Sky color based on level
        const skyColors = [0x87CEEB, 0xE8D4B8, 0xFFB366];
        const skyColor = skyColors[(this.currentLevel - 1) % skyColors.length];

        // Create sky that fills the level
        this.add.rectangle(this.levelWidth / 2, this.levelHeight / 2, this.levelWidth, this.levelHeight, skyColor);

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

        // Apply tint based on level
        const tints = [null, 0xC4D4E0, 0xFFD4A0];
        if (tints[this.currentLevel - 1]) {
            this.parallaxLayers.forEach(layer => layer.setTint(tints[this.currentLevel - 1]));
        }
    }

    createLevel() {
        // Create physics groups
        this.platforms = this.physics.add.staticGroup();
        this.letterBoxes = this.physics.add.group({ allowGravity: false });

        // Generate the level procedurally
        this.generateLevel();
    }

    generateLevel() {
        // Create ground along the entire level
        this.createGround();

        // Generate platforms with guaranteed reachability
        this.generatePlatforms();

        // Place letters on platforms
        this.placeLetters();
    }

    createGround() {
        // Create ground tiles across the level width
        const tileWidth = 70;
        for (let x = 0; x < this.levelWidth; x += tileWidth) {
            // Top layer
            const topTile = this.platforms.create(x, this.groundY, 'sand_mid');
            topTile.setOrigin(0, 0);
            topTile.refreshBody();

            // Fill below
            const fillTile = this.platforms.create(x, this.groundY + 70, 'sand_center');
            fillTile.setOrigin(0, 0);
            fillTile.refreshBody();
        }
    }

    generatePlatforms() {
        // Platform generation parameters - tuned for jump physics
        // With jumpForce: -620, gravity: 900, speed: 320
        const minPlatformWidth = 3; // tiles
        const maxPlatformWidth = 6;
        const maxJumpHeight = 120; // conservative - player can reach ~200px
        const maxJumpDistance = 200; // conservative - player can reach ~300px

        // Store platforms for letter placement
        this.platformPositions = [];

        // Starting position for first platform (easy to reach from ground)
        let currentX = 350;

        // Generate platforms ensuring reachability
        const numPlatforms = Math.floor(this.levelWidth / 350);

        for (let i = 0; i < numPlatforms; i++) {
            // Platform width in tiles
            const platformWidth = Phaser.Math.Between(minPlatformWidth, maxPlatformWidth);
            const platformPixelWidth = platformWidth * this.tileSize;

            // Platforms at comfortable jumping height (not too high, not too low)
            // Between 120 and 250 pixels above ground
            const minY = this.groundY - 250;
            const maxY = this.groundY - 120;

            // Calculate Y position - gentle variation
            let newY;
            if (i === 0) {
                newY = this.groundY - 140; // First platform easy to reach
            } else {
                // New platform within easy jump range of previous
                const prevPlatform = this.platformPositions[i - 1];
                const yVariation = Phaser.Math.Between(-80, 80);
                newY = Phaser.Math.Clamp(prevPlatform.y + yVariation, minY, maxY);
            }

            // X spacing - always reachable
            const xSpacing = Phaser.Math.Between(120, maxJumpDistance);
            currentX += xSpacing;

            // Don't exceed level width
            if (currentX + platformPixelWidth > this.levelWidth - 200) break;

            // Create the platform
            this.createPlatform(currentX, newY, platformWidth);

            // Store position for letter placement
            this.platformPositions.push({
                x: currentX + platformPixelWidth / 2,
                y: newY,
                width: platformPixelWidth
            });

            currentX += platformPixelWidth;
        }
    }

    createPlatform(x, y, widthInTiles) {
        // Create a platform using tiles
        for (let i = 0; i < widthInTiles; i++) {
            let tileKey = 'sand_mid';
            if (i === 0) tileKey = 'sand_left';
            if (i === widthInTiles - 1) tileKey = 'sand_right';
            if (widthInTiles === 1) tileKey = 'sand_mid';

            const tile = this.platforms.create(x + (i * this.tileSize), y, tileKey);
            tile.setOrigin(0, 0);
            tile.setScale(0.5); // Scale down 70px tiles to 35px
            tile.refreshBody();
        }
    }

    placeLetters() {
        // Place letters on platforms only (not on ground to avoid blocking)
        const numLetters = Math.min(this.platformPositions.length, 8);

        // Shuffle platform positions
        const shuffledPlatforms = Phaser.Utils.Array.Shuffle([...this.platformPositions]);

        // Place letter boxes above platforms
        for (let i = 0; i < numLetters; i++) {
            const platform = shuffledPlatforms[i];
            if (!platform) continue;

            // Place the letter box above the platform (reachable by jumping)
            const letterY = platform.y - 60;

            this.createLetterBox(platform.x, letterY, null, false, true);
        }

        // Place a few floating letters high above ground (player jumps to collect)
        const floatingPositions = [500, 1000, 1500, 2000, 2500];
        floatingPositions.forEach(x => {
            if (x < this.levelWidth - 200) {
                // High enough that player must jump, but reachable
                const floatY = this.groundY - 180;
                this.createLetterBox(x, floatY, null, false, true);
            }
        });
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
