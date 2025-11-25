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

        // Generate placeholder assets programmatically (no external files needed)
        this.createPlaceholderAssets();

        // Load audio assets (placeholder/generated)
        this.loadAudioAssets();
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Title
        this.add.text(width / 2, height / 2 - 100, 'Faris & The Letter Oasis', {
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

        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2 + 100, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Update loading bar
        this.load.on('progress', (value) => {
            this.loadingBar.width = 400 * value;
            this.loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            this.loadingText.setText('Tap to Start!');
        });
    }

    createPlaceholderAssets() {
        // Create all game graphics programmatically
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // --- PLAYER SPRITE (Simple character) ---
        graphics.clear();
        // Body (desert robe color)
        graphics.fillStyle(0xd4a574);
        graphics.fillRoundedRect(16, 20, 32, 40, 5);
        // Head
        graphics.fillStyle(0xf5deb3);
        graphics.fillCircle(32, 15, 12);
        // Eyes
        graphics.fillStyle(0x2c1810);
        graphics.fillCircle(28, 13, 2);
        graphics.fillCircle(36, 13, 2);
        // Smile
        graphics.lineStyle(2, 0x2c1810);
        graphics.beginPath();
        graphics.arc(32, 17, 5, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        // Headscarf/Keffiyeh
        graphics.fillStyle(0xffffff);
        graphics.fillTriangle(20, 10, 32, 0, 44, 10);
        graphics.generateTexture('player', 64, 64);

        // --- PLAYER JUMP SPRITE ---
        graphics.clear();
        graphics.fillStyle(0xd4a574);
        graphics.fillRoundedRect(16, 15, 32, 40, 5);
        graphics.fillStyle(0xf5deb3);
        graphics.fillCircle(32, 10, 12);
        graphics.fillStyle(0x2c1810);
        graphics.fillCircle(28, 8, 2);
        graphics.fillCircle(36, 8, 2);
        graphics.fillStyle(0xffffff);
        graphics.fillTriangle(20, 5, 32, -5, 44, 5);
        // Arms up
        graphics.fillStyle(0xf5deb3);
        graphics.fillRect(10, 20, 8, 4);
        graphics.fillRect(46, 20, 8, 4);
        graphics.generateTexture('player_jump', 64, 64);

        // --- GROUND TILE (Sand) ---
        graphics.clear();
        graphics.fillStyle(0xf4d03f);
        graphics.fillRect(0, 0, 64, 64);
        // Sand texture dots
        graphics.fillStyle(0xe6c229);
        for (let i = 0; i < 20; i++) {
            graphics.fillCircle(
                Phaser.Math.Between(0, 64),
                Phaser.Math.Between(0, 64),
                Phaser.Math.Between(1, 3)
            );
        }
        graphics.generateTexture('ground', 64, 64);

        // --- PLATFORM (Floating sand block) ---
        graphics.clear();
        graphics.fillStyle(0xdeb887);
        graphics.fillRoundedRect(0, 0, 150, 40, 8);
        graphics.fillStyle(0xf4d03f);
        graphics.fillRoundedRect(2, 2, 146, 36, 6);
        // Platform decoration
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

        // --- CACTUS (Obstacle) ---
        graphics.clear();
        graphics.fillStyle(0x27ae60);
        // Main stem
        graphics.fillRoundedRect(20, 20, 20, 60, 5);
        // Left arm
        graphics.fillRoundedRect(5, 30, 15, 8, 3);
        graphics.fillRoundedRect(5, 20, 8, 18, 3);
        // Right arm
        graphics.fillRoundedRect(40, 40, 15, 8, 3);
        graphics.fillRoundedRect(47, 30, 8, 18, 3);
        // Spikes (dots)
        graphics.fillStyle(0x1e8449);
        for (let y = 25; y < 75; y += 8) {
            graphics.fillCircle(22, y, 2);
            graphics.fillCircle(38, y, 2);
        }
        graphics.generateTexture('cactus', 60, 80);

        // --- COIN (Golden) ---
        graphics.clear();
        graphics.fillStyle(0xf39c12);
        graphics.fillCircle(16, 16, 14);
        graphics.fillStyle(0xf4d03f);
        graphics.fillCircle(16, 16, 10);
        graphics.fillStyle(0xf39c12);
        graphics.fillCircle(16, 16, 6);
        // Star shape in center
        graphics.fillStyle(0xf4d03f);
        graphics.fillStar(16, 16, 5, 4, 2);
        graphics.generateTexture('coin', 32, 32);

        // --- INK DROP (For learning) ---
        graphics.clear();
        graphics.fillStyle(0x3498db);
        graphics.fillCircle(16, 20, 12);
        graphics.fillTriangle(16, 4, 8, 16, 24, 16);
        graphics.fillStyle(0x5dade2);
        graphics.fillCircle(12, 18, 4);
        graphics.generateTexture('ink_drop', 32, 40);

        // --- BOOK (Collectible) ---
        graphics.clear();
        graphics.fillStyle(0x8b4513);
        graphics.fillRoundedRect(2, 5, 36, 30, 3);
        graphics.fillStyle(0xf4d03f);
        graphics.fillRect(5, 8, 30, 24);
        graphics.fillStyle(0x8b4513);
        graphics.fillRect(18, 8, 4, 24);
        // Arabic text hint
        graphics.fillStyle(0x2c1810);
        graphics.fillRect(8, 12, 8, 2);
        graphics.fillRect(8, 18, 8, 2);
        graphics.fillRect(24, 12, 8, 2);
        graphics.fillRect(24, 18, 8, 2);
        graphics.generateTexture('book', 40, 40);

        // --- BACKGROUND LAYERS ---
        // Sky gradient
        graphics.clear();
        const skyGradient = graphics.createLinearGradient(0, 0, 0, 720);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.5, '#98D8E8');
        skyGradient.addColorStop(1, '#F4D03F');
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xF4D03F, 0xF4D03F);
        graphics.fillRect(0, 0, 1280, 720);
        graphics.generateTexture('sky', 1280, 720);

        // Dunes (background)
        graphics.clear();
        graphics.fillStyle(0xdeb887, 0.6);
        graphics.beginPath();
        graphics.moveTo(0, 400);
        for (let x = 0; x <= 1280; x += 160) {
            graphics.lineTo(x, 350 + Math.sin(x / 100) * 50);
        }
        graphics.lineTo(1280, 720);
        graphics.lineTo(0, 720);
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('dunes_back', 1280, 720);

        // Dunes (foreground)
        graphics.clear();
        graphics.fillStyle(0xf4d03f, 0.8);
        graphics.beginPath();
        graphics.moveTo(0, 500);
        for (let x = 0; x <= 1280; x += 100) {
            graphics.lineTo(x, 450 + Math.sin(x / 80) * 40);
        }
        graphics.lineTo(1280, 720);
        graphics.lineTo(0, 720);
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('dunes_front', 1280, 720);

        // --- PALM TREE ---
        graphics.clear();
        // Trunk
        graphics.fillStyle(0x8b4513);
        graphics.fillRect(35, 60, 20, 100);
        // Trunk texture
        graphics.fillStyle(0x6b3610);
        for (let y = 65; y < 155; y += 12) {
            graphics.fillRect(35, y, 20, 3);
        }
        // Leaves
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

        // --- UI ELEMENTS ---
        // Button
        graphics.clear();
        graphics.fillStyle(0xf4d03f);
        graphics.fillRoundedRect(0, 0, 200, 60, 10);
        graphics.fillStyle(0xe6c229);
        graphics.fillRoundedRect(5, 5, 190, 50, 8);
        graphics.generateTexture('button', 200, 60);

        // Score panel
        graphics.clear();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRoundedRect(0, 0, 200, 50, 10);
        graphics.lineStyle(3, 0xf4d03f);
        graphics.strokeRoundedRect(0, 0, 200, 50, 10);
        graphics.generateTexture('score_panel', 200, 50);

        // Letter card
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRoundedRect(0, 0, 120, 120, 15);
        graphics.lineStyle(4, 0xf4d03f);
        graphics.strokeRoundedRect(2, 2, 116, 116, 13);
        graphics.generateTexture('letter_card', 120, 120);

        // Joystick base
        graphics.clear();
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillCircle(50, 50, 50);
        graphics.lineStyle(2, 0xffffff, 0.5);
        graphics.strokeCircle(50, 50, 48);
        graphics.generateTexture('joystick_base', 100, 100);

        // Joystick thumb
        graphics.clear();
        graphics.fillStyle(0xffffff, 0.6);
        graphics.fillCircle(25, 25, 25);
        graphics.generateTexture('joystick_thumb', 50, 50);

        // Jump button
        graphics.clear();
        graphics.fillStyle(0x3498db, 0.5);
        graphics.fillCircle(40, 40, 40);
        graphics.lineStyle(3, 0xffffff, 0.7);
        graphics.strokeCircle(40, 40, 38);
        // Arrow up
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillTriangle(40, 15, 20, 45, 60, 45);
        graphics.generateTexture('jump_button', 80, 80);

        // Star (for feedback)
        graphics.clear();
        graphics.fillStyle(0xf4d03f);
        graphics.fillStar(30, 30, 5, 28, 14);
        graphics.fillStyle(0xf39c12);
        graphics.fillStar(30, 30, 5, 20, 10);
        graphics.generateTexture('star', 60, 60);

        // Heart (lives)
        graphics.clear();
        graphics.fillStyle(0xe74c3c);
        graphics.fillCircle(12, 12, 10);
        graphics.fillCircle(28, 12, 10);
        graphics.fillTriangle(2, 15, 38, 15, 20, 38);
        graphics.generateTexture('heart', 40, 40);

        graphics.destroy();
    }

    loadAudioAssets() {
        // For MVP, we'll create simple audio using Web Audio API in GameScene
        // This avoids needing external audio files

        // Placeholder: Create silent audio data URL
        const silentAudio = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

        // Load placeholder sounds (will be replaced with Web Audio synthesis)
        this.load.audio('jump', silentAudio);
        this.load.audio('correct', silentAudio);
        this.load.audio('wrong', silentAudio);
        this.load.audio('coin', silentAudio);
    }

    create() {
        // Set up Web Audio context for sound synthesis
        this.createSoundSynthesizer();

        // Transition to game on tap
        this.input.once('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
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
                this.playTone(523, 0.15, 'sine', 0.3); // C5
                setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 100); // E5
                setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200); // G5
            },

            playWrong() {
                this.playTone(200, 0.3, 'sawtooth', 0.2);
            },

            playCoin() {
                this.playTone(988, 0.1, 'sine', 0.2); // B5
                setTimeout(() => this.playTone(1319, 0.15, 'sine', 0.2), 80); // E6
            },

            // Speak Arabic letter using Web Speech API if available
            speakLetter(letter, letterName) {
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(letter);
                    utterance.lang = 'ar-SA';
                    utterance.rate = 0.8;
                    utterance.pitch = 1.2;
                    speechSynthesis.speak(utterance);
                } else {
                    // Fallback: play a tone sequence
                    this.playTone(440, 0.2, 'sine', 0.3);
                }
            }
        };
    }
}
