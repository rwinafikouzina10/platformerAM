/**
 * GameScene - Main gameplay scene
 * Endless runner with Arabic letter learning mechanics
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Game state
        this.score = 0;
        this.lives = 3;
        this.gameSpeed = 200;
        this.isGameOver = false;
        this.isPaused = false;

        // Letter learning state
        this.currentTarget = null;
        this.targetLetter = null;
        this.consecutiveCorrect = 0;
        this.correctCollections = 0; // Track how many times correct letter collected
        this.requiredCollections = 5; // Need 5 correct to advance to next letter

        // Level system
        this.currentLevel = window.GameData.currentLevel || 1;
        this.levelLetters = this.getLettersForLevel(this.currentLevel);
        this.completedLettersInLevel = [];
        this.currentLetterIndex = 0;

        // Spawning timers
        this.lastObstacleTime = 0;
        this.lastPlatformTime = 0;
        this.obstacleInterval = 3000;
        this.platformInterval = 2500;

        // Ground level
        this.groundY = 620;

        // Player state
        this.canJump = true;
        this.isOnGround = true;

        // Available fruit types for collectibles
        this.fruitTypes = ['apple', 'banana', 'cherry', 'orange', 'melon', 'kiwi', 'strawberry'];
    }

    create() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, 1280, 720);

        // Create game layers
        this.createBackground();
        this.createGround();
        this.createPlayer();
        this.createUI();
        this.createControls();

        // Create object groups
        this.createObjectGroups();

        // Start the game
        this.startGame();

        // Camera fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    createBackground() {
        // Create beautiful multi-layer parallax scrolling background
        // Each layer scrolls at different speed for depth effect

        // Sky gradient background (static base)
        const skyColor = this.currentLevel === 2 ? 0x87CEEB :
                        this.currentLevel === 3 ? 0xE8D4B8 : 0xF5DEB3;
        this.add.rectangle(640, 360, 1280, 720, skyColor);

        // Parallax layers array - ordered from back to front
        // Each layer has: key, yPosition, scrollSpeed (slower = further)
        this.parallaxLayers = [];

        // Mountains (furthest back, slowest scroll)
        const mountains = this.add.tileSprite(640, 360, 1280, 720, 'parallax_mountains');
        mountains.setScrollFactor(0);
        mountains.scrollSpeed = 0.02; // Very slow - distant
        this.parallaxLayers.push(mountains);

        // Far rocky terrain
        const far = this.add.tileSprite(640, 360, 1280, 720, 'parallax_far');
        far.setScrollFactor(0);
        far.scrollSpeed = 0.05; // Slow
        this.parallaxLayers.push(far);

        // Mid rocky terrain
        const mid = this.add.tileSprite(640, 360, 1280, 720, 'parallax_mid');
        mid.setScrollFactor(0);
        mid.scrollSpeed = 0.08; // Medium
        this.parallaxLayers.push(mid);

        // Close rocky terrain (closest, fastest scroll)
        const close = this.add.tileSprite(640, 360, 1280, 720, 'parallax_close');
        close.setScrollFactor(0);
        close.scrollSpeed = 0.12; // Faster - closer
        this.parallaxLayers.push(close);

        // Apply color tint based on level for variety
        if (this.currentLevel === 2) {
            // Cooler blue-ish tint for level 2
            this.parallaxLayers.forEach(layer => layer.setTint(0xC4D4E0));
        } else if (this.currentLevel === 3) {
            // Warmer sunset tint for level 3
            this.parallaxLayers.forEach(layer => layer.setTint(0xFFD4A0));
        }

        // Keep bg reference for compatibility (points to closest layer)
        this.bg = close;

        // Add decorative elements (palm trees, oasis)
        this.decorations = this.add.group();

        // Initial decorations
        this.addDecoration(200, this.groundY - 80, 'palm_tree', 0.8);
        this.addDecoration(800, this.groundY - 80, 'palm_tree', 0.6);
        this.addDecoration(1100, this.groundY - 30, 'oasis', 0.7);
    }

    addDecoration(x, y, key, scale = 1) {
        const deco = this.add.image(x, y, key).setScale(scale).setOrigin(0.5, 1);
        deco.setDepth(-1);
        this.decorations.add(deco);
        return deco;
    }

    createGround() {
        // Ground group (static physics bodies)
        this.ground = this.physics.add.staticGroup();

        // Create ground tiles using Kenney sand tiles
        const tileWidth = 70;
        for (let x = 0; x < 1400; x += tileWidth) {
            let tileKey = 'sand_mid';
            if (x === 0) {
                tileKey = 'sand_left';
            }

            // Top layer
            const topTile = this.ground.create(x, this.groundY, tileKey);
            topTile.setOrigin(0, 0);
            topTile.refreshBody();

            // Fill below with center tiles
            const fillTile = this.ground.create(x, this.groundY + 70, 'sand_center');
            fillTile.setOrigin(0, 0);
            fillTile.refreshBody();
        }
    }

    createPlayer() {
        // Create player sprite with Kenney Adventurer (80x110 px)
        this.player = this.physics.add.sprite(200, this.groundY - 60, 'player_idle');
        this.player.setScale(0.9); // Scale down the 80x110 sprite to fit
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);

        // Adjust hitbox for the adventurer sprite
        this.player.body.setSize(40, 90);
        this.player.body.setOffset(20, 15);

        // Start idle animation
        this.player.play('player_idle_anim');

        // Add player to ground collision
        this.physics.add.collider(this.player, this.ground, () => {
            if (!this.isOnGround) {
                this.isOnGround = true;
                this.canJump = true;
                // Switch to run animation when on ground and moving
                if (this.player.body.velocity.x !== 0) {
                    this.player.play('player_run_anim', true);
                } else {
                    this.player.play('player_idle_anim', true);
                }
            }
        });

        // Dust particles when running
        this.playerDust = this.add.particles(0, 0, 'sand_center', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 200,
            frequency: 150,
            quantity: 1,
            tint: 0xf4d03f
        });
        this.playerDust.startFollow(this.player, 0, 20);
    }

    createUI() {
        // Score panel (top left)
        this.add.image(110, 35, 'score_panel');

        // Fruit icon for score
        const scoreIcon = this.add.sprite(30, 35, 'apple').setScale(1);
        scoreIcon.play('apple_anim');

        // Score text
        this.scoreText = this.add.text(60, 35, '0', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Lives (hearts) - top right
        this.hearts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(1200 - (i * 45), 35, 'heart').setScale(0.7);
            this.hearts.push(heart);
        }

        // Progress indicator (top center) - shows collection progress
        this.progressText = this.add.text(640, 35, '', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // "Listen again" button (Dutch: "Luister opnieuw")
        this.listenAgainBtn = this.add.text(640, 75, '🔊 Luister opnieuw', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#98D8E8',
            backgroundColor: '#00000088',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.listenAgainBtn.setVisible(false);

        this.listenAgainBtn.on('pointerdown', () => {
            if (window.AudioSynth && this.currentTarget) {
                window.AudioSynth.speakLetter(this.targetLetter, this.currentTarget.name);
                // Visual feedback
                this.listenAgainBtn.setScale(0.9);
                this.time.delayedCall(100, () => this.listenAgainBtn.setScale(1));
            }
        });

        // Feedback text (center screen)
        this.feedbackText = this.add.text(640, 300, '', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.feedbackText.setDepth(100);

        // High score (Dutch)
        this.add.text(1270, 680, `Beste: ${window.GameData.highScore}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            alpha: 0.7
        }).setOrigin(1, 0.5);
    }

    createControls() {
        // Virtual Joystick (left side of screen)
        this.joystick = this.plugins.get('rexVirtualJoystick').add(this, {
            x: 120,
            y: 580,
            radius: 60,
            base: this.add.image(0, 0, 'joystick_base').setAlpha(0.6),
            thumb: this.add.image(0, 0, 'joystick_thumb').setAlpha(0.8),
            dir: 'left&right',
            enable: true
        });

        // Jump button (right side of screen)
        this.jumpButton = this.add.image(1160, 580, 'jump_button')
            .setInteractive()
            .setAlpha(0.7)
            .setScale(1.2);

        // Jump on button press
        this.jumpButton.on('pointerdown', () => {
            this.jump();
            this.jumpButton.setScale(1.0);
            this.jumpButton.setAlpha(0.9);
        });

        this.jumpButton.on('pointerup', () => {
            this.jumpButton.setScale(1.2);
            this.jumpButton.setAlpha(0.7);
        });

        // Also allow tap on right half of screen to jump
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x > 640 && pointer.y < 500) {
                this.jump();
            }
        });

        // Keyboard controls (for desktop testing)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    createObjectGroups() {
        // Platforms group
        this.platforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Obstacles group
        this.obstacles = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Collectibles group
        this.collectibles = this.physics.add.group({
            allowGravity: false
        });

        // Floating letters group (like fruits)
        this.floatingLetters = this.physics.add.group({
            allowGravity: false
        });

        // Collisions
        this.physics.add.collider(this.player, this.platforms, this.onPlatformLand, null, this);
        this.physics.add.overlap(this.player, this.obstacles, this.onObstacleHit, null, this);
        this.physics.add.overlap(this.player, this.collectibles, this.onCollectItem, null, this);
        this.physics.add.overlap(this.player, this.floatingLetters, this.onCollectLetter, null, this);
    }

    startGame() {
        this.isGameOver = false;
        this.score = 0;
        this.lives = 3;
        this.gameSpeed = 200;
        this.updateScore(0);

        // Start spawning letters after delay
        this.time.delayedCall(1000, () => {
            this.selectNewTarget();
        });
    }

    getLettersForLevel(level) {
        const letters = window.GameData.letters;
        if (level === 3) {
            // Level 3 includes harakat - create letter+harakat combinations
            const combinations = [];
            const harakat = window.GameData.harakat || [];
            // Add first 10 letters with harakat
            for (let i = 0; i < Math.min(10, letters.length); i++) {
                harakat.forEach(h => {
                    combinations.push({
                        char: letters[i].char + h.char,
                        name: letters[i].name + ' met ' + h.name,
                        sound: letters[i].sound,
                        forms: [letters[i].char + h.char], // Combined form
                        baseChar: letters[i].char
                    });
                });
            }
            return combinations;
        }
        return letters;
    }

    selectNewTarget() {
        if (this.isGameOver) return;

        // Reset collection count for new letter
        this.correctCollections = 0;

        // Check if all letters in level are completed
        if (this.completedLettersInLevel.length >= this.levelLetters.length) {
            this.levelComplete();
            return;
        }

        // Get next uncompleted letter (sequential order for learning)
        let nextLetter = null;
        for (let i = 0; i < this.levelLetters.length; i++) {
            const letter = this.levelLetters[i];
            if (!this.completedLettersInLevel.includes(letter.char)) {
                nextLetter = letter;
                this.currentLetterIndex = i;
                break;
            }
        }

        if (!nextLetter) {
            this.levelComplete();
            return;
        }

        this.currentTarget = nextLetter;
        this.targetLetter = this.currentTarget.char;

        // Update progress indicator (don't show the letter!)
        this.updateProgressDisplay();
        this.listenAgainBtn.setVisible(true);

        // Speak the letter (audio only - no visual)
        if (window.AudioSynth) {
            window.AudioSynth.speakLetter(this.targetLetter, this.currentTarget.name);
        }

        // Show feedback in Dutch: "Listen carefully!" (no letter shown)
        this.showFeedback('Luister goed!', '#f4d03f', 1500);

        // Start spawning floating letters
        this.spawnFloatingLetters();
    }

    updateProgressDisplay() {
        // Show progress: letter count and collection progress
        const letterProgress = `Letter ${this.currentLetterIndex + 1}/${this.levelLetters.length}`;
        const collectProgress = `Verzameld: ${this.correctCollections}/${this.requiredCollections}`;
        this.progressText.setText(`Niveau ${this.currentLevel} | ${letterProgress} | ${collectProgress}`);
    }

    levelComplete() {
        this.isGameOver = true;

        // Save progress
        const unlockedLevel = parseInt(localStorage.getItem('farisUnlockedLevel') || '1');
        if (this.currentLevel >= unlockedLevel && this.currentLevel < 3) {
            localStorage.setItem('farisUnlockedLevel', (this.currentLevel + 1).toString());
        }

        // Save completed letters for this level
        const completedLetters = JSON.parse(localStorage.getItem('farisCompletedLetters') || '{}');
        completedLetters[this.currentLevel] = this.completedLettersInLevel;
        localStorage.setItem('farisCompletedLetters', JSON.stringify(completedLetters));

        // Show level complete screen
        this.showLevelCompleteScreen();
    }

    showLevelCompleteScreen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Darken background
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setDepth(90);

        // Level complete text
        this.add.text(width / 2, 180, 'Niveau Compleet!', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#27ae60',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Arabic congratulations
        this.add.text(width / 2, 250, 'أحسنت!', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '48px',
            color: '#f4d03f'
        }).setOrigin(0.5).setDepth(100);

        // Score
        this.add.text(width / 2, 320, `Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(100);

        // Letters learned
        this.add.text(width / 2, 380, `Letters geleerd: ${this.completedLettersInLevel.length}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#98D8E8'
        }).setOrigin(0.5).setDepth(100);

        // Next level button (if not level 3)
        if (this.currentLevel < 3) {
            const nextBtn = this.add.text(width / 2, 480, '▶ Volgende Niveau', {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#27ae60',
                padding: { x: 30, y: 15 }
            }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });

            nextBtn.on('pointerdown', () => {
                window.GameData.currentLevel = this.currentLevel + 1;
                this.scene.restart();
            });

            nextBtn.on('pointerover', () => nextBtn.setScale(1.1));
            nextBtn.on('pointerout', () => nextBtn.setScale(1));
        }

        // Back to menu button
        const menuBtn = this.add.text(width / 2, 560, '← Terug naar Menu', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        menuBtn.on('pointerover', () => menuBtn.setScale(1.1));
        menuBtn.on('pointerout', () => menuBtn.setScale(1));
    }

    spawnFloatingLetters() {
        if (this.isGameOver || !this.currentTarget) return;

        const letters = window.GameData.letters;
        const baseX = 1400;

        // Spawn 3 letters with wide horizontal spacing (one correct, two wrong)
        const numLetters = 3;
        const spacing = 250; // 250px spacing between each letter
        const positions = [];

        // Generate positions - spread out horizontally, reachable height
        // 150-200px above ground is jumpable but not too low
        for (let i = 0; i < numLetters; i++) {
            positions.push({
                x: baseX + (i * spacing),
                y: this.groundY - Phaser.Math.Between(150, 200)
            });
        }

        // Shuffle positions so correct letter position is random
        Phaser.Utils.Array.Shuffle(positions);

        // Get letter form based on level
        // Level 1: only isolated form (index 0)
        // Level 2+: all forms (isolated, initial, medial, final)
        let randomForm;
        const targetForms = this.currentTarget.forms || [this.targetLetter];
        if (this.currentLevel === 1) {
            // Level 1: only isolated form
            randomForm = targetForms[0];
        } else {
            // Level 2+: random form to teach all appearances
            randomForm = targetForms[Phaser.Math.Between(0, targetForms.length - 1)];
        }

        // Place correct letter (random form) at first shuffled position
        this.createFloatingLetter(positions[0].x, positions[0].y, randomForm, true);

        // Place wrong letters at remaining positions (use isolated form for clarity)
        for (let i = 1; i < positions.length; i++) {
            let wrongLetter;
            let wrongLetterData;
            do {
                const wrongIndex = Phaser.Math.Between(0, Math.min(letters.length - 1, 7));
                wrongLetterData = letters[wrongIndex];
                wrongLetter = wrongLetterData.char;
            } while (wrongLetter === this.currentTarget.char);

            // Use form based on level
            const wrongForms = wrongLetterData.forms || [wrongLetter];
            let wrongForm;
            if (this.currentLevel === 1) {
                wrongForm = wrongForms[0]; // Level 1: isolated only
            } else {
                wrongForm = wrongForms[Phaser.Math.Between(0, wrongForms.length - 1)];
            }

            this.createFloatingLetter(positions[i].x, positions[i].y, wrongForm, false);
        }
    }

    createFloatingLetter(x, y, letter, isCorrect) {
        // Create a container-like object using a graphics background + text
        // All letters look the same - player must identify by sound!
        // Circle radius 60px (120px diameter) to fit all Arabic letters
        const bg = this.add.circle(x, y, 60, 0xf4d03f, 0.9);
        bg.setStrokeStyle(3, 0x8b4513);
        bg.setDepth(10);

        // Arabic text centered in circle - sits on top of circle (higher depth)
        const letterText = this.add.text(x, y, letter, {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '40px',
            color: '#2c1810',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setDepth(11);

        // Create physics body for collision
        const hitbox = this.floatingLetters.create(x, y, null);
        hitbox.setVisible(false);
        hitbox.body.setCircle(60);
        hitbox.body.velocity.x = -this.gameSpeed;
        hitbox.isCorrect = isCorrect;
        hitbox.letter = letter;
        hitbox.letterText = letterText;
        hitbox.letterBg = bg;

        // Bobbing animation (like fruits)
        this.tweens.add({
            targets: [bg, letterText],
            y: y - 12,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return hitbox;
    }

    onCollectLetter(player, letterObj) {
        if (!letterObj.active) return;
        letterObj.active = false;

        if (letterObj.isCorrect) {
            // Correct letter collected!
            this.correctCollections++;
            this.updateProgressDisplay();

            // Sound and visual feedback
            if (window.AudioSynth) {
                window.AudioSynth.playCorrect();
            }
            this.updateScore(50);
            this.consecutiveCorrect++;

            // Show feedback
            this.showFeedback('Goed zo! ممتاز', '#27ae60', 1000);
            this.createStarBurst(letterObj.x, letterObj.y);

            // Check if collected enough times
            if (this.correctCollections >= this.requiredCollections) {
                // Mark this letter as completed
                if (!this.completedLettersInLevel.includes(this.currentTarget.char)) {
                    this.completedLettersInLevel.push(this.currentTarget.char);
                }

                // Bonus for completing letter
                this.updateScore(100);
                this.showFeedback('Letter compleet! +100', '#f4d03f', 1500);

                // Select new letter after delay
                this.time.delayedCall(2000, () => {
                    this.selectNewTarget();
                });
            }

            // Speed up slightly
            this.gameSpeed = Math.min(this.gameSpeed + 3, 350);
        } else {
            // Wrong letter!
            if (window.AudioSynth) {
                window.AudioSynth.playWrong();
            }

            this.consecutiveCorrect = 0;
            this.showFeedback('Probeer opnieuw!', '#e74c3c', 1000);

            // Speak the correct letter again
            this.time.delayedCall(800, () => {
                if (window.AudioSynth && this.currentTarget) {
                    window.AudioSynth.speakLetter(this.targetLetter, this.currentTarget.name);
                }
            });
        }

        // Remove the letter
        if (letterObj.letterText) letterObj.letterText.destroy();
        if (letterObj.letterBg) letterObj.letterBg.destroy();
        letterObj.destroy();
    }

    spawnObstacle() {
        if (this.isGameOver) return;

        const x = 1400;
        const y = this.groundY;

        // Use spikes as obstacle
        const obstacle = this.obstacles.create(x, y, 'spikes');
        obstacle.setOrigin(0.5, 1);
        obstacle.setScale(2); // Scale up the 16x16 spikes
        obstacle.body.setSize(32, 16);
        obstacle.body.setOffset(0, 16);
        obstacle.body.velocity.x = -this.gameSpeed;

        return obstacle;
    }

    spawnFruit(x, y) {
        if (this.isGameOver) return;

        // Pick a random fruit type
        const fruitType = Phaser.Math.RND.pick(this.fruitTypes);
        const fruit = this.collectibles.create(x, y, fruitType);
        fruit.setScale(1.5);
        fruit.body.velocity.x = -this.gameSpeed;
        fruit.itemType = 'fruit';
        fruit.fruitType = fruitType;
        fruit.value = 10;

        // Play fruit animation
        fruit.play(`${fruitType}_anim`);

        // Bobbing animation
        this.tweens.add({
            targets: fruit,
            y: y - 10,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return fruit;
    }

    spawnBook(x, y) {
        if (this.isGameOver) return;

        // Use melon as "special" collectible
        const book = this.collectibles.create(x, y, 'melon');
        book.setScale(2);
        book.body.velocity.x = -this.gameSpeed;
        book.itemType = 'book';
        book.value = 25;
        book.play('melon_anim');

        return book;
    }

    jump() {
        if (this.isGameOver || !this.canJump) return;

        if (this.player.body.touching.down || this.isOnGround) {
            this.player.setVelocityY(-450);
            this.player.play('player_jump_anim');
            this.canJump = false;
            this.isOnGround = false;

            // Play jump sound
            if (window.AudioSynth) {
                window.AudioSynth.playJump();
            }
        }
    }

    onPlatformLand(player, platform) {
        if (player.body.touching.down) {
            this.isOnGround = true;
            this.canJump = true;
            player.play('player_run_anim', true);
        }
    }

    onObstacleHit(player, obstacle) {
        if (!obstacle.active) return;
        obstacle.active = false;

        // Lose a life
        this.loseLife();

        // Play hit animation
        player.play('player_hit_anim');

        // Knockback
        player.setVelocityX(-150);
        player.setVelocityY(-200);

        // Flash player
        this.tweens.add({
            targets: player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                if (!this.isGameOver) {
                    player.play('player_idle_anim', true);
                }
            }
        });

        // Remove obstacle
        obstacle.destroy();
    }

    onCollectItem(player, item) {
        if (!item.active) return;
        item.active = false;

        // Score based on item type
        this.updateScore(item.value);

        // Sound
        if (window.AudioSynth) {
            window.AudioSynth.playCoin();
        }

        // Play collected animation
        const collected = this.add.sprite(item.x, item.y, 'collected');
        collected.setScale(1.5);
        collected.play('collected_anim');
        collected.once('animationcomplete', () => {
            collected.destroy();
        });

        // Remove the item
        item.destroy();
    }

    loseLife() {
        this.lives--;

        // Update hearts UI
        if (this.hearts[this.lives]) {
            this.tweens.add({
                targets: this.hearts[this.lives],
                scale: 0,
                alpha: 0,
                duration: 300
            });
        }

        // Sound
        if (window.AudioSynth) {
            window.AudioSynth.playWrong();
        }

        // Check game over
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText(this.score.toString());

        // Animate score increase
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
            const star = this.add.image(x, y, 'star').setScale(0.3);
            const angle = (i / 5) * Math.PI * 2;
            const distance = 80;

            this.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance - 30,
                scale: 0,
                alpha: 0,
                rotation: Math.PI,
                duration: 600,
                ease: 'Power2',
                onComplete: () => star.destroy()
            });
        }
    }

    gameOver() {
        this.isGameOver = true;

        // Save high score
        window.GameData.saveHighScore(this.score);

        // Stop player
        this.player.setVelocity(0, 0);
        this.player.body.enable = false;
        this.player.play('player_hit_anim');

        // Disable controls
        this.joystick.enable = false;
        this.jumpButton.disableInteractive();

        // Show game over screen
        this.time.delayedCall(500, () => {
            this.showGameOverScreen();
        });
    }

    showGameOverScreen() {
        // Darken background
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        overlay.setDepth(90);

        // Game Over text (Dutch: "Einde Spel")
        this.add.text(640, 200, 'Einde Spel', {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Arabic text
        this.add.text(640, 270, 'انتهت اللعبة', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(100);

        // Final score (Dutch: "Je score")
        this.add.text(640, 340, `Je score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // High score (Dutch: "Beste")
        this.add.text(640, 400, `Beste: ${window.GameData.highScore}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(100);

        // New high score message if applicable
        if (this.score > window.GameData.highScore) {
            this.add.text(640, 450, 'Nieuwe hoogste score!', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#f4d03f',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(100);
        }

        // Restart button using Pixel Adventure button
        const restartBtn = this.add.image(640, 520, 'btn_restart')
            .setInteractive()
            .setDepth(100)
            .setScale(2);

        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });

        restartBtn.on('pointerover', () => {
            restartBtn.setScale(2.2);
        });

        restartBtn.on('pointerout', () => {
            restartBtn.setScale(2);
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Parallax scrolling - each layer at different speed for depth effect
        // Synced with game speed for realistic movement
        this.parallaxLayers.forEach(layer => {
            layer.tilePositionX += this.gameSpeed * layer.scrollSpeed;
        });

        // Handle player movement and animation
        this.handlePlayerMovement();

        // Update object velocities based on game speed
        this.updateObjectVelocities();

        // Spawn management
        this.handleSpawning(time);

        // Cleanup off-screen objects
        this.cleanupObjects();

        // Update decorations
        this.updateDecorations();

        // Update floating letter positions (text and background follow hitbox)
        this.floatingLetters.getChildren().forEach(letterObj => {
            if (letterObj.letterText) {
                letterObj.letterText.x = letterObj.x;
            }
            if (letterObj.letterBg) {
                letterObj.letterBg.x = letterObj.x;
            }
        });
    }

    handlePlayerMovement() {
        // Get joystick input
        const cursorKeys = this.joystick.createCursorKeys();

        // Combine joystick and keyboard input
        const left = cursorKeys.left.isDown || this.cursors.left.isDown;
        const right = cursorKeys.right.isDown || this.cursors.right.isDown;
        const jumpKey = this.cursors.up.isDown || this.spaceKey.isDown;

        // Horizontal movement
        if (left) {
            this.player.setVelocityX(-250);
            this.player.setFlipX(true);
            if (this.isOnGround && this.player.anims.currentAnim?.key !== 'player_run_anim') {
                this.player.play('player_run_anim', true);
            }
        } else if (right) {
            this.player.setVelocityX(250);
            this.player.setFlipX(false);
            if (this.isOnGround && this.player.anims.currentAnim?.key !== 'player_run_anim') {
                this.player.play('player_run_anim', true);
            }
        } else {
            // Slight forward drift in endless runner
            this.player.setVelocityX(50);
            this.player.setFlipX(false);
            if (this.isOnGround && this.player.anims.currentAnim?.key !== 'player_idle_anim') {
                this.player.play('player_idle_anim', true);
            }
        }

        // Check if falling
        if (!this.isOnGround && this.player.body.velocity.y > 0) {
            if (this.player.anims.currentAnim?.key !== 'player_fall_anim') {
                this.player.play('player_fall_anim', true);
            }
        }

        // Jump from keyboard
        if (jumpKey && this.canJump) {
            this.jump();
        }

        // Keep player in bounds
        this.player.x = Phaser.Math.Clamp(this.player.x, 50, 400);
    }

    updateObjectVelocities() {
        // Update all moving objects to current game speed
        const speed = -this.gameSpeed;

        this.platforms.getChildren().forEach(p => p.body.velocity.x = speed);
        this.obstacles.getChildren().forEach(o => o.body.velocity.x = speed);
        this.collectibles.getChildren().forEach(c => c.body.velocity.x = speed);
        this.floatingLetters.getChildren().forEach(fl => fl.body.velocity.x = speed);
    }

    handleSpawning(time) {
        // Spawn obstacles (less frequent to not interfere with letter learning)
        if (time - this.lastObstacleTime > this.obstacleInterval) {
            if (Phaser.Math.Between(0, 100) < 25) {
                this.spawnObstacle();
            }
            this.lastObstacleTime = time;
            this.obstacleInterval = Math.max(3000, this.obstacleInterval - 5);
        }

        // Spawn floating letters periodically (if we have a target and haven't completed it)
        if (this.currentTarget && this.correctCollections < this.requiredCollections) {
            if (time - this.lastPlatformTime > this.platformInterval) {
                // Spawn new group when previous group has moved past halfway point
                const existingLetters = this.floatingLetters.getChildren();
                const canSpawn = existingLetters.length === 0 ||
                    existingLetters.every(l => l.x < 700); // Past center of screen

                if (canSpawn) {
                    this.spawnFloatingLetters();
                    this.lastPlatformTime = time;
                    this.platformInterval = 2000; // 2 second minimum between groups
                }
            }
        }
    }

    cleanupObjects() {
        // Remove off-screen objects
        const cleanup = (group) => {
            group.getChildren().forEach(obj => {
                if (obj.x < -100) {
                    if (obj.letterText) {
                        obj.letterText.destroy();
                    }
                    if (obj.letterBg) {
                        obj.letterBg.destroy();
                    }
                    obj.destroy();
                }
            });
        };

        cleanup(this.platforms);
        cleanup(this.obstacles);
        cleanup(this.collectibles);
        cleanup(this.floatingLetters);
    }

    updateDecorations() {
        // Move decorations
        this.decorations.getChildren().forEach(deco => {
            deco.x -= this.gameSpeed * 0.01;

            // Respawn on right when off screen
            if (deco.x < -100) {
                deco.x = 1400 + Phaser.Math.Between(0, 200);
                deco.y = this.groundY - Phaser.Math.Between(30, 80);
            }
        });
    }
}
