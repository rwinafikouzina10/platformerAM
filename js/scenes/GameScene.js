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
        // Sky (static)
        this.add.image(640, 360, 'sky');

        // Parallax background layers
        this.dunesBack = this.add.tileSprite(640, 360, 1280, 720, 'dunes_back');
        this.dunesFront = this.add.tileSprite(640, 360, 1280, 720, 'dunes_front');

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

        // Create ground tiles
        for (let x = 0; x < 1400; x += 64) {
            const tile = this.ground.create(x, this.groundY + 32, 'ground');
            tile.setOrigin(0.5, 0.5);
            tile.refreshBody();
        }
    }

    createPlayer() {
        // Create player sprite
        this.player = this.physics.add.sprite(200, this.groundY - 50, 'player');
        this.player.setScale(1.2);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);

        // Adjust hitbox
        this.player.body.setSize(40, 55);
        this.player.body.setOffset(12, 9);

        // Add player to ground collision
        this.physics.add.collider(this.player, this.ground, () => {
            if (!this.isOnGround) {
                this.isOnGround = true;
                this.canJump = true;
                this.player.setTexture('player');
            }
        });

        // Player dust effect
        this.playerDust = this.add.particles(0, 0, 'coin', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 300,
            frequency: 100,
            quantity: 1,
            tint: 0xf4d03f
        });
        this.playerDust.startFollow(this.player, 0, 30);
    }

    createUI() {
        // Score panel (top left)
        this.add.image(110, 35, 'score_panel');

        // Coin icon
        this.add.image(30, 35, 'coin').setScale(0.8);

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

        // Target letter card (top center)
        this.letterCard = this.add.image(640, 80, 'letter_card').setScale(0.8);
        this.letterCard.setVisible(false);

        this.targetText = this.add.text(640, 75, '', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '64px',
            color: '#2c1810',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // "Find:" label
        this.findLabel = this.add.text(640, 25, 'Find:', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.findLabel.setVisible(false);

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

        // High score
        this.add.text(1270, 680, `Best: ${window.GameData.highScore}`, {
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
            dir: 'left&right',  // Only horizontal movement
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

        // Letter platforms group
        this.letterPlatforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Collisions
        this.physics.add.collider(this.player, this.platforms, this.onPlatformLand, null, this);
        this.physics.add.collider(this.player, this.letterPlatforms, this.onLetterPlatform, null, this);
        this.physics.add.overlap(this.player, this.obstacles, this.onObstacleHit, null, this);
        this.physics.add.overlap(this.player, this.collectibles, this.onCollectItem, null, this);
    }

    startGame() {
        this.isGameOver = false;
        this.score = 0;
        this.lives = 3;
        this.gameSpeed = 200;
        this.updateScore(0);

        // Start spawning after delay
        this.time.delayedCall(1000, () => {
            this.selectNewTarget();
        });

        // Spawn initial coins
        this.time.delayedCall(500, () => {
            this.spawnCoin(800, this.groundY - 100);
            this.spawnCoin(900, this.groundY - 100);
            this.spawnCoin(1000, this.groundY - 100);
        });
    }

    selectNewTarget() {
        if (this.isGameOver) return;

        // Pick a random letter
        const letters = window.GameData.letters;
        const randomIndex = Phaser.Math.Between(0, Math.min(letters.length - 1, 5 + Math.floor(this.score / 100)));
        this.currentTarget = letters[randomIndex];
        this.targetLetter = this.currentTarget.char;

        // Update UI
        this.letterCard.setVisible(true);
        this.findLabel.setVisible(true);
        this.targetText.setText(this.targetLetter);

        // Animate letter card
        this.tweens.add({
            targets: this.letterCard,
            scale: { from: 0.5, to: 0.8 },
            duration: 300,
            ease: 'Back.out'
        });

        // Speak the letter
        if (window.AudioSynth) {
            window.AudioSynth.speakLetter(this.targetLetter, this.currentTarget.name);
        }

        // Show feedback
        this.showFeedback(`Find: ${this.targetLetter}`, '#f4d03f', 1500);

        // Spawn letter platforms after short delay
        this.time.delayedCall(500, () => {
            this.spawnLetterPlatforms();
        });
    }

    spawnLetterPlatforms() {
        if (this.isGameOver || !this.currentTarget) return;

        const letters = window.GameData.letters;
        const baseX = 1400;
        const platformY = this.groundY - Phaser.Math.Between(100, 180);

        // Correct platform
        const correctX = baseX + Phaser.Math.Between(0, 150);
        this.createLetterPlatform(correctX, platformY, this.targetLetter, true);

        // Wrong platform (random different letter)
        let wrongLetter;
        do {
            const wrongIndex = Phaser.Math.Between(0, Math.min(letters.length - 1, 7));
            wrongLetter = letters[wrongIndex].char;
        } while (wrongLetter === this.targetLetter);

        const wrongX = correctX + Phaser.Math.Between(200, 300);
        this.createLetterPlatform(wrongX, platformY + Phaser.Math.Between(-30, 30), wrongLetter, false);
    }

    createLetterPlatform(x, y, letter, isCorrect) {
        const platform = this.letterPlatforms.create(x, y, 'platform');
        platform.setScale(1.2);
        platform.body.setSize(150, 30);
        platform.body.setOffset(0, 5);
        platform.isCorrect = isCorrect;
        platform.letter = letter;
        platform.body.velocity.x = -this.gameSpeed;

        // Add letter text
        const letterText = this.add.text(x, y - 10, letter, {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '48px',
            color: '#2c1810',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        platform.letterText = letterText;

        // Tint based on correctness (hidden until touched)
        platform.setTint(0xffffff);

        return platform;
    }

    spawnObstacle() {
        if (this.isGameOver) return;

        const x = 1400;
        const y = this.groundY - 40;

        const obstacle = this.obstacles.create(x, y, 'cactus');
        obstacle.setOrigin(0.5, 1);
        obstacle.body.setSize(30, 60);
        obstacle.body.setOffset(15, 20);
        obstacle.body.velocity.x = -this.gameSpeed;

        return obstacle;
    }

    spawnCoin(x, y) {
        if (this.isGameOver) return;

        const coin = this.collectibles.create(x, y, 'coin');
        coin.body.velocity.x = -this.gameSpeed;
        coin.itemType = 'coin';
        coin.value = 10;

        // Bobbing animation
        this.tweens.add({
            targets: coin,
            y: y - 10,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return coin;
    }

    spawnBook(x, y) {
        if (this.isGameOver) return;

        const book = this.collectibles.create(x, y, 'book');
        book.body.velocity.x = -this.gameSpeed;
        book.itemType = 'book';
        book.value = 25;

        return book;
    }

    jump() {
        if (this.isGameOver || !this.canJump) return;

        if (this.player.body.touching.down || this.isOnGround) {
            this.player.setVelocityY(-450);
            this.player.setTexture('player_jump');
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
            player.setTexture('player');
        }
    }

    onLetterPlatform(player, platform) {
        if (!platform.active) return;

        // Only trigger when landing on top
        if (player.body.touching.down && platform.body.touching.up) {
            this.isOnGround = true;
            this.canJump = true;
            player.setTexture('player');

            // Check if correct letter
            if (platform.isCorrect) {
                this.onCorrectLetter(platform);
            } else {
                this.onWrongLetter(platform);
            }

            // Mark as used
            platform.active = false;
        }
    }

    onCorrectLetter(platform) {
        // Visual feedback
        platform.setTexture('platform_correct');

        // Sound
        if (window.AudioSynth) {
            window.AudioSynth.playCorrect();
        }

        // Score
        this.updateScore(50);
        this.consecutiveCorrect++;

        // Show feedback
        this.showFeedback('Correct! ممتاز', '#27ae60', 1000);

        // Star burst effect
        this.createStarBurst(platform.x, platform.y - 50);

        // Bonus for consecutive correct
        if (this.consecutiveCorrect >= 3) {
            this.updateScore(30);
            this.showFeedback('Combo Bonus! +30', '#f4d03f', 800);
        }

        // Select new target after delay
        this.time.delayedCall(1500, () => {
            this.selectNewTarget();
        });

        // Speed up slightly
        this.gameSpeed = Math.min(this.gameSpeed + 5, 400);
    }

    onWrongLetter(platform) {
        // Visual feedback
        platform.setTexture('platform_wrong');

        // Sound
        if (window.AudioSynth) {
            window.AudioSynth.playWrong();
        }

        // Reset combo
        this.consecutiveCorrect = 0;

        // Show feedback
        this.showFeedback('Try Again! حاول مرة أخرى', '#e74c3c', 1000);

        // Slow down temporarily
        const originalSpeed = this.gameSpeed;
        this.gameSpeed = Math.max(this.gameSpeed - 50, 100);

        this.time.delayedCall(2000, () => {
            this.gameSpeed = originalSpeed;
        });

        // Speak correct answer
        this.time.delayedCall(1000, () => {
            if (window.AudioSynth && this.currentTarget) {
                window.AudioSynth.speakLetter(this.targetLetter, this.currentTarget.name);
            }
        });
    }

    onObstacleHit(player, obstacle) {
        if (!obstacle.active) return;
        obstacle.active = false;

        // Lose a life
        this.loseLife();

        // Knockback
        player.setVelocityX(-150);
        player.setVelocityY(-200);

        // Flash player
        this.tweens.add({
            targets: player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5
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

        // Collection effect
        this.tweens.add({
            targets: item,
            y: item.y - 50,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => item.destroy()
        });
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

        // Game Over text
        const gameOverText = this.add.text(640, 200, 'Game Over', {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Arabic text
        this.add.text(640, 280, 'انتهت اللعبة', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(100);

        // Final score
        this.add.text(640, 360, `Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // High score
        this.add.text(640, 420, `Best: ${window.GameData.highScore}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(100);

        // Restart button
        const restartBtn = this.add.image(640, 520, 'button').setInteractive().setDepth(100);
        this.add.text(640, 520, 'Play Again', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#2c1810',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);

        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });

        restartBtn.on('pointerover', () => {
            restartBtn.setScale(1.1);
        });

        restartBtn.on('pointerout', () => {
            restartBtn.setScale(1);
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Parallax scrolling
        this.dunesBack.tilePositionX += 0.5;
        this.dunesFront.tilePositionX += 1;

        // Handle player movement
        this.handlePlayerMovement();

        // Update object velocities based on game speed
        this.updateObjectVelocities();

        // Spawn management
        this.handleSpawning(time);

        // Cleanup off-screen objects
        this.cleanupObjects();

        // Update decorations
        this.updateDecorations();

        // Update letter platform text positions
        this.letterPlatforms.getChildren().forEach(platform => {
            if (platform.letterText) {
                platform.letterText.x = platform.x;
                platform.letterText.y = platform.y - 10;
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
        } else if (right) {
            this.player.setVelocityX(250);
        } else {
            // Slight forward drift in endless runner
            this.player.setVelocityX(50);
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
        this.letterPlatforms.getChildren().forEach(lp => lp.body.velocity.x = speed);
    }

    handleSpawning(time) {
        // Spawn obstacles
        if (time - this.lastObstacleTime > this.obstacleInterval) {
            if (Phaser.Math.Between(0, 100) < 40) {
                this.spawnObstacle();
            }
            this.lastObstacleTime = time;
            // Decrease interval as game progresses
            this.obstacleInterval = Math.max(2000, this.obstacleInterval - 10);
        }

        // Spawn coins
        if (Phaser.Math.Between(0, 100) < 2) {
            const coinY = this.groundY - Phaser.Math.Between(80, 200);
            this.spawnCoin(1400, coinY);
        }

        // Occasional book spawn
        if (Phaser.Math.Between(0, 100) < 0.5) {
            const bookY = this.groundY - Phaser.Math.Between(100, 150);
            this.spawnBook(1400, bookY);
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
                    obj.destroy();
                }
            });
        };

        cleanup(this.platforms);
        cleanup(this.obstacles);
        cleanup(this.collectibles);
        cleanup(this.letterPlatforms);
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
