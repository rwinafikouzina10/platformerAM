/**
 * GameScene - Main gameplay scene
 * Simple hand-designed level based on Sunny Land pattern
 * Arabic letter learning mechanics
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

        // Current level and letters
        this.currentLevel = window.GameData.currentLevel || 1;
        this.levelLetters = this.getLettersForLevel(this.currentLevel);
        this.completedLettersInLevel = [];
        this.currentTarget = null;

        // Player physics - Mario-like feel (adjusted for 2x scale)
        this.playerSpeed = 250;
        this.jumpForce = -400;

        // Sound debounce
        this.lastSoundTime = 0;
        this.soundCooldown = 1500;

        // Hurt state
        this.hurtFlag = false;
    }

    create() {
        // Create the level using tilemap
        this.editorCreate();

        // Set up collisions
        this.initColliders();

        // Set up camera
        this.initCamera();

        // Create UI
        this.createUI();

        // Create controls
        this.createControls();

        // Start the game
        this.startGame();

        // Camera fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    editorCreate() {
        // --- TILEMAP SETUP (following Sunny Land pattern) ---
        const map = this.add.tilemap('sunny_land_map');
        map.addTilesetImage('tileset', 'sunny_land_tileset');

        // --- PARALLAX BACKGROUNDS ---
        // Scale factor: Sunny Land is 928x400, use 2x to fit 720px height nicely
        const scaleX = 2;
        const scaleY = 2;

        // Sky background layer (furthest back) - tile to cover width
        this.back1 = this.add.image(0, 0, 'sunny_land_back').setOrigin(0, 0).setScale(scaleX, scaleY);
        this.back2 = this.add.image(384 * scaleX, 0, 'sunny_land_back').setOrigin(0, 0).setScale(scaleX, scaleY);
        this.back3 = this.add.image(768 * scaleX, 0, 'sunny_land_back').setOrigin(0, 0).setScale(scaleX, scaleY);
        this.back4 = this.add.image(1152 * scaleX, 0, 'sunny_land_back').setOrigin(0, 0).setScale(scaleX, scaleY);

        // Forest midground layer
        const midY = 80 * scaleY;
        this.mid1 = this.add.image(0, midY, 'sunny_land_middle').setOrigin(0, 0).setScale(scaleX, scaleY);
        this.mid2 = this.add.image(176 * scaleX, midY, 'sunny_land_middle').setOrigin(0, 0).setScale(scaleX, scaleY);
        this.mid3 = this.add.image(352 * scaleX, midY, 'sunny_land_middle').setOrigin(0, 0).setScale(scaleX, scaleY);
        this.mid4 = this.add.image(528 * scaleX, midY, 'sunny_land_middle').setOrigin(0, 0).setScale(scaleX, scaleY);
        this.mid5 = this.add.image(704 * scaleX, midY, 'sunny_land_middle').setOrigin(0, 0).setScale(scaleX, scaleY);
        this.mid6 = this.add.image(880 * scaleX, midY, 'sunny_land_middle').setOrigin(0, 0).setScale(scaleX, scaleY);

        // --- TILE LAYER ---
        // Map is 58x25 tiles (16px each) = 928x400, scaled 2x = 1856x800
        this.layer = map.createLayer('Tile Layer 1', ['tileset'], 0, 0);
        this.layer.setScale(scaleX, scaleY);
        this.layer.setDepth(1);

        // --- PLAYER (Arabian Adventurer) ---
        // Spawn on lower ground area (y~320 in original = 640 scaled)
        // Start near the house on the right side
        const startX = 750 * scaleX;
        const startY = 280 * scaleY;  // Above the ground, gravity will drop player

        this.player = this.physics.add.sprite(startX, startY, 'player_idle');
        this.player.setScale(2);  // Scale up player to match 2x world
        this.player.setDepth(10);
        this.player.setFlipX(true);  // Face left initially
        this.player.play('player_idle_anim');

        // Player physics body
        this.player.body.setSize(40, 50);
        this.player.body.setOffset(12, 14);

        // Store map reference
        this.map = map;
        this.mapScale = scaleX;

        // --- LETTER BOXES (replacing cherries/gems) ---
        this.letterBoxes = this.physics.add.group({ allowGravity: false });
        this.createLetterBoxes();

        // --- ENEMIES ---
        this.enemies = this.physics.add.group();
        this.createEnemies();
    }

    initColliders() {
        // Set up collision tiles (based on Sunny Land tileset)
        // These tile indices are solid ground/platform tiles
        this.map.setCollision([
            27, 29, 31, 33, 35, 37,       // Top platform edges
            77, 81, 86, 87,               // Solid blocks
            127, 129, 131, 133, 134, 135, // Mid blocks
            83, 84, 502, 504, 505,        // Various tiles
            529, 530, 333, 335, 337, 339, // More tiles
            366, 368, 262, 191, 193, 195, // Even more tiles
            241, 245, 291, 293, 295       // Bottom tiles
        ]);

        // Set some tiles to only have top collision (one-way platforms)
        this.setTopCollisionTiles([35, 36, 84, 86, 134, 135, 366, 367, 368, 262]);

        // Player vs layer collision
        this.physics.add.collider(this.player, this.layer);

        // Enemies vs layer collision
        this.physics.add.collider(this.enemies, this.layer);

        // Player vs letter boxes (overlap)
        this.physics.add.overlap(this.player, this.letterBoxes, this.onCollectLetter, null, this);

        // Player vs enemies (overlap for stomp detection)
        this.physics.add.overlap(this.player, this.enemies, this.checkAgainstEnemies, null, this);
    }

    setTopCollisionTiles(tiles) {
        const tileSet = new Set(tiles);

        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                const tile = this.layer.getTileAt(x, y);

                if (tile && tileSet.has(tile.index)) {
                    // Only collide from top
                    tile.setCollision(false, false, true, false);
                }
            }
        }
    }

    initCamera() {
        const camera = this.cameras.main;
        // Set bounds to scaled map size
        camera.setBounds(0, 0, this.layer.width * this.mapScale, this.layer.height * this.mapScale);
        camera.startFollow(this.player, true, 0.1, 0.1);
        camera.setDeadzone(100, 50);
    }

    createLetterBoxes() {
        // Place letter boxes at strategic positions (scaled coordinates)
        // Sunny Land level layout (original coords, then scaled 2x):
        // - Upper platforms: y ~130-150 -> 260-300
        // - Lower ground: y ~310-330 -> 620-660
        const scale = this.mapScale;
        const positions = [
            { x: 64 * scale, y: 80 * scale },      // Top left (gems area)
            { x: 480 * scale, y: 65 * scale },     // Above tree (cherries area)
            { x: 370 * scale, y: 255 * scale },    // Middle lower platform
            { x: 672 * scale, y: 180 * scale },    // Right side elevated
            { x: 200 * scale, y: 120 * scale },    // Left middle platform
        ];

        this.letterBoxPositions = positions;
    }

    createEnemies() {
        // Place enemies at strategic positions (scaled coordinates)
        // Match Sunny Land enemy positions - they spawn on platforms and fall to ground
        const scale = this.mapScale;

        // Enemy spawn positions based on Sunny Land level layout
        // Original: frog (240,144), (553,324), opossum (678,147), (368,320)
        const enemyPositions = [
            { x: 240 * scale, y: 125 * scale, type: 'mushroom' },   // Upper left platform
            { x: 550 * scale, y: 305 * scale, type: 'slime' },      // Lower middle
            { x: 680 * scale, y: 125 * scale, type: 'chicken' },    // Upper right
            { x: 370 * scale, y: 300 * scale, type: 'mushroom' },   // Lower left
        ];

        const enemyTypes = {
            mushroom: { key: 'enemy_mushroom_run', scale: 2.5, speed: 60 },
            slime: { key: 'enemy_slime_run', scale: 2.5, speed: 40 },
            chicken: { key: 'enemy_chicken_run', scale: 2.5, speed: 80 }
        };

        enemyPositions.forEach(pos => {
            const config = enemyTypes[pos.type];
            const enemy = this.enemies.create(pos.x, pos.y, config.key);
            enemy.setScale(config.scale);
            enemy.play(config.key);
            enemy.setDepth(5);

            // Set up patrol
            enemy.direction = Math.random() > 0.5 ? 1 : -1;
            enemy.moveSpeed = config.speed;
            enemy.patrolMinX = pos.x - 80 * scale;
            enemy.patrolMaxX = pos.x + 80 * scale;
            enemy.isDead = false;

            enemy.setVelocityX(enemy.direction * enemy.moveSpeed);
            enemy.setFlipX(enemy.direction > 0);

            // Adjust hitbox
            enemy.body.setSize(24, 24);
        });
    }

    checkAgainstEnemies(player, enemy) {
        if (enemy.isDead) return;

        // Check if player is stomping (falling onto enemy from above)
        const playerBottom = player.body.bottom;
        const enemyTop = enemy.body.top;
        const playerVelY = player.body.velocity.y;

        if (playerVelY > 0 && playerBottom <= enemyTop + 20) {
            // Stomp the enemy!
            enemy.isDead = true;
            enemy.body.enable = false;

            // Squash and destroy
            this.tweens.add({
                targets: enemy,
                scaleY: 0.3,
                alpha: 0,
                y: enemy.y + 20,
                duration: 200,
                onComplete: () => enemy.destroy()
            });

            // Bounce player
            player.body.velocity.y = -200;

            // Award points
            this.updateScore(50);
            if (window.AudioSynth) window.AudioSynth.playCoin();
        } else {
            // Player got hurt
            this.hurtPlayer();
        }
    }

    hurtPlayer() {
        if (this.hurtFlag) return;

        this.hurtFlag = true;

        // Knockback
        const knockDir = this.player.flipX ? 1 : -1;
        this.player.setVelocity(knockDir * 150, -150);

        // Flash effect
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.player.alpha = 1;
                this.time.delayedCall(500, () => {
                    this.hurtFlag = false;
                });
            }
        });

        // Lose a life
        this.loseLife();
        if (window.AudioSynth) window.AudioSynth.playWrong();
    }

    createUI() {
        // Create UI container (fixed to camera)
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setScrollFactor(0);
        this.uiContainer.setDepth(100);

        // Menu button
        const menuBtn = this.add.image(35, 35, 'gui_btn_menu');
        menuBtn.setDisplaySize(45, 45);
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => this.returnToMenu());
        this.uiContainer.add(menuBtn);

        // Score panel
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

        // Target letter display
        this.targetDisplay = this.add.text(640, 80, '', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '36px',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        this.uiContainer.add(this.targetDisplay);

        // Listen again button
        this.listenAgainBtn = this.add.text(640, 130, 'Luister', {
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

        // Touch jump on right side
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
        return window.GameData.letters;
    }

    selectNewTarget() {
        if (this.isGameOver) return;

        // Check if level complete
        if (this.completedLettersInLevel.length >= Math.min(5, this.levelLetters.length)) {
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

        // Update UI
        this.updateProgressDisplay();
        this.targetDisplay.setText('Luister en zoek!');

        // Speak the letter
        if (window.AudioSynth) {
            window.AudioSynth.speakLetter(this.currentTarget.sound, this);
        }

        // Create letter boxes
        this.spawnLetterBoxes();

        this.showFeedback('Luister goed!', '#f4d03f', 1500);
    }

    spawnLetterBoxes() {
        // Clear existing letter boxes
        this.letterBoxes.clear(true, true);

        // Use pre-defined positions
        const positions = [...this.letterBoxPositions];
        Phaser.Utils.Array.Shuffle(positions);

        // Pick 3-4 positions
        const numBoxes = Math.min(4, positions.length);
        const correctIndex = Phaser.Math.Between(0, numBoxes - 1);

        for (let i = 0; i < numBoxes; i++) {
            const pos = positions[i];
            const isCorrect = (i === correctIndex);

            let letterChar;
            if (isCorrect) {
                letterChar = this.currentTarget.char;
            } else {
                // Pick a wrong letter
                let wrongLetter;
                do {
                    wrongLetter = this.levelLetters[Phaser.Math.Between(0, this.levelLetters.length - 1)];
                } while (wrongLetter.char === this.currentTarget.char);
                letterChar = wrongLetter.char;
            }

            this.createLetterBox(pos.x, pos.y, letterChar, isCorrect);
        }
    }

    createLetterBox(x, y, letter, isCorrect) {
        const boxWidth = 80;
        const boxHeight = 80;

        // Background box
        const bg = this.add.image(x, y, 'gui_box_orange');
        bg.setDisplaySize(boxWidth, boxHeight);
        bg.setDepth(10);

        // Letter text
        const letterText = this.add.text(x, y, letter, {
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

    onCollectLetter(player, letterObj) {
        if (!letterObj.active || letterObj.collected) return;

        // Sound cooldown
        const now = this.time.now;
        if (now - this.lastSoundTime < this.soundCooldown) return;
        this.lastSoundTime = now;

        letterObj.collected = true;

        if (letterObj.isCorrect) {
            // Correct!
            if (window.AudioSynth) window.AudioSynth.playCorrect();

            this.updateScore(100);
            this.showFeedback('Goed zo!', '#27ae60', 1000);
            this.createStarBurst(letterObj.x, letterObj.y);

            // Mark letter as completed
            if (!this.completedLettersInLevel.includes(this.currentTarget.char)) {
                this.completedLettersInLevel.push(this.currentTarget.char);
            }

            // Remove box
            if (letterObj.letterBg) letterObj.letterBg.destroy();
            if (letterObj.letterText) letterObj.letterText.destroy();
            letterObj.destroy();

            // Next target
            this.time.delayedCall(1500, () => {
                this.selectNewTarget();
            });
        } else {
            // Wrong!
            if (window.AudioSynth) window.AudioSynth.playWrong();

            this.showFeedback('Probeer opnieuw!', '#e74c3c', 1000);

            // Shake
            this.tweens.add({
                targets: [letterObj.letterBg, letterObj.letterText],
                x: letterObj.x + 10,
                duration: 50,
                yoyo: true,
                repeat: 3
            });

            // Speak correct letter again
            this.time.delayedCall(1000, () => {
                if (window.AudioSynth && this.currentTarget) {
                    window.AudioSynth.speakLetter(this.currentTarget.sound, this);
                }
            });

            // Reset collected flag
            this.time.delayedCall(this.soundCooldown, () => {
                if (letterObj.active) {
                    letterObj.collected = false;
                }
            });
        }
    }

    jump() {
        if (this.isGameOver || this.hurtFlag) return;

        if (this.player.body.blocked.down) {
            this.player.setVelocityY(this.jumpForce);
            this.player.play('player_jump_anim');
            if (window.AudioSynth) window.AudioSynth.playJump();
        }
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Handle hurt state
        if (this.hurtFlag) {
            return;
        }

        // Get input
        const cursorKeys = this.joystick.createCursorKeys();
        const jumpDown = this.cursors.up.isDown || this.spaceKey.isDown;
        const leftDown = cursorKeys.left.isDown || this.cursors.left.isDown;
        const rightDown = cursorKeys.right.isDown || this.cursors.right.isDown;

        // Jump
        if (jumpDown && this.player.body.blocked.down) {
            this.player.body.velocity.y = this.jumpForce;
            this.player.play('player_jump_anim');
        }

        // Horizontal movement
        if (leftDown) {
            this.player.body.velocity.x = -this.playerSpeed;
            this.player.play('player_run_anim', true);
            this.player.flipX = true;
        } else if (rightDown) {
            this.player.body.velocity.x = this.playerSpeed;
            this.player.play('player_run_anim', true);
            this.player.flipX = false;
        } else {
            this.player.body.velocity.x = 0;
            if (this.player.body.blocked.down) {
                this.player.play('player_idle_anim', true);
            }
        }

        // Falling animation
        if (this.player.body.velocity.y > 50) {
            this.player.play('player_fall_anim', true);
        }

        // Update enemies
        this.updateEnemies();

        // Check if player fell off
        if (this.player.y > this.layer.height * this.mapScale + 100) {
            this.loseLife();
            this.respawnPlayer();
        }
    }

    updateEnemies() {
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isDead || !enemy.active) return;

            // Patrol
            if (enemy.x <= enemy.patrolMinX) {
                enemy.direction = 1;
                enemy.setVelocityX(enemy.moveSpeed);
                enemy.setFlipX(true);
            } else if (enemy.x >= enemy.patrolMaxX) {
                enemy.direction = -1;
                enemy.setVelocityX(-enemy.moveSpeed);
                enemy.setFlipX(false);
            }
        });
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

    updateProgressDisplay() {
        const remaining = Math.min(5, this.levelLetters.length) - this.completedLettersInLevel.length;
        this.progressText.setText(`Niveau ${this.currentLevel} | Nog ${remaining} te gaan`);
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
            const star = this.add.image(x, y, 'gui_star').setScale(0.4).setScrollFactor(1);
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

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    respawnPlayer() {
        if (this.isGameOver) return;

        // Respawn at start position (same as initial spawn)
        const startX = 750 * this.mapScale;
        const startY = 280 * this.mapScale;
        this.player.setPosition(startX, startY);
        this.player.setVelocity(0, 0);

        // Flash
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
    }

    levelComplete() {
        this.isGameOver = true;
        this.stopBackgroundMusic();

        // Save progress
        const unlockedLevel = parseInt(localStorage.getItem('farisUnlockedLevel') || '1');
        if (this.currentLevel >= unlockedLevel && this.currentLevel < 3) {
            localStorage.setItem('farisUnlockedLevel', (this.currentLevel + 1).toString());
        }

        this.showLevelCompleteScreen();
    }

    showLevelCompleteScreen() {
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
        overlay.setScrollFactor(0).setDepth(150);

        this.add.text(640, 180, 'Niveau Compleet!', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#27ae60',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        this.add.text(640, 320, `Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        // Menu button
        const menuBtn = this.add.text(640, 480, 'Terug naar Menu', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
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

        this.add.text(640, 340, `Je score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

        const restartBtn = this.add.image(640, 480, 'gui_btn_replay')
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(151)
            .setScale(1.5);

        restartBtn.on('pointerdown', () => this.scene.restart());
    }
}
