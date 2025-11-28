/**
 * MenuScene - Level selection screen for Ayden Moussa's LetterQuest
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Desert gradient background
        this.createBackground(width, height);

        // Title area with decorative panel
        this.createTitleArea(width);

        // Difficulty selector
        this.createDifficultySelector(width, 200);

        // Level selection
        this.createLevelSelection(width);

        // Footer instruction
        this.add.text(width / 2, height - 30, 'Luister naar de letter en verzamel de juiste!', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Camera fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    createBackground(width, height) {
        // Create gradient-like background
        const bg = this.add.graphics();

        // Dark blue base
        bg.fillStyle(0x1a1a2e);
        bg.fillRect(0, 0, width, height);

        // Add some subtle decorations
        bg.fillStyle(0x16213e, 0.5);
        bg.fillCircle(100, 600, 200);
        bg.fillCircle(width - 100, 100, 150);

        // Stars decoration
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 3);
            bg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.6));
            bg.fillCircle(x, y, size);
        }
    }

    createTitleArea(width) {
        // Title background panel
        const titlePanel = this.add.image(width / 2, 80, 'gui_box_orange');
        titlePanel.setDisplaySize(500, 120);
        titlePanel.setAlpha(0.9);

        // Main title - "Ayden Moussa's"
        this.add.text(width / 2, 50, "Ayden Moussa's", {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#5a3d1a',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Game title - "LetterQuest"
        this.add.text(width / 2, 85, 'LetterQuest', {
            fontFamily: 'Arial',
            fontSize: '42px',
            color: '#2c1810',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Arabic subtitle
        this.add.text(width / 2, 120, 'رحلة الحروف العربية', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '20px',
            color: '#5a3d1a'
        }).setOrigin(0.5);
    }

    createDifficultySelector(width, y) {
        // Section title
        this.add.text(width / 2, y, 'Snelheid', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const difficulties = window.GameData.difficulties;
        const diffKeys = ['slow', 'medium', 'fast'];
        const buttonSize = 70;
        const spacing = 100;
        const startX = width / 2 - spacing;
        const btnY = y + 50;

        this.difficultyButtons = {};

        diffKeys.forEach((key, index) => {
            const btnX = startX + (index * spacing);
            const isSelected = window.GameData.currentDifficulty === key;

            // Button image
            const btnKey = isSelected ? 'gui_btn_orange' : 'gui_btn_grey';
            const btn = this.add.image(btnX, btnY, btnKey);
            btn.setDisplaySize(buttonSize, buttonSize);
            btn.setInteractive({ useHandCursor: true });

            // Speed icon (using text as icon representation)
            const speedIcons = { slow: '🐢', medium: '🐇', fast: '⚡' };
            const icon = this.add.text(btnX, btnY - 5, speedIcons[key], {
                fontSize: '24px'
            }).setOrigin(0.5);

            // Label below button
            const label = this.add.text(btnX, btnY + 50, difficulties[key].label, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: isSelected ? '#f4d03f' : '#888888',
                fontStyle: isSelected ? 'bold' : 'normal'
            }).setOrigin(0.5);

            this.difficultyButtons[key] = { btn, icon, label };

            // Click handler
            btn.on('pointerdown', () => {
                this.selectDifficulty(key);
            });

            btn.on('pointerover', () => {
                if (window.GameData.currentDifficulty !== key) {
                    btn.setTint(0xcccccc);
                }
            });

            btn.on('pointerout', () => {
                btn.clearTint();
            });
        });
    }

    selectDifficulty(key) {
        window.GameData.currentDifficulty = key;
        localStorage.setItem('farisDifficulty', key);

        const diffKeys = ['slow', 'medium', 'fast'];
        diffKeys.forEach(k => {
            const { btn, label } = this.difficultyButtons[k];
            const isSelected = k === key;

            btn.setTexture(isSelected ? 'gui_btn_orange' : 'gui_btn_grey');
            label.setColor(isSelected ? '#f4d03f' : '#888888');
            label.setFontStyle(isSelected ? 'bold' : 'normal');
        });
    }

    createLevelSelection(width) {
        // Section title
        this.add.text(width / 2, 320, 'Kies een niveau', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get saved progress
        const unlockedLevel = parseInt(localStorage.getItem('farisUnlockedLevel') || '1');
        const completedLetters = JSON.parse(localStorage.getItem('farisCompletedLetters') || '{}');

        // Level cards - horizontal layout
        const cardWidth = 180;
        const cardSpacing = 200;
        const startX = width / 2 - cardSpacing;
        const cardY = 460;

        const levels = [
            { num: 1, title: 'Niveau 1', desc: 'Losse letters', example: 'ب ت ث' },
            { num: 2, title: 'Niveau 2', desc: 'Alle vormen', example: 'بـ ـبـ ـب' },
            { num: 3, title: 'Niveau 3', desc: 'Met harakat', example: 'بَ بِ بُ' }
        ];

        levels.forEach((level, index) => {
            const x = startX + (index * cardSpacing);
            const unlocked = unlockedLevel >= level.num;

            this.createLevelCard(x, cardY, level, unlocked, completedLetters);
        });
    }

    createLevelCard(x, y, level, unlocked, completedLetters) {
        const cardWidth = 170;
        const cardHeight = 220;

        // Card background
        const boxKey = unlocked ? 'gui_box_blue' : 'gui_box_blank';
        const card = this.add.image(x, y, boxKey);
        card.setDisplaySize(cardWidth, cardHeight);

        if (!unlocked) {
            card.setTint(0x555555);
            card.setAlpha(0.7);
        }

        // Level number badge
        const badgeY = y - 70;
        const badge = this.add.image(x, badgeY, unlocked ? 'gui_btn_orange' : 'gui_btn_grey');
        badge.setDisplaySize(50, 50);

        this.add.text(x, badgeY, level.num.toString(), {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: unlocked ? '#2c1810' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Title
        this.add.text(x, y - 25, level.title, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: unlocked ? '#ffffff' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Description
        this.add.text(x, y + 5, level.desc, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: unlocked ? '#aaddff' : '#555555'
        }).setOrigin(0.5);

        // Arabic example
        this.add.text(x, y + 35, level.example, {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '22px',
            color: unlocked ? '#f4d03f' : '#444444'
        }).setOrigin(0.5);

        // Progress stars
        const lettersInLevel = this.getLettersForLevel(level.num).length;
        const completed = (completedLetters[level.num] || []).length;
        const progress = completed / lettersInLevel;

        if (unlocked) {
            this.createProgressStars(x, y + 70, progress);
        }

        // Lock icon for locked levels
        if (!unlocked) {
            this.add.text(x, y + 70, '🔒', {
                fontSize: '32px'
            }).setOrigin(0.5);
        }

        // Make interactive if unlocked
        if (unlocked) {
            card.setInteractive({ useHandCursor: true });
            badge.setInteractive({ useHandCursor: true });

            const highlight = () => {
                card.setTint(0x88bbff);
                badge.setScale(1.1);
            };

            const unhighlight = () => {
                card.clearTint();
                badge.setScale(1);
            };

            const startGame = () => {
                this.startLevel(level.num);
            };

            card.on('pointerover', highlight);
            card.on('pointerout', unhighlight);
            card.on('pointerdown', startGame);

            badge.on('pointerover', highlight);
            badge.on('pointerout', unhighlight);
            badge.on('pointerdown', startGame);
        }
    }

    createProgressStars(x, y, progress) {
        const starSpacing = 25;
        const startX = x - starSpacing;

        for (let i = 0; i < 3; i++) {
            const threshold = (i + 1) / 3;
            const filled = progress >= threshold;
            const star = this.add.image(startX + (i * starSpacing), y, filled ? 'gui_star' : 'gui_star_grey');
            star.setDisplaySize(22, 22);
        }
    }

    getLettersForLevel(level) {
        const letters = window.GameData.letters;
        if (level === 3) {
            return letters.concat(window.GameData.harakat || []);
        }
        return letters;
    }

    startLevel(level) {
        // Unlock audio on level start
        if (window.AudioSynth) {
            window.AudioSynth.unlock();
        }

        window.GameData.currentLevel = level;
        window.GameData.levelLettersCompleted = [];

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
}
