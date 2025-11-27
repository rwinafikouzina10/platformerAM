/**
 * MenuScene - Level selection screen
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Title
        this.add.text(width / 2, 80, 'Faris & De Letter Oase', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '48px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Arabic subtitle
        this.add.text(width / 2, 130, 'فارس وواحة الحروف', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Difficulty selection title
        this.add.text(width / 2, 190, 'Snelheid:', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#98D8E8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create difficulty selector
        this.createDifficultySelector(width / 2, 230);

        // Level selection title
        this.add.text(width / 2, 290, 'Kies een niveau:', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#98D8E8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get saved progress
        const unlockedLevel = parseInt(localStorage.getItem('farisUnlockedLevel') || '1');
        const completedLetters = JSON.parse(localStorage.getItem('farisCompletedLetters') || '{}');

        // Level buttons (adjusted Y positions)
        this.createLevelButton(width / 2, 380, 1, 'Niveau 1', 'Alleen losse letters', 'ب ت ث', true, unlockedLevel, completedLetters);
        this.createLevelButton(width / 2, 480, 2, 'Niveau 2', 'Alle lettervormen', 'بـ ـبـ ـب', unlockedLevel >= 2, unlockedLevel, completedLetters);
        this.createLevelButton(width / 2, 580, 3, 'Niveau 3', 'Met harakat', 'بَ بِ بُ', unlockedLevel >= 3, unlockedLevel, completedLetters);

        // Instructions
        this.add.text(width / 2, 670, 'Luister naar de letter en verzamel de juiste!', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(0.5);

        // Camera fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    createDifficultySelector(x, y) {
        const difficulties = window.GameData.difficulties;
        const diffKeys = ['slow', 'medium', 'fast'];
        const buttonWidth = 120;
        const spacing = 140;
        const startX = x - spacing;

        this.difficultyButtons = {};

        diffKeys.forEach((key, index) => {
            const btnX = startX + (index * spacing);
            const isSelected = window.GameData.currentDifficulty === key;

            // Button background
            const bg = this.add.rectangle(btnX, y, buttonWidth, 40, isSelected ? 0xf4d03f : 0x2c3e50);
            bg.setStrokeStyle(2, isSelected ? 0xffffff : 0x555555);
            bg.setInteractive({ useHandCursor: true });

            // Button label
            const label = this.add.text(btnX, y, difficulties[key].label, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: isSelected ? '#2c1810' : '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.difficultyButtons[key] = { bg, label };

            // Click handler
            bg.on('pointerdown', () => {
                this.selectDifficulty(key);
            });

            bg.on('pointerover', () => {
                if (window.GameData.currentDifficulty !== key) {
                    bg.setFillStyle(0x3d566e);
                }
            });

            bg.on('pointerout', () => {
                if (window.GameData.currentDifficulty !== key) {
                    bg.setFillStyle(0x2c3e50);
                }
            });
        });
    }

    selectDifficulty(key) {
        // Update game data
        window.GameData.currentDifficulty = key;
        localStorage.setItem('farisDifficulty', key);

        // Update button visuals
        const diffKeys = ['slow', 'medium', 'fast'];
        diffKeys.forEach(k => {
            const btn = this.difficultyButtons[k];
            const isSelected = k === key;
            btn.bg.setFillStyle(isSelected ? 0xf4d03f : 0x2c3e50);
            btn.bg.setStrokeStyle(2, isSelected ? 0xffffff : 0x555555);
            btn.label.setColor(isSelected ? '#2c1810' : '#ffffff');
        });
    }

    createLevelButton(x, y, level, title, description, arabicExample, unlocked, currentUnlocked, completedLetters) {
        const buttonWidth = 400;
        const buttonHeight = 85;

        // Button background
        const bgColor = unlocked ? 0x2c3e50 : 0x1a1a1a;
        const bg = this.add.rectangle(x, y, buttonWidth, buttonHeight, bgColor, unlocked ? 1 : 0.5);
        bg.setStrokeStyle(3, unlocked ? 0xf4d03f : 0x555555);

        // Level number badge
        const badgeColor = unlocked ? 0xf4d03f : 0x555555;
        this.add.circle(x - 160, y, 25, badgeColor);
        this.add.text(x - 160, y, level.toString(), {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: unlocked ? '#2c1810' : '#888888',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Title
        this.add.text(x + 20, y - 25, title, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: unlocked ? '#ffffff' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Description
        this.add.text(x + 20, y + 5, description, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: unlocked ? '#98D8E8' : '#555555'
        }).setOrigin(0.5);

        // Arabic example
        this.add.text(x + 20, y + 30, arabicExample, {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '20px',
            color: unlocked ? '#f4d03f' : '#444444'
        }).setOrigin(0.5);

        // Progress indicator
        const lettersInLevel = this.getLettersForLevel(level).length;
        const completed = (completedLetters[level] || []).length;
        if (unlocked && completed > 0) {
            this.add.text(x + 170, y, `${completed}/${lettersInLevel}`, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#27ae60'
            }).setOrigin(0.5);
        }

        // Lock icon for locked levels
        if (!unlocked) {
            this.add.text(x + 170, y, '🔒', {
                fontSize: '24px'
            }).setOrigin(0.5);
        }

        // Make interactive if unlocked
        if (unlocked) {
            bg.setInteractive({ useHandCursor: true });

            bg.on('pointerover', () => {
                bg.setFillStyle(0x3d566e);
            });

            bg.on('pointerout', () => {
                bg.setFillStyle(0x2c3e50);
            });

            bg.on('pointerdown', () => {
                this.startLevel(level);
            });
        }
    }

    getLettersForLevel(level) {
        const letters = window.GameData.letters;
        if (level === 3) {
            // Level 3 includes harakat combinations
            return letters.concat(window.GameData.harakat || []);
        }
        return letters;
    }

    startLevel(level) {
        // Unlock audio on level start (required for tablets/mobile)
        if (window.AudioSynth) {
            window.AudioSynth.unlock();
        }

        // Store selected level
        window.GameData.currentLevel = level;
        window.GameData.levelLettersCompleted = [];

        // Fade out and start game
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
}
