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

        // Level dimensions - endless runner style
        this.levelHeight = 720;
        this.chunkWidth = 800;  // Width of each procedurally generated chunk
        this.generatedUpToX = 0;  // How far we've generated terrain
        this.cleanedUpToX = 0;  // How far we've cleaned up old terrain
        this.initialChunks = 4;  // Generate 4 chunks at start (3200px)

        // Platform generation settings
        this.tileSize = 32;        // Base tile size (will be scaled 2x)
        this.tileScale = 2;        // Scale tiles 2x for better visibility
        this.scaledTileSize = this.tileSize * this.tileScale;  // 64px effective size
        this.groundY = this.levelHeight - 128;  // More room for larger ground tiles

        // Player physics settings - Mario-like feel
        this.playerSpeed = 380;  // Faster horizontal movement
        this.jumpForce = -580;   // Slightly lower jump
        this.gravity = 1000;     // Snappier gravity

        // Player state
        this.canJump = true;
        this.isOnGround = true;
        this.isCrouching = false;

        // Hitbox dimensions
        this.normalHitbox = { width: 40, height: 55, offsetX: 12, offsetY: 9 };
        this.crouchHitbox = { width: 40, height: 35, offsetX: 12, offsetY: 29 };

        // Sound debounce
        this.lastSoundTime = 0;
        this.soundCooldown = 1500;

        // Letter tracking - for respawning missed letters
        this.activeLetterBoxes = [];
        this.lastPlayerX = 0;
    }

    create() {
        // Set world bounds - very large for endless runner (will expand as needed)
        this.maxWorldWidth = 100000;  // 100k pixels max (effectively endless)
        this.physics.world.setBounds(0, 0, this.maxWorldWidth, this.levelHeight);

        // Create game layers in order
        this.createBackground();
        this.createLevel();
        this.createPlayer();

        // Set up tilemap collisions now that player exists
        this.setupTilemapCollisions();

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
        // Use Sunny Land backgrounds for a cohesive look
        // Sky background - tiled to cover the whole screen
        this.parallaxLayers = {
            back: [],
            middle: []
        };

        // Create multiple copies of backgrounds for seamless scrolling
        // back.png is 384x192, we need to tile it
        const backWidth = 384;
        const middleWidth = 176;
        const numBackCopies = 10;  // Enough for endless scrolling

        for (let i = 0; i < numBackCopies; i++) {
            // Back layer (sky/clouds) - slowest parallax
            const back = this.add.image(i * backWidth, this.levelHeight - 192, 'sunny_land_back');
            back.setOrigin(0, 0);
            back.setScrollFactor(0.2);
            back.setDepth(-90);
            this.parallaxLayers.back.push(back);

            // Middle layer (forest/trees) - medium parallax
            const middle = this.add.image(i * middleWidth, this.levelHeight - 192, 'sunny_land_middle');
            middle.setOrigin(0, 0);
            middle.setScrollFactor(0.5);
            middle.setDepth(-80);
            this.parallaxLayers.middle.push(middle);
        }
    }

    updateParallaxBackground() {
        // Wrap parallax layers as player moves for seamless infinite scrolling
        const camX = this.cameras.main.scrollX;

        // Helper to wrap a layer
        const wrapLayer = (layers, layerWidth, scrollFactor) => {
            const effectiveX = camX * scrollFactor;
            const totalWidth = layers.length * layerWidth;

            layers.forEach((layer, i) => {
                const baseX = i * layerWidth;
                let targetX = baseX;

                // Wrap layers to create infinite scroll
                while (targetX < effectiveX - layerWidth) {
                    targetX += totalWidth;
                }
                while (targetX > effectiveX + totalWidth) {
                    targetX -= totalWidth;
                }

                layer.x = targetX;
            });
        };

        wrapLayer(this.parallaxLayers.back, 384, 0.2);
        wrapLayer(this.parallaxLayers.middle, 176, 0.5);
    }

    createLevel() {
        // Create physics groups
        this.platforms = this.physics.add.staticGroup();
        this.letterBoxes = this.physics.add.group({ allowGravity: false });
        this.enemies = this.physics.add.group({ allowGravity: true });
        this.decorations = this.add.group();

        // Enemy types available
        this.enemyTypes = [
            { key: 'enemy_mushroom_run', hitKey: 'enemy_mushroom_hit', width: 32, height: 32, speed: 60, scale: 1.5 },
            { key: 'enemy_slime_run', hitKey: 'enemy_slime_hit', width: 44, height: 30, speed: 40, scale: 1.4 },
            { key: 'enemy_chicken_run', hitKey: 'enemy_chicken_hit', width: 32, height: 34, speed: 80, scale: 1.3 }
        ];

        // Generate the level procedurally
        this.generateLevel();
    }

    generateLevel() {
        // Use Sunny Land tilemap - hand-designed level that tiles horizontally
        // Map is 58x25 tiles at 16x16 = 928x400 pixels

        this.mapWidth = 928;   // Width of one tilemap section
        this.mapHeight = 400;  // Height of tilemap
        this.tileSize = 16;    // Sunny Land uses 16x16 tiles

        // Position the tilemap at bottom of screen
        // Our screen is 720px tall, map is 400px, so offset by 320px
        this.mapOffsetY = this.levelHeight - this.mapHeight;

        // Ground Y for player/enemy spawning (top of ground tiles)
        // Looking at the tilemap, ground is roughly at row 12-13 from top
        this.groundY = this.mapOffsetY + (13 * this.tileSize);

        // Track tilemap layers for cleanup
        this.tilemapLayers = [];
        this.platformPositions = [];
        this.letterSpawnPoints = [];

        // Generate initial tilemap sections
        this.generatedUpToX = 0;
        const initialSections = Math.ceil((1280 * 3) / this.mapWidth) + 1;  // Cover 3 screens

        for (let i = 0; i < initialSections; i++) {
            this.generateTilemapSection(i * this.mapWidth);
        }
        this.generatedUpToX = initialSections * this.mapWidth;
    }

    generateTilemapSection(startX) {
        // Create a tilemap instance at the given X position
        const map = this.make.tilemap({ key: 'sunny_land_map' });
        const tileset = map.addTilesetImage('tileset', 'sunny_land_tileset');

        // Create the tile layer
        const layer = map.createLayer('Tile Layer 1', tileset, startX, this.mapOffsetY);
        layer.setDepth(0);

        // Set collision on solid tiles (non-zero, non-decoration tiles)
        // In the Sunny Land tileset, tiles 77-81 and similar are solid ground
        // We'll use a broad range and let the tilemap data handle it
        layer.setCollisionByExclusion([-1, 0]);  // Collide with all non-empty tiles

        // Store for cleanup and collision setup
        const sectionData = {
            map: map,
            layer: layer,
            startX: startX,
            endX: startX + this.mapWidth,
            collider: null  // Will be set when player exists
        };
        this.tilemapLayers.push(sectionData);

        // Add platform positions for letter/enemy spawning
        this.findPlatformPositions(startX);

        // Place letter spawn points
        this.placeLettersInSection(startX);

        // Spawn enemies after first section
        const sectionIndex = Math.floor(startX / this.mapWidth);
        if (sectionIndex >= 1) {
            this.spawnEnemiesInSection(startX, sectionIndex);
        }

        return sectionData;
    }

    // Call this after player is created to set up collisions
    setupTilemapCollisions() {
        this.tilemapLayers.forEach(section => {
            if (!section.collider && this.player) {
                section.collider = this.physics.add.collider(this.player, section.layer);
            }
        });

        // Also add enemy collisions with tilemap
        this.tilemapLayers.forEach(section => {
            this.physics.add.collider(this.enemies, section.layer);
        });
    }

    findPlatformPositions(startX) {
        // Find good platform positions for spawning letters and enemies
        // These are spots where ground tiles exist and there's space above

        // Pre-defined platform positions based on the Sunny Land level design
        // These are relative to each 928px section
        const platformSpots = [
            { x: 100, y: this.groundY - 80, width: 150 },   // Left elevated area
            { x: 300, y: this.groundY - 120, width: 100 },  // Mid-left platform
            { x: 500, y: this.groundY - 60, width: 120 },   // Center area
            { x: 700, y: this.groundY - 100, width: 100 },  // Right platform
            { x: 850, y: this.groundY, width: 80 },         // Ground right
        ];

        platformSpots.forEach(spot => {
            this.platformPositions.push({
                x: startX + spot.x,
                y: spot.y,
                width: spot.width,
                hasLetter: false
            });
        });
    }

    placeLettersInSection(startX) {
        // Add letter spawn points for this section
        const sectionPlatforms = this.platformPositions.filter(
            p => p.x >= startX && p.x < startX + this.mapWidth && !p.hasLetter
        );

        // Take first 3 platforms for letters
        sectionPlatforms.slice(0, 3).forEach(platform => {
            this.letterSpawnPoints.push({
                x: platform.x,
                y: platform.y - 50,  // Above platform
                used: false,
                platformWidth: platform.width
            });
            platform.hasLetter = true;
        });
    }

    spawnEnemiesInSection(startX, sectionIndex) {
        // Spawn enemies on platforms in this section
        const sectionPlatforms = this.platformPositions.filter(
            p => p.x >= startX && p.x < startX + this.mapWidth
        );

        if (sectionPlatforms.length === 0) return;

        // Spawn 1-2 enemies per section
        const numEnemies = 1 + Math.floor(Math.random() * 2);

        for (let i = 0; i < Math.min(numEnemies, sectionPlatforms.length); i++) {
            const spawnIndex = Phaser.Math.Between(0, sectionPlatforms.length - 1);
            const spawnPoint = sectionPlatforms[spawnIndex];

            const x = spawnPoint.x;
            const y = spawnPoint.y - 30;

            const enemyType = this.enemyTypes[Phaser.Math.Between(0, this.enemyTypes.length - 1)];
            const enemy = this.createEnemy(x, y, enemyType);

            if (enemy) {
                const halfWidth = (spawnPoint.width || 100) / 2;
                enemy.patrolMinX = spawnPoint.x - halfWidth + 20;
                enemy.patrolMaxX = spawnPoint.x + halfWidth - 20;
            }

            // Remove used spawn point
            sectionPlatforms.splice(spawnIndex, 1);
        }
    }

    generateChunk(startX) {
        // Generate a single chunk of terrain with scaled tiles
        const scaledSize = this.scaledTileSize;  // 64px (32 * 2)
        const visualOffset = this.tileVisualOffset || 0;
        const chunkTiles = [];
        const style = this.tileStyle;  // Use consistent grass style

        // Calculate number of tiles in this chunk
        const numTiles = Math.ceil(this.chunkWidth / scaledSize);

        // Create ground for this chunk with PROPER edge tiles
        for (let i = 0; i < numTiles; i++) {
            const x = startX + (i * scaledSize);

            // Determine which tile frame to use based on position
            let topFrame = style.topMid;  // Default to middle
            let midFrame = style.midMid;

            // First tile of chunk uses left edge (unless continuing from previous)
            if (i === 0 && startX === 0) {
                topFrame = style.topLeft;
                midFrame = style.midLeft;
            }
            // Last tile of chunk (only if it's actually the edge)
            // For endless runner, we don't cap the right side

            // Top layer - ground surface (scaled 2x)
            const topTile = this.platforms.create(x, this.groundY + visualOffset, this.currentTileset, topFrame);
            topTile.setOrigin(0, 0);
            topTile.setScale(this.tileScale);
            topTile.refreshBody();
            chunkTiles.push(topTile);

            // Fill layer 1 (scaled 2x)
            const fillTile = this.platforms.create(x, this.groundY + scaledSize + visualOffset, this.currentTileset, midFrame);
            fillTile.setOrigin(0, 0);
            fillTile.setScale(this.tileScale);
            fillTile.refreshBody();
            chunkTiles.push(fillTile);

            // Fill layer 2 (scaled 2x) - extends below screen for visual completeness
            const fill2Tile = this.platforms.create(x, this.groundY + scaledSize * 2 + visualOffset, this.currentTileset, midFrame);
            fill2Tile.setOrigin(0, 0);
            fill2Tile.setScale(this.tileScale);
            fill2Tile.refreshBody();
            chunkTiles.push(fill2Tile);
        }

        // Generate platforms in this chunk
        const chunkIndex = Math.floor(startX / this.chunkWidth);
        const difficulty = Math.min(chunkIndex / 20, 0.8);
        const patternType = chunkIndex % 5;

        switch(patternType) {
            case 0:
                this.createRunningSection(startX, scaledSize, difficulty, chunkTiles);
                break;
            case 1:
                this.createStepsSection(startX, scaledSize, difficulty, chunkTiles);
                break;
            case 2:
                this.createGapSection(startX, scaledSize, difficulty, chunkTiles);
                break;
            case 3:
                this.createMixedSection(startX, scaledSize, difficulty, chunkTiles);
                break;
            case 4:
                this.createCrouchSection(startX, scaledSize, difficulty, chunkTiles);
                break;
        }

        // Place letter spawn points for this chunk
        this.placeLettersInChunk(startX);

        // Spawn enemies ON platforms (not at fixed Y)
        if (chunkIndex >= 2) {
            this.spawnEnemiesInChunk(startX, chunkIndex);
        }

        // Store chunk for later cleanup
        this.chunkTiles.push({
            startX: startX,
            endX: startX + this.chunkWidth,
            tiles: chunkTiles
        });
    }

    spawnEnemiesInChunk(startX, chunkIndex) {
        // Find platforms in this chunk to spawn enemies ON
        const chunkPlatforms = this.platformPositions.filter(
            p => p.x >= startX && p.x < startX + this.chunkWidth
        );

        // Also consider spawning on ground level
        const groundSpawnPoints = [
            { x: startX + 150, y: this.groundY, width: 200 },
            { x: startX + 450, y: this.groundY, width: 200 }
        ];

        const allSpawnPoints = [...chunkPlatforms, ...groundSpawnPoints];

        if (allSpawnPoints.length === 0) return;

        // Spawn 1-2 enemies per chunk on random platforms
        const difficulty = Math.min(chunkIndex / 15, 1);
        const numEnemies = 1 + Math.floor(Math.random() * (1 + difficulty * 0.5));

        for (let i = 0; i < Math.min(numEnemies, allSpawnPoints.length); i++) {
            // Pick random spawn point
            const spawnIndex = Phaser.Math.Between(0, allSpawnPoints.length - 1);
            const spawnPoint = allSpawnPoints[spawnIndex];

            // Spawn enemy ON the platform (y position above the platform surface)
            const x = spawnPoint.x;
            const y = spawnPoint.y - 40;  // Above the platform

            // Pick random enemy type
            const enemyType = this.enemyTypes[Phaser.Math.Between(0, this.enemyTypes.length - 1)];

            const enemy = this.createEnemy(x, y, enemyType);

            // Set patrol limits based on platform width
            if (enemy) {
                const halfWidth = (spawnPoint.width || 150) / 2;
                enemy.patrolMinX = spawnPoint.x - halfWidth + 30;
                enemy.patrolMaxX = spawnPoint.x + halfWidth - 30;
            }

            // Remove used spawn point to avoid stacking enemies
            allSpawnPoints.splice(spawnIndex, 1);
        }
    }

    createEnemy(x, y, enemyType) {
        const enemy = this.enemies.create(x, y, enemyType.key);
        enemy.setScale(enemyType.scale);
        enemy.setBounce(0);
        enemy.setCollideWorldBounds(false);

        // Adjust hitbox to be slightly smaller than sprite
        const hitboxWidth = enemyType.width * enemyType.scale * 0.7;
        const hitboxHeight = enemyType.height * enemyType.scale * 0.8;
        enemy.body.setSize(hitboxWidth, hitboxHeight);
        enemy.body.setOffset(
            (enemyType.width * enemyType.scale - hitboxWidth) / 2,
            enemyType.height * enemyType.scale - hitboxHeight
        );

        // Store enemy properties
        enemy.enemyType = enemyType;
        enemy.moveSpeed = enemyType.speed;
        enemy.direction = Math.random() > 0.5 ? 1 : -1;
        enemy.isDead = false;
        enemy.patrolMinX = x - 150;
        enemy.patrolMaxX = x + 150;

        // Start animation and movement
        enemy.play(enemyType.key);
        enemy.setVelocityX(enemy.direction * enemy.moveSpeed);
        enemy.setFlipX(enemy.direction > 0);

        return enemy;
    }

    placeLettersInChunk(startX) {
        // Add letter spawn points for platforms in this chunk
        const minSpacing = 300;
        const chunkPlatforms = this.platformPositions.filter(
            p => p.x >= startX && p.x < startX + this.chunkWidth && p.y < this.groundY - 60
        );

        let lastLetterX = startX - minSpacing;

        // Find last spawn point before this chunk
        const previousSpawns = this.letterSpawnPoints.filter(sp => sp.x < startX);
        if (previousSpawns.length > 0) {
            lastLetterX = previousSpawns[previousSpawns.length - 1].x;
        }

        chunkPlatforms.forEach(platform => {
            if (platform.x > lastLetterX + minSpacing && !platform.hasLetter) {
                this.letterSpawnPoints.push({
                    x: platform.x,
                    y: platform.y - 55,
                    used: false,
                    platformWidth: platform.width
                });
                platform.hasLetter = true;
                lastLetterX = platform.x;
            }
        });
    }

    cleanupOldChunks() {
        // Legacy function - no longer used with tilemap system
        // Kept for compatibility
    }

    cleanupOldSections() {
        // Remove tilemap sections that are far behind the player to save memory
        const playerX = this.player ? this.player.x : 0;
        const cleanupThreshold = 1500;  // Keep 1500px behind player

        this.tilemapLayers = this.tilemapLayers.filter(section => {
            if (section.endX < playerX - cleanupThreshold) {
                // Destroy the tilemap layer and collision
                if (section.collider) {
                    section.collider.destroy();
                }
                if (section.layer) {
                    section.layer.destroy();
                }
                if (section.map) {
                    section.map.destroy();
                }

                // Remove associated platform positions
                this.platformPositions = this.platformPositions.filter(
                    p => p.x < section.startX || p.x >= section.endX
                );

                // Remove associated letter spawn points
                this.letterSpawnPoints = this.letterSpawnPoints.filter(
                    sp => sp.x < section.startX || sp.x >= section.endX
                );

                return false;
            }
            return true;
        });
    }

    createRunningSection(startX, tileSize, difficulty, chunkTiles = []) {
        // Long horizontal platforms - player keeps running
        // Mario-like: safe area to run, optional higher platform for bonus

        // Main running platform at medium height
        const mainY = this.groundY - 100;
        const mainWidth = 12 - Math.floor(difficulty * 4); // Gets shorter with difficulty

        this.createTilesetPlatform(startX, mainY, mainWidth, 1, 'grass', chunkTiles);
        this.platformPositions.push({
            x: startX + (mainWidth * tileSize) / 2,
            y: mainY,
            width: mainWidth * tileSize,
            hasLetter: false
        });

        // Optional bonus platform above (reward for jumping)
        if (Math.random() > 0.3) {
            const bonusX = startX + 100;
            const bonusY = mainY - 90;
            this.createTilesetPlatform(bonusX, bonusY, 3, 1, 'orange', chunkTiles);
            this.platformPositions.push({
                x: bonusX + 48,
                y: bonusY,
                width: 3 * tileSize,
                hasLetter: false
            });
        }

        // Continuation platform after gap
        const gap = 120 + Math.floor(difficulty * 80);
        const contX = startX + mainWidth * tileSize + gap;
        const contWidth = 6;
        this.createTilesetPlatform(contX, mainY, contWidth, 1, 'grass', chunkTiles);
        this.platformPositions.push({
            x: contX + (contWidth * tileSize) / 2,
            y: mainY,
            width: contWidth * tileSize,
            hasLetter: false
        });
    }

    createStepsSection(startX, tileSize, difficulty, chunkTiles = []) {
        // Ascending/descending steps - classic Mario pattern
        const numSteps = 4;
        const stepSpacing = 140;
        const ascending = Math.random() > 0.5;

        for (let i = 0; i < numSteps; i++) {
            const x = startX + i * stepSpacing;
            const heightOffset = ascending ? i * 45 : (numSteps - 1 - i) * 45;
            const y = this.groundY - 90 - heightOffset;
            const width = 4 - Math.floor(difficulty * 1.5);

            this.createTilesetPlatform(x, y, Math.max(2, width), 1, 'stone', chunkTiles);
            this.platformPositions.push({
                x: x + (width * tileSize) / 2,
                y: y,
                width: width * tileSize,
                hasLetter: false
            });
        }
    }

    createGapSection(startX, tileSize, difficulty, chunkTiles = []) {
        // Platforms with gaps - requires jumping
        const platforms = [
            { xOff: 0, w: 5 },
            { xOff: 220, w: 4 },
            { xOff: 400, w: 5 },
            { xOff: 580, w: 3 }
        ];

        const baseY = this.groundY - 120;

        platforms.forEach((plat, i) => {
            // Slight height variation
            const yVariation = Math.sin(i * 1.5) * 40;
            const y = baseY + yVariation;
            const x = startX + plat.xOff;

            this.createTilesetPlatform(x, y, plat.w, 1, 'orange', chunkTiles);
            this.platformPositions.push({
                x: x + (plat.w * tileSize) / 2,
                y: y,
                width: plat.w * tileSize,
                hasLetter: false
            });
        });
    }

    createMixedSection(startX, tileSize, difficulty, chunkTiles = []) {
        // Mix of heights - more exploratory
        const platforms = [
            { x: 0, y: -80, w: 6, style: 'grass' },
            { x: 100, y: -160, w: 3, style: 'orange' },
            { x: 250, y: -100, w: 5, style: 'grass' },
            { x: 420, y: -180, w: 4, style: 'stone' },
            { x: 550, y: -120, w: 4, style: 'grass' }
        ];

        platforms.forEach(plat => {
            const x = startX + plat.x;
            const y = this.groundY + plat.y;

            this.createTilesetPlatform(x, y, plat.w, 1, plat.style, chunkTiles);
            this.platformPositions.push({
                x: x + (plat.w * tileSize) / 2,
                y: y,
                width: plat.w * tileSize,
                hasLetter: false
            });
        });
    }

    createCrouchSection(startX, tileSize, difficulty, chunkTiles = []) {
        // Low ceiling section - must crouch to pass through
        // Creates a tunnel-like area with platform above

        // Ground-level platform
        const groundPlatY = this.groundY - 60;
        this.createTilesetPlatform(startX, groundPlatY, 10, 1, 'grass', chunkTiles);
        this.platformPositions.push({
            x: startX + (10 * tileSize) / 2,
            y: groundPlatY,
            width: 10 * tileSize,
            hasLetter: false
        });

        // Low ceiling above - player must crouch to pass
        // Height is only ~50px above platform (normal player is ~55px, crouched is ~35px)
        const ceilingY = groundPlatY - 45;
        this.createTilesetPlatform(startX + 80, ceilingY, 6, 1, 'stone', chunkTiles);

        // Exit platform after tunnel
        const exitX = startX + 400;
        this.createTilesetPlatform(exitX, groundPlatY, 8, 1, 'grass', chunkTiles);
        this.platformPositions.push({
            x: exitX + (8 * tileSize) / 2,
            y: groundPlatY,
            width: 8 * tileSize,
            hasLetter: false
        });

        // Optional bonus platform above tunnel for players who jump over
        if (Math.random() > 0.5) {
            const bonusX = startX + 200;
            const bonusY = this.groundY - 180;
            this.createTilesetPlatform(bonusX, bonusY, 4, 1, 'orange', chunkTiles);
            this.platformPositions.push({
                x: bonusX + (4 * tileSize) / 2,
                y: bonusY,
                width: 4 * tileSize,
                hasLetter: false
            });
        }
    }

    createTilesetPlatform(x, y, widthInTiles, heightInTiles, style = 'grass', chunkTiles = []) {
        const scaledSize = this.scaledTileSize;  // 64px (32 * 2)
        const visualOffset = this.tileVisualOffset || 0;

        // Use consistent grass style for ALL platforms (ignore style parameter)
        const { topLeft, topMid, topRight, midLeft, midMid, midRight } = this.tileStyle;

        // Create top row (with visual offset to align grass with collision)
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

            const tile = this.platforms.create(x + (i * scaledSize), y + visualOffset, this.currentTileset, tileFrame);
            tile.setOrigin(0, 0);
            tile.setScale(this.tileScale);  // Apply 2x scale
            tile.refreshBody();
            chunkTiles.push(tile);
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

                const tile = this.platforms.create(x + (i * scaledSize), y + (row * scaledSize) + visualOffset, this.currentTileset, tileFrame);
                tile.setOrigin(0, 0);
                tile.setScale(this.tileScale);  // Apply 2x scale
                tile.refreshBody();
                chunkTiles.push(tile);
            }
        }
    }


    spawnLettersAhead() {
        // Spawn individual letters on platforms ahead of player
        const playerX = this.player ? this.player.x : 0;
        const letters = window.GameData.letters;

        // Find unused spawn points ahead
        const aheadPoints = this.letterSpawnPoints.filter(
            sp => sp.x > playerX + 100 && !sp.used
        );

        // Take next few spawn points
        const pointsToUse = aheadPoints.slice(0, 5);

        // Randomly decide which index will have the correct letter
        // This ensures the correct letter isn't always first
        const correctIndex = Phaser.Math.Between(0, Math.max(0, pointsToUse.length - 1));

        pointsToUse.forEach((spawnPoint, index) => {
            spawnPoint.used = true;

            // This index was randomly chosen to have the correct letter
            const shouldBeCorrect = (index === correctIndex);

            let letterChar;
            let isCorrect = false;

            if (this.currentTarget) {
                if (shouldBeCorrect) {
                    // Correct letter
                    const targetForms = this.currentTarget.forms || [this.currentTarget.char];
                    letterChar = this.currentLevel === 1 ? targetForms[0] :
                        targetForms[Phaser.Math.Between(0, targetForms.length - 1)];
                    isCorrect = true;
                } else {
                    // Wrong letter
                    let wrongLetterData;
                    let attempts = 0;
                    do {
                        wrongLetterData = letters[Phaser.Math.Between(0, letters.length - 1)];
                        attempts++;
                    } while (wrongLetterData.char === this.currentTarget.char && attempts < 20);

                    const wrongForms = wrongLetterData.forms || [wrongLetterData.char];
                    letterChar = this.currentLevel === 1 ? wrongForms[0] :
                        wrongForms[Phaser.Math.Between(0, wrongForms.length - 1)];
                    isCorrect = false;
                }
            }

            const letterBox = this.createLetterBox(
                spawnPoint.x,
                spawnPoint.y,
                letterChar || '?',
                isCorrect,
                !this.currentTarget
            );

            if (letterBox) {
                letterBox.spawnPoint = spawnPoint;
                this.activeLetterBoxes.push(letterBox);
            }
        });
    }

    spawnNextLetterSet() {
        // Wrapper for compatibility - just calls spawnLettersAhead
        this.spawnLettersAhead();
    }

    clearPassedLetters() {
        if (!this.player) return;

        const playerX = this.player.x;
        const clearedSpawnPoints = new Set();

        // Check for letters that player has passed (more than 400px behind)
        this.activeLetterBoxes = this.activeLetterBoxes.filter(box => {
            if (!box.active) return false;

            if (box.x < playerX - 400 && !box.collected) {
                // Track which spawn points have been cleared
                if (box.spawnPoint && !clearedSpawnPoints.has(box.spawnPoint)) {
                    clearedSpawnPoints.add(box.spawnPoint);
                    box.spawnPoint.used = false;
                }

                // Destroy the old box
                if (box.letterBg) box.letterBg.destroy();
                if (box.letterText) box.letterText.destroy();
                box.destroy();

                return false;
            }
            return true;
        });

        // Spawn new letter set for each cleared group (only once per group)
        if (clearedSpawnPoints.size > 0) {
            this.time.delayedCall(100, () => {
                this.spawnNextLetterSet();
            });
        }
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

        // Note: Tilemap collisions are set up in setupTilemapCollisions()
        // Only set up letter box and enemy overlaps here
        this.physics.add.overlap(this.player, this.letterBoxes, this.onCollectLetter, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.onEnemyCollision, null, this);
    }

    onEnemyCollision(player, enemy) {
        if (enemy.isDead) return;

        // Check if player is stomping (falling onto enemy from above)
        const playerBottom = player.body.bottom;
        const enemyTop = enemy.body.top;
        const playerVelY = player.body.velocity.y;

        // Mario-style stomp: player must be falling and hit enemy from above
        if (playerVelY > 0 && playerBottom <= enemyTop + 15) {
            // Stomp the enemy!
            this.stompEnemy(enemy);

            // Bounce player up
            player.setVelocityY(-350);
            if (window.AudioSynth) window.AudioSynth.playCoin();
        } else {
            // Player got hit by enemy
            this.playerHitByEnemy();
        }
    }

    stompEnemy(enemy) {
        enemy.isDead = true;
        enemy.body.enable = false;

        // Play hit animation if available
        if (enemy.enemyType.hitKey) {
            // Create a hit effect sprite
            const hitSprite = this.add.sprite(enemy.x, enemy.y, enemy.enemyType.hitKey);
            hitSprite.setScale(enemy.enemyType.scale);

            // Squash and fade out effect
            this.tweens.add({
                targets: hitSprite,
                scaleY: 0.3,
                alpha: 0,
                y: enemy.y + 20,
                duration: 300,
                ease: 'Power2',
                onComplete: () => hitSprite.destroy()
            });
        }

        // Award points
        this.updateScore(50);

        // Remove enemy sprite
        this.tweens.add({
            targets: enemy,
            scaleY: 0.2,
            alpha: 0,
            duration: 200,
            onComplete: () => enemy.destroy()
        });
    }

    playerHitByEnemy() {
        // Invincibility check
        if (this.player.invincible) return;

        // Make player invincible briefly
        this.player.invincible = true;

        // Knockback
        const knockbackDir = this.player.body.velocity.x > 0 ? -1 : 1;
        this.player.setVelocity(knockbackDir * 200, -300);

        // Flash effect
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.player.alpha = 1;
                this.player.invincible = false;
            }
        });

        // Lose a life
        this.loseLife();

        if (window.AudioSynth) window.AudioSynth.playWrong();
    }

    setupCamera() {
        // Set camera bounds to very large world for endless runner
        this.cameras.main.setBounds(0, 0, this.maxWorldWidth, this.levelHeight);

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
        this.targetDisplay.setText('Luister en zoek!');

        // Speak the letter
        if (window.AudioSynth) {
            window.AudioSynth.speakLetter(this.currentTarget.sound, this);
        }

        // Clear old letters and spawn fresh set with new target
        this.clearAllLetterBoxes();
        this.spawnNextLetterSet();

        this.showFeedback('Luister goed!', '#f4d03f', 1500);
    }

    clearAllLetterBoxes() {
        // Clear all active letter boxes
        this.activeLetterBoxes.forEach(box => {
            if (box.spawnPoint) {
                box.spawnPoint.used = false;
            }
            if (box.letterBg) box.letterBg.destroy();
            if (box.letterText) box.letterText.destroy();
            if (box.active) box.destroy();
        });
        this.activeLetterBoxes = [];
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

        // Update parallax background for infinite scrolling
        this.updateParallaxBackground();

        // Update enemy AI
        this.updateEnemies();

        // Generate new tilemap sections ahead of player
        const lookAhead = 1200;  // Generate when player is within 1200px of edge
        if (this.player.x + lookAhead > this.generatedUpToX) {
            const newSection = this.generateTilemapSection(this.generatedUpToX);
            // Set up collision with player for the new section
            if (this.player && newSection) {
                newSection.collider = this.physics.add.collider(this.player, newSection.layer);
                this.physics.add.collider(this.enemies, newSection.layer);
            }
            this.generatedUpToX += this.mapWidth;
        }

        // Cleanup old tilemap sections behind player
        this.cleanupOldSections();

        // Cleanup enemies far behind player
        this.cleanupEnemies();

        // Check if player fell off the world
        if (this.player.y > this.levelHeight) {
            this.loseLife();
            this.respawnPlayer();
        }

        // Mario-like: Check for passed letters and respawn ahead
        if (this.player.x > this.lastPlayerX + 100) {
            this.lastPlayerX = this.player.x;
            this.clearPassedLetters();

            // Ensure there's always a letter ahead
            const hasLetterAhead = this.activeLetterBoxes.some(
                box => box.active && box.x > this.player.x + 200
            );
            if (!hasLetterAhead) {
                this.spawnNextLetterSet();
            }
        }

        // Level completion is handled by collecting all 28 letters
        // (no longer based on reaching end of fixed level)
    }

    updateEnemies() {
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isDead || !enemy.active) return;

            // Patrol AI: reverse direction at patrol limits or edges
            if (enemy.x <= enemy.patrolMinX) {
                enemy.direction = 1;
                enemy.setVelocityX(enemy.moveSpeed);
                enemy.setFlipX(true);
            } else if (enemy.x >= enemy.patrolMaxX) {
                enemy.direction = -1;
                enemy.setVelocityX(-enemy.moveSpeed);
                enemy.setFlipX(false);
            }

            // Fall off edge detection - reverse if about to fall
            // With tilemap, we use patrol bounds instead of checking ground tiles
            if (enemy.body.touching.down || enemy.body.blocked.down) {
                // Use patrol bounds to keep enemy in area
                // Already handled above with patrolMinX/patrolMaxX
            }

            // Destroy if fallen off world
            if (enemy.y > this.levelHeight) {
                enemy.destroy();
            }
        });
    }

    cleanupEnemies() {
        // Remove enemies far behind player
        const cleanupX = this.player.x - 800;
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.x < cleanupX) {
                enemy.destroy();
            }
        });
    }

    handlePlayerMovement() {
        const cursorKeys = this.joystick.createCursorKeys();
        const left = cursorKeys.left.isDown || this.cursors.left.isDown;
        const right = cursorKeys.right.isDown || this.cursors.right.isDown;
        const jumpKey = this.cursors.up.isDown || this.spaceKey.isDown;
        const crouchKey = cursorKeys.down.isDown || this.cursors.down.isDown;

        // Handle crouching (only on ground)
        if (crouchKey && this.isOnGround) {
            if (!this.isCrouching) {
                // Start crouching
                this.isCrouching = true;
                this.player.play('player_crouch_anim', true);
                // Shrink hitbox for crouching
                this.player.body.setSize(this.crouchHitbox.width, this.crouchHitbox.height);
                this.player.body.setOffset(this.crouchHitbox.offsetX, this.crouchHitbox.offsetY);
            } else {
                // Hold crouch pose
                this.player.play('player_crouch_idle_anim', true);
            }
            // Slow movement while crouching
            if (left) {
                this.player.setVelocityX(-this.playerSpeed * 0.4);
                this.player.setFlipX(true);
            } else if (right) {
                this.player.setVelocityX(this.playerSpeed * 0.4);
                this.player.setFlipX(false);
            } else {
                this.player.setVelocityX(0);
            }
        } else {
            // Stand up from crouch
            if (this.isCrouching) {
                this.isCrouching = false;
                // Restore normal hitbox
                this.player.body.setSize(this.normalHitbox.width, this.normalHitbox.height);
                this.player.body.setOffset(this.normalHitbox.offsetX, this.normalHitbox.offsetY);
            }

            // Normal horizontal movement
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
        }

        // Falling animation
        if (!this.isOnGround && this.player.body.velocity.y > 0) {
            this.player.play('player_fall_anim', true);
        }

        // Jump from keyboard (can't jump while crouching)
        if (jumpKey && this.canJump && !this.isCrouching) {
            this.jump();
        }

        // Check if player is on ground (works with tilemap collisions)
        const wasOnGround = this.isOnGround;
        this.isOnGround = this.player.body.blocked.down || this.player.body.touching.down;

        // Reset jump ability when landing
        if (this.isOnGround && !wasOnGround) {
            this.canJump = true;
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

        // Respawn slightly behind current position (on safe ground)
        // Ensure we don't respawn before the cleaned-up area
        const respawnX = Math.max(this.cleanedUpToX + 200, this.player.x - 300);
        this.player.setPosition(respawnX, this.groundY - 100);
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
