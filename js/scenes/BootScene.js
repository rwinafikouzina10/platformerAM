/**
 * BootScene - Handles asset loading and displays loading progress
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Load external assets
        this.loadExternalAssets();

        // Generate UI assets that are better procedurally created
        this.createUIAssets();

        // Audio is handled by Web Audio API synthesis in createSoundSynthesizer()
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Title (Dutch)
        this.add.text(width / 2, height / 2 - 100, 'Faris & De Letter Oase', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '48px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Arabic subtitle
        this.add.text(width / 2, height / 2 - 40, 'فارس وواحة الحروف', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Dutch instruction
        this.add.text(width / 2, height / 2 - 5, 'Leer Arabische letters!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#98D8E8'
        }).setOrigin(0.5);

        // Loading bar background
        const barWidth = 400;
        const barHeight = 30;
        this.add.rectangle(width / 2, height / 2 + 50, barWidth + 4, barHeight + 4, 0xffffff)
            .setOrigin(0.5);

        // Loading bar fill
        this.loadingBar = this.add.rectangle(
            width / 2 - barWidth / 2,
            height / 2 + 50,
            0,
            barHeight,
            0xf4d03f
        ).setOrigin(0, 0.5);

        // Loading text (Dutch)
        this.loadingText = this.add.text(width / 2, height / 2 + 100, 'Laden...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Update loading bar
        this.load.on('progress', (value) => {
            this.loadingBar.width = 400 * value;
            this.loadingText.setText(`Laden... ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            this.loadingText.setText('Tik om te starten!');
        });
    }

    loadExternalAssets() {
        const basePath = 'assets/';

        // --- PLAYER SPRITES (Ninja Frog from Pixel Adventure) ---
        // Load as spritesheets for animation
        this.load.spritesheet('player_idle', basePath + 'images/player/Idle (32x32).png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('player_run', basePath + 'images/player/Run (32x32).png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('player_jump', basePath + 'images/player/Jump (32x32).png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('player_fall', basePath + 'images/player/Fall (32x32).png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('player_double_jump', basePath + 'images/player/Double Jump (32x32).png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('player_hit', basePath + 'images/player/Hit (32x32).png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // --- BACKGROUNDS ---
        this.load.image('bg_yellow', basePath + 'images/background/Yellow.png');
        this.load.image('bg_blue', basePath + 'images/background/Blue.png');
        this.load.image('bg_brown', basePath + 'images/background/Brown.png');

        // --- TERRAIN TILES (Kenney Sand) ---
        this.load.image('sand_left', basePath + 'images/terrain/sandLeft.png');
        this.load.image('sand_mid', basePath + 'images/terrain/sandMid.png');
        this.load.image('sand_right', basePath + 'images/terrain/sandRight.png');
        this.load.image('sand_center', basePath + 'images/terrain/sandCenter.png');
        this.load.image('sand_half', basePath + 'images/terrain/sandHalf.png');
        this.load.image('sand_half_left', basePath + 'images/terrain/sandHalfLeft.png');
        this.load.image('sand_half_mid', basePath + 'images/terrain/sandHalfMid.png');
        this.load.image('sand_half_right', basePath + 'images/terrain/sandHalfRight.png');
        this.load.image('sand_hill_left', basePath + 'images/terrain/sandHillLeft.png');
        this.load.image('sand_hill_right', basePath + 'images/terrain/sandHillRight.png');

        // --- COLLECTIBLES (Fruits from Pixel Adventure) ---
        this.load.spritesheet('apple', basePath + 'images/items/Apple.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('banana', basePath + 'images/items/Bananas.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('cherry', basePath + 'images/items/Cherries.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('orange', basePath + 'images/items/Orange.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('melon', basePath + 'images/items/Melon.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('kiwi', basePath + 'images/items/Kiwi.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('strawberry', basePath + 'images/items/Strawberry.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('collected', basePath + 'images/items/Collected.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Coin animation
        this.load.image('coin1', basePath + 'images/items/star coin rotate 1.png');
        this.load.image('coin2', basePath + 'images/items/star coin rotate 2.png');
        this.load.image('coin3', basePath + 'images/items/star coin rotate 3.png');
        this.load.image('coin4', basePath + 'images/items/star coin rotate 4.png');
        this.load.image('coin5', basePath + 'images/items/star coin rotate 5.png');
        this.load.image('coin6', basePath + 'images/items/star coin rotate 6.png');

        // --- OBSTACLES/ENEMIES ---
        this.load.image('spikes', basePath + 'images/enemies/spikes.png');
        this.load.image('slime', basePath + 'images/enemies/slime.png');
        this.load.image('slime_walk', basePath + 'images/enemies/slime_walk.png');

        // --- UI BUTTONS ---
        this.load.image('btn_play', basePath + 'images/ui/Play.png');
        this.load.image('btn_restart', basePath + 'images/ui/Restart.png');
        this.load.image('btn_back', basePath + 'images/ui/Back.png');
        this.load.image('btn_settings', basePath + 'images/ui/Settings.png');
        this.load.image('btn_next', basePath + 'images/ui/Next.png');
        this.load.image('btn_previous', basePath + 'images/ui/Previous.png');
        this.load.image('btn_close', basePath + 'images/ui/Close.png');
    }

    createUIAssets() {
        // Create UI assets that work better as procedural graphics
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // --- PLATFORM (Floating sand block) ---
        graphics.clear();
        graphics.fillStyle(0xdeb887);
        graphics.fillRoundedRect(0, 0, 150, 40, 8);
        graphics.fillStyle(0xf4d03f);
        graphics.fillRoundedRect(2, 2, 146, 36, 6);
        graphics.fillStyle(0xe6c229);
        graphics.fillRect(10, 15, 130, 3);
        graphics.generateTexture('platform', 150, 40);

        // --- CORRECT PLATFORM (Green tint) ---
        graphics.clear();
        graphics.fillStyle(0x27ae60);
        graphics.fillRoundedRect(0, 0, 150, 40, 8);
        graphics.fillStyle(0x2ecc71);
        graphics.fillRoundedRect(2, 2, 146, 36, 6);
        graphics.generateTexture('platform_correct', 150, 40);

        // --- WRONG PLATFORM (Red tint) ---
        graphics.clear();
        graphics.fillStyle(0xc0392b);
        graphics.fillRoundedRect(0, 0, 150, 40, 8);
        graphics.fillStyle(0xe74c3c);
        graphics.fillRoundedRect(2, 2, 146, 36, 6);
        graphics.generateTexture('platform_wrong', 150, 40);

        // --- Score panel ---
        graphics.clear();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRoundedRect(0, 0, 200, 50, 10);
        graphics.lineStyle(3, 0xf4d03f);
        graphics.strokeRoundedRect(0, 0, 200, 50, 10);
        graphics.generateTexture('score_panel', 200, 50);

        // --- Letter card ---
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRoundedRect(0, 0, 120, 120, 15);
        graphics.lineStyle(4, 0xf4d03f);
        graphics.strokeRoundedRect(2, 2, 116, 116, 13);
        graphics.generateTexture('letter_card', 120, 120);

        // --- Joystick base ---
        graphics.clear();
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillCircle(50, 50, 50);
        graphics.lineStyle(2, 0xffffff, 0.5);
        graphics.strokeCircle(50, 50, 48);
        graphics.generateTexture('joystick_base', 100, 100);

        // --- Joystick thumb ---
        graphics.clear();
        graphics.fillStyle(0xffffff, 0.6);
        graphics.fillCircle(25, 25, 25);
        graphics.generateTexture('joystick_thumb', 50, 50);

        // --- Jump button ---
        graphics.clear();
        graphics.fillStyle(0x3498db, 0.5);
        graphics.fillCircle(40, 40, 40);
        graphics.lineStyle(3, 0xffffff, 0.7);
        graphics.strokeCircle(40, 40, 38);
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillTriangle(40, 15, 20, 45, 60, 45);
        graphics.generateTexture('jump_button', 80, 80);

        // --- Star (for feedback) - draw using polygon points ---
        graphics.clear();
        graphics.fillStyle(0xf4d03f);
        // Draw a 5-pointed star manually
        const starPoints = this.getStarPoints(30, 30, 5, 28, 14);
        graphics.fillPoints(starPoints, true);
        graphics.fillStyle(0xf39c12);
        const innerStarPoints = this.getStarPoints(30, 30, 5, 20, 10);
        graphics.fillPoints(innerStarPoints, true);
        graphics.generateTexture('star', 60, 60);

        // --- Heart (lives) ---
        graphics.clear();
        graphics.fillStyle(0xe74c3c);
        graphics.fillCircle(12, 12, 10);
        graphics.fillCircle(28, 12, 10);
        graphics.fillTriangle(2, 15, 38, 15, 20, 38);
        graphics.generateTexture('heart', 40, 40);

        // --- Game Over Button ---
        graphics.clear();
        graphics.fillStyle(0xf4d03f);
        graphics.fillRoundedRect(0, 0, 200, 60, 10);
        graphics.fillStyle(0xe6c229);
        graphics.fillRoundedRect(5, 5, 190, 50, 8);
        graphics.generateTexture('button', 200, 60);

        // --- CACTUS (Obstacle) - procedural fallback ---
        graphics.clear();
        graphics.fillStyle(0x27ae60);
        graphics.fillRoundedRect(20, 20, 20, 60, 5);
        graphics.fillRoundedRect(5, 30, 15, 8, 3);
        graphics.fillRoundedRect(5, 20, 8, 18, 3);
        graphics.fillRoundedRect(40, 40, 15, 8, 3);
        graphics.fillRoundedRect(47, 30, 8, 18, 3);
        graphics.fillStyle(0x1e8449);
        for (let y = 25; y < 75; y += 8) {
            graphics.fillCircle(22, y, 2);
            graphics.fillCircle(38, y, 2);
        }
        graphics.generateTexture('cactus', 60, 80);

        // --- PALM TREE ---
        graphics.clear();
        graphics.fillStyle(0x8b4513);
        graphics.fillRect(35, 60, 20, 100);
        graphics.fillStyle(0x6b3610);
        for (let y = 65; y < 155; y += 12) {
            graphics.fillRect(35, y, 20, 3);
        }
        graphics.fillStyle(0x228b22);
        graphics.fillTriangle(45, 20, 0, 70, 45, 60);
        graphics.fillTriangle(45, 20, 90, 70, 45, 60);
        graphics.fillTriangle(45, 10, 20, 55, 70, 55);
        graphics.fillStyle(0x2e8b2e);
        graphics.fillTriangle(45, 25, 10, 65, 45, 55);
        graphics.fillTriangle(45, 25, 80, 65, 45, 55);
        graphics.generateTexture('palm_tree', 90, 160);

        // --- OASIS (Decorative) ---
        graphics.clear();
        graphics.fillStyle(0x3498db, 0.7);
        graphics.fillEllipse(60, 30, 100, 40);
        graphics.fillStyle(0x5dade2, 0.5);
        graphics.fillEllipse(50, 25, 60, 20);
        graphics.generateTexture('oasis', 120, 60);

        // --- Fallback ground tile ---
        graphics.clear();
        graphics.fillStyle(0xf4d03f);
        graphics.fillRect(0, 0, 70, 70);
        graphics.fillStyle(0xe6c229);
        for (let i = 0; i < 20; i++) {
            graphics.fillCircle(
                Phaser.Math.Between(0, 70),
                Phaser.Math.Between(0, 70),
                Phaser.Math.Between(1, 3)
            );
        }
        graphics.generateTexture('ground', 70, 70);

        graphics.destroy();
    }

    create() {
        // Create animations from spritesheets
        this.createAnimations();

        // Set up Web Audio context for sound synthesis
        this.createSoundSynthesizer();

        // Transition to menu on tap
        this.input.once('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }

    createAnimations() {
        // Player animations
        this.anims.create({
            key: 'player_idle_anim',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 10 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'player_run_anim',
            frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 11 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'player_jump_anim',
            frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 0 }),
            frameRate: 20,
            repeat: 0
        });

        this.anims.create({
            key: 'player_fall_anim',
            frames: this.anims.generateFrameNumbers('player_fall', { start: 0, end: 0 }),
            frameRate: 20,
            repeat: 0
        });

        this.anims.create({
            key: 'player_double_jump_anim',
            frames: this.anims.generateFrameNumbers('player_double_jump', { start: 0, end: 5 }),
            frameRate: 20,
            repeat: 0
        });

        this.anims.create({
            key: 'player_hit_anim',
            frames: this.anims.generateFrameNumbers('player_hit', { start: 0, end: 6 }),
            frameRate: 20,
            repeat: 0
        });

        // Fruit animations
        const fruits = ['apple', 'banana', 'cherry', 'orange', 'melon', 'kiwi', 'strawberry'];
        fruits.forEach(fruit => {
            this.anims.create({
                key: `${fruit}_anim`,
                frames: this.anims.generateFrameNumbers(fruit, { start: 0, end: 16 }),
                frameRate: 20,
                repeat: -1
            });
        });

        // Collected animation
        this.anims.create({
            key: 'collected_anim',
            frames: this.anims.generateFrameNumbers('collected', { start: 0, end: 5 }),
            frameRate: 20,
            repeat: 0
        });
    }

    createSoundSynthesizer() {
        // Store audio context globally for use in GameScene
        window.AudioSynth = {
            context: null,

            init() {
                if (!this.context) {
                    this.context = new (window.AudioContext || window.webkitAudioContext)();
                }
                return this.context;
            },

            playTone(frequency, duration, type = 'sine', volume = 0.3) {
                const ctx = this.init();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = type;

                gainNode.gain.setValueAtTime(volume, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + duration);
            },

            playJump() {
                this.playTone(400, 0.1, 'square', 0.2);
                setTimeout(() => this.playTone(600, 0.1, 'square', 0.2), 50);
            },

            playCorrect() {
                this.playTone(523, 0.15, 'sine', 0.3);
                setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 100);
                setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200);
            },

            playWrong() {
                this.playTone(200, 0.3, 'sawtooth', 0.2);
            },

            playCoin() {
                this.playTone(988, 0.1, 'sine', 0.2);
                setTimeout(() => this.playTone(1319, 0.15, 'sine', 0.2), 80);
            },

            speakLetter(letter, letterName) {
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(letter);
                    utterance.lang = 'ar-SA';
                    utterance.rate = 0.8;
                    utterance.pitch = 1.2;
                    speechSynthesis.speak(utterance);
                } else {
                    this.playTone(440, 0.2, 'sine', 0.3);
                }
            }
        };
    }

    // Helper function to generate star polygon points
    getStarPoints(cx, cy, points, outerRadius, innerRadius) {
        const result = [];
        const step = Math.PI / points;
        let angle = -Math.PI / 2; // Start from top

        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            result.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
            angle += step;
        }
        return result;
    }
}
