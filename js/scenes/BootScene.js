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

        // Check for saved player name
        const savedName = localStorage.getItem('playerName');
        const displayName = savedName ? `${savedName}'s` : 'LetterQuest';

        // Title - shows player name if saved
        this.nameText = this.add.text(width / 2, height / 2 - 100, savedName ? `${savedName}'s` : '', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#98D8E8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 50, 'LetterQuest', {
            fontFamily: 'Arial',
            fontSize: '56px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Arabic subtitle
        this.add.text(width / 2, height / 2 + 10, 'رحلة الحروف العربية', {
            fontFamily: 'Noto Sans Arabic, Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Loading bar background
        const barWidth = 400;
        const barHeight = 30;
        this.loadingBarBg = this.add.rectangle(width / 2, height / 2 + 80, barWidth + 4, barHeight + 4, 0xffffff)
            .setOrigin(0.5);

        // Loading bar fill
        this.loadingBar = this.add.rectangle(
            width / 2 - barWidth / 2,
            height / 2 + 80,
            0,
            barHeight,
            0xf4d03f
        ).setOrigin(0, 0.5);

        // Loading text (Dutch)
        this.loadingText = this.add.text(width / 2, height / 2 + 130, 'Laden...', {
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
            // Check if we need to ask for name
            const savedName = localStorage.getItem('playerName');
            if (!savedName) {
                this.loadingText.setText('');
                this.loadingBar.setVisible(false);
                this.loadingBarBg.setVisible(false);
            } else {
                this.loadingText.setText('Tik om te starten!');
            }
        });
    }

    loadExternalAssets() {
        const basePath = 'assets/';

        // --- NEW PLAYER CHARACTER (Arabian Adventurer) ---
        // 64x64 pixel character spritesheets from new asset pack
        this.load.spritesheet('player_run', basePath + 'images/character/arabian_adventurer/run_new_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('player_jump', basePath + 'images/character/arabian_adventurer/jump_new_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('player_idle', basePath + 'images/character/arabian_adventurer/idle_new_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('player_crouch', basePath + 'images/character/arabian_adventurer/crouch_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        // Keep old stand image as fallback
        this.load.image('player_stand', basePath + 'images/character/idle.png');

        // --- GUI ASSETS ---
        // Hearts for lives display
        this.load.image('gui_heart_full', basePath + 'images/gui/icons/Icon_Large_HeartFull.png');
        this.load.image('gui_heart_empty', basePath + 'images/gui/icons/Icon_Large_HeartEmpty.png');
        this.load.image('gui_heart_half', basePath + 'images/gui/icons/Icon_Large_HeartHalf.png');
        // Stars
        this.load.image('gui_star', basePath + 'images/gui/icons/Icon_Large_Star.png');
        this.load.image('gui_star_grey', basePath + 'images/gui/icons/Icon_Large_StarGrey.png');
        // Buttons
        this.load.image('gui_btn_replay', basePath + 'images/gui/buttons/PremadeButtons_Replay.png');
        this.load.image('gui_btn_menu', basePath + 'images/gui/buttons/PremadeButtons_Menu.png');
        this.load.image('gui_btn_resume', basePath + 'images/gui/buttons/PremadeButtons_Resume.png');
        this.load.image('gui_btn_yes', basePath + 'images/gui/buttons/PremadeButtons_YesGreen.png');
        this.load.image('gui_btn_no', basePath + 'images/gui/buttons/PremadeButtons_No.png');
        this.load.image('gui_btn_select', basePath + 'images/gui/buttons/PremadeButtons_Select.png');
        this.load.image('gui_btn_check', basePath + 'images/gui/buttons/PremadeButtons_Check.png');
        // Button backgrounds (for custom buttons)
        this.load.image('gui_btn_green', basePath + 'images/gui/buttons/IconButton_Large_Green_Rounded.png');
        this.load.image('gui_btn_orange', basePath + 'images/gui/buttons/IconButton_Large_Orange_Rounded.png');
        this.load.image('gui_btn_blue', basePath + 'images/gui/buttons/IconButton_Large_Blue_Rounded.png');
        this.load.image('gui_btn_red', basePath + 'images/gui/buttons/IconButton_Large_Red_Rounded.png');
        this.load.image('gui_btn_grey', basePath + 'images/gui/buttons/IconButton_Large_GreyOutline_Rounded.png');
        // Boxes (for panels/cards)
        this.load.image('gui_box_blue', basePath + 'images/gui/boxes/Box_Blue_Rounded.png');
        this.load.image('gui_box_orange', basePath + 'images/gui/boxes/Box_Orange_Rounded.png');
        this.load.image('gui_box_blank', basePath + 'images/gui/boxes/Box_Blank_Rounded.png');
        this.load.image('gui_box_white', basePath + 'images/gui/boxes/Box_WhiteOutline_Rounded.png');

        // --- BACKGROUNDS ---
        this.load.image('bg_yellow', basePath + 'images/background/Yellow.png');
        this.load.image('bg_blue', basePath + 'images/background/Blue.png');
        this.load.image('bg_brown', basePath + 'images/background/Brown.png');

        // --- PARALLAX BACKGROUNDS (Rocky Desert) ---
        this.load.image('parallax_mountains', basePath + 'images/parallax/rocky-mountains.png');
        this.load.image('parallax_far', basePath + 'images/parallax/rocky-far.png');
        this.load.image('parallax_mid', basePath + 'images/parallax/rocky-mid.png');
        this.load.image('parallax_close', basePath + 'images/parallax/rocky-close.png');

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

        // --- TILESET SPRITESHEETS (32x32 tiles) ---
        // Summer tileset - grass and dirt platforms
        this.load.spritesheet('tileset_summer', basePath + 'images/tileset/summer_.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        // Autumn tileset - brown/orange platforms (Level 2)
        this.load.spritesheet('tileset_autumn', basePath + 'images/tileset/autumn_.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        // Winter tileset - snow/ice platforms (Level 3)
        this.load.spritesheet('tileset_winter', basePath + 'images/tileset/winter_.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        // Terrain tileset - stone/brick platforms
        this.load.spritesheet('tileset_terrain', basePath + 'images/tileset/terrain_.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        // Static objects - decorations
        this.load.spritesheet('tileset_objects', basePath + 'images/tileset/staticObjects_.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // --- HIGH FOREST TILESET (Level 2) ---
        // 16x16 pixel tiles, fantasy forest theme
        this.load.spritesheet('tileset_forest', basePath + 'images/Legacy-Fantasy - High Forest 2.3/Assets/Tiles.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('forest_background', basePath + 'images/Legacy-Fantasy - High Forest 2.3/Background/Background.png');
        this.load.image('forest_trees', basePath + 'images/Legacy-Fantasy - High Forest 2.3/Assets/Tree-Assets.png');
        this.load.image('forest_rocks', basePath + 'images/Legacy-Fantasy - High Forest 2.3/Assets/Props-Rocks.png');

        // --- MOSSY TILESET (Level 3) ---
        // Pre-made floating platforms for cave/underground theme
        this.load.image('mossy_platforms', basePath + 'images/Mossy Tileset/Mossy - FloatingPlatforms.png');
        this.load.image('mossy_tileset', basePath + 'images/Mossy Tileset/Mossy - TileSet.png');
        this.load.image('mossy_decorations', basePath + 'images/Mossy Tileset/Mossy - Decorations&Hazards.png');
        this.load.image('mossy_hills', basePath + 'images/Mossy Tileset/Mossy - MossyHills.png');

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

        // --- ARABIC LETTER AUDIO ---
        const letterSounds = [
            'alif', 'ba', 'ta', 'tha', 'jeem', 'ha', 'kha', 'dal', 'thal',
            'ra', 'zay', 'seen', 'sheen', 'sad', 'dad', 'taa', 'zaa',
            'ain', 'ghain', 'fa', 'qaf', 'kaf', 'lam', 'meem', 'noon',
            'haa', 'waw', 'ya'
        ];
        letterSounds.forEach(sound => {
            this.load.audio(`letter_${sound}`, basePath + `audio/letters/${sound}.mp3`);
        });

        // Letters with harakat (ALL 28 letters × 3 harakat = 84 files)
        // Pronunciations: ba, bi, bu / ta, ti, tu / etc.
        const harakatTypes = ['fatha', 'kasra', 'damma'];
        letterSounds.forEach(letter => {
            harakatTypes.forEach(haraka => {
                this.load.audio(`letter_${letter}_${haraka}`, basePath + `audio/letters/${letter}_${haraka}.mp3`);
            });
        });

        // --- BACKGROUND MUSIC ---
        // Load music files (placed in assets/audio/music/)
        this.load.audio('music1', basePath + 'audio/music/music1.mp3');
        this.load.audio('music2', basePath + 'audio/music/music2.mp3');
        this.load.audio('music3', basePath + 'audio/music/music3.mp3');
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

        // Check if we need to ask for name
        const savedName = localStorage.getItem('playerName');

        if (!savedName) {
            // Show name input form
            this.showNameInput();
        } else {
            // Transition to menu on tap - also unlock audio for tablets
            this.input.once('pointerdown', () => {
                this.startGame();
            });
        }
    }

    showNameInput() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Prompt text
        this.add.text(width / 2, height / 2 + 70, 'Wat is je naam?', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#98D8E8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get the game container and canvas for proper positioning
        const gameContainer = document.getElementById('game-container');
        const canvas = this.game.canvas;

        // Create HTML input element
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = 'Voer je naam in...';
        inputElement.maxLength = 20;
        inputElement.id = 'playerNameInput';

        // Position the input relative to the game container
        inputElement.style.cssText = `
            position: absolute;
            width: 300px;
            padding: 15px 20px;
            font-size: 24px;
            font-family: Arial, sans-serif;
            text-align: center;
            border: 3px solid #f4d03f;
            border-radius: 10px;
            background: #2c1810;
            color: #ffffff;
            outline: none;
            z-index: 9999;
            box-sizing: border-box;
        `;

        // Add to game container instead of body (so it scales with the game)
        if (gameContainer) {
            gameContainer.style.position = 'relative';
            gameContainer.appendChild(inputElement);

            // Position based on canvas scaling
            const updateInputPosition = () => {
                const canvasRect = canvas.getBoundingClientRect();
                const scaleX = canvasRect.width / width;
                const scaleY = canvasRect.height / height;

                // Position at game coordinates (center x, between prompt and button)
                const gameX = width / 2;
                const gameY = height / 2 + 130; // Between prompt (y+70) and button (y+200)

                // Convert to screen coordinates relative to canvas
                const screenX = gameX * scaleX;
                const screenY = gameY * scaleY;

                // Calculate offset from container to canvas
                const containerRect = gameContainer.getBoundingClientRect();
                const offsetX = canvasRect.left - containerRect.left;
                const offsetY = canvasRect.top - containerRect.top;

                inputElement.style.left = `${offsetX + screenX - 150}px`; // 150 = half of 300px width
                inputElement.style.top = `${offsetY + screenY}px`;

                // Scale font size with canvas
                const scale = Math.min(scaleX, scaleY);
                inputElement.style.fontSize = `${24 * scale}px`;
                inputElement.style.padding = `${15 * scale}px ${20 * scale}px`;
                inputElement.style.width = `${300 * scale}px`;
                inputElement.style.left = `${offsetX + screenX - (150 * scale)}px`;
            };

            updateInputPosition();

            // Update on resize
            window.addEventListener('resize', updateInputPosition);
            this.inputPositionHandler = updateInputPosition;
        } else {
            // Fallback: add to body with fixed positioning
            inputElement.style.position = 'fixed';
            inputElement.style.left = '50%';
            inputElement.style.top = '50%';
            inputElement.style.transform = 'translate(-50%, 0)';
            document.body.appendChild(inputElement);
        }

        this.nameInput = inputElement;

        // Focus the input
        setTimeout(() => inputElement.focus(), 100);

        // Create start button using Phaser (visible inside the game)
        const startBtn = this.add.text(width / 2, height / 2 + 200, 'Start!', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 40, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => startBtn.setScale(1.1));
        startBtn.on('pointerout', () => startBtn.setScale(1));
        startBtn.on('pointerdown', () => this.submitName());

        // Also submit on Enter key
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitName();
            }
        });
    }

    submitName() {
        const name = this.nameInput.value.trim();

        if (name.length > 0) {
            // Save the name
            localStorage.setItem('playerName', name);

            // Update the title display
            this.nameText.setText(`${name}'s`);

            // Clean up resize listener
            if (this.inputPositionHandler) {
                window.removeEventListener('resize', this.inputPositionHandler);
            }

            // Remove the input element
            this.nameInput.remove();

            // Start the game
            this.startGame();
        } else {
            // Shake the input if empty
            this.nameInput.style.animation = 'shake 0.3s';
            setTimeout(() => {
                this.nameInput.style.animation = '';
            }, 300);
        }
    }

    startGame() {
        // Unlock audio on first user interaction (required for tablets/mobile)
        if (window.AudioSynth) {
            window.AudioSynth.unlock();
        }

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }

    createAnimations() {
        // Player animations using new Arabian Adventurer spritesheets (64x64)
        this.anims.create({
            key: 'player_idle_anim',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'player_run_anim',
            frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'player_jump_anim',
            frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 4 }),
            frameRate: 12,
            repeat: 0
        });

        this.anims.create({
            key: 'player_fall_anim',
            frames: this.anims.generateFrameNumbers('player_jump', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'player_double_jump_anim',
            frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 8 }),
            frameRate: 15,
            repeat: 0
        });

        // Crouch animation - 5 frames
        this.anims.create({
            key: 'player_crouch_anim',
            frames: this.anims.generateFrameNumbers('player_crouch', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: 0
        });

        // Crouching idle (hold last crouch frame)
        this.anims.create({
            key: 'player_crouch_idle_anim',
            frames: this.anims.generateFrameNumbers('player_crouch', { start: 4, end: 4 }),
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'player_hit_anim',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 0 }),
            frameRate: 1,
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
        // Fixed for tablet/mobile: AudioContext must be resumed after user gesture
        window.AudioSynth = {
            context: null,
            initialized: false,
            speechUnlocked: false,

            init() {
                if (!this.context) {
                    this.context = new (window.AudioContext || window.webkitAudioContext)();
                }
                // Resume context if it's suspended (required on mobile/tablets)
                if (this.context.state === 'suspended') {
                    this.context.resume();
                }
                return this.context;
            },

            // Call this on first user interaction to unlock audio AND speech
            unlock() {
                this.init();
                if (!this.initialized) {
                    // Play a silent sound to unlock audio on iOS/Android
                    const ctx = this.context;
                    const buffer = ctx.createBuffer(1, 1, 22050);
                    const source = ctx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(ctx.destination);
                    source.start(0);
                    this.initialized = true;
                }

                // Unlock Speech Synthesis on tablets (must be triggered by user gesture)
                if (!this.speechUnlocked && 'speechSynthesis' in window) {
                    // iOS requires actual content (not empty string) to unlock
                    const unlockUtterance = new SpeechSynthesisUtterance(' ');
                    unlockUtterance.volume = 0.01; // Nearly silent but not zero (iOS quirk)
                    unlockUtterance.rate = 10; // Fast to minimize delay
                    speechSynthesis.speak(unlockUtterance);

                    // Pre-load voices (iOS loads them lazily)
                    speechSynthesis.getVoices();

                    this.speechUnlocked = true;
                }
            },

            playTone(frequency, duration, type = 'sine', volume = 0.3) {
                const ctx = this.init();
                if (ctx.state === 'suspended') return; // Don't play if still locked

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

            speakLetter(soundKey, scene) {
                // Unlock audio context first
                this.unlock();

                // Use pre-recorded audio files instead of TTS
                // soundKey format: 'alif', 'ba', 'ta_fatha', etc.
                const audioKey = `letter_${soundKey}`;

                if (scene && scene.sound && scene.cache.audio.exists(audioKey)) {
                    scene.sound.play(audioKey, { volume: 1.0 });
                } else {
                    // Fallback: play a tone if audio not found
                    console.warn(`Audio not found: ${audioKey}`);
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
