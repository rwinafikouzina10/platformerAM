/**
 * Faris & The Letter Oasis
 * An Endless Runner game to teach Arabic letters and short vowels (Harakat)
 * Built with Phaser 3
 */

// Game Configuration - Optimized for Tablets
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,          // Scales game to fit screen while keeping aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH,  // Centers game on tablet screen
        width: 1280,                      // Base resolution (Landscape)
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },          // Downward gravity for jumping
            debug: false                   // Set to true for physics debugging
        }
    },
    render: {
        pixelArt: false,                  // Smooth rendering for Arabic text
        antialias: true
    },
    input: {
        activePointers: 3                 // Support multi-touch for joystick + jump
    },
    plugins: {
        global: [{
            key: 'rexVirtualJoystick',
            plugin: rexvirtualjoystickplugin,
            start: true
        }]
    },
    scene: [BootScene, GameScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Dutch translations for UI
window.Lang = {
    // Game title
    title: 'Faris & De Letter Oase',
    subtitle: 'فارس وواحة الحروف',

    // Boot/Loading screen
    loading: 'Laden...',
    tapToStart: 'Tik om te starten!',

    // Game UI
    find: 'Zoek:',
    score: 'Score',
    best: 'Beste',
    lives: 'Levens',

    // Feedback messages
    correct: 'Goed zo!',
    tryAgain: 'Probeer opnieuw!',
    comboBonus: 'Combo Bonus! +30',
    listenCarefully: 'Luister goed...',

    // Game Over
    gameOver: 'Einde Spel',
    finalScore: 'Je score',
    playAgain: 'Opnieuw spelen',
    newHighScore: 'Nieuwe hoogste score!',

    // Instructions
    findTheLetter: 'Zoek de letter die je hoort!',
    jumpToCollect: 'Spring op het juiste platform!',

    // Audio hints
    listenAgain: 'Luister nog een keer',
    iHeard: 'Ik hoorde:'
};

// Global game data
window.GameData = {
    // Arabic Letters with their names (Dutch phonetic hints added)
    letters: [
        { char: 'أ', name: 'Alif', sound: 'alif' },
        { char: 'ب', name: 'Ba', sound: 'ba' },
        { char: 'ت', name: 'Ta', sound: 'ta' },
        { char: 'ث', name: 'Tha', sound: 'tha' },
        { char: 'ج', name: 'Jeem', sound: 'jeem' },
        { char: 'ح', name: 'Ha', sound: 'ha' },
        { char: 'خ', name: 'Kha', sound: 'kha' },
        { char: 'د', name: 'Dal', sound: 'dal' },
        { char: 'ذ', name: 'Thal', sound: 'thal' },
        { char: 'ر', name: 'Ra', sound: 'ra' },
        { char: 'ز', name: 'Zay', sound: 'zay' },
        { char: 'س', name: 'Seen', sound: 'seen' },
        { char: 'ش', name: 'Sheen', sound: 'sheen' },
        { char: 'ص', name: 'Sad', sound: 'sad' },
        { char: 'ض', name: 'Dad', sound: 'dad' },
        { char: 'ط', name: 'Taa', sound: 'taa' },
        { char: 'ظ', name: 'Zaa', sound: 'zaa' },
        { char: 'ع', name: 'Ain', sound: 'ain' },
        { char: 'غ', name: 'Ghain', sound: 'ghain' },
        { char: 'ف', name: 'Fa', sound: 'fa' },
        { char: 'ق', name: 'Qaf', sound: 'qaf' },
        { char: 'ك', name: 'Kaf', sound: 'kaf' },
        { char: 'ل', name: 'Lam', sound: 'lam' },
        { char: 'م', name: 'Meem', sound: 'meem' },
        { char: 'ن', name: 'Noon', sound: 'noon' },
        { char: 'ه', name: 'Ha', sound: 'haa' },
        { char: 'و', name: 'Waw', sound: 'waw' },
        { char: 'ي', name: 'Ya', sound: 'ya' }
    ],

    // Short vowels (Harakat)
    harakat: [
        { char: 'َ', name: 'Fatha', sound: 'a' },    // a sound
        { char: 'ِ', name: 'Kasra', sound: 'i' },    // i sound
        { char: 'ُ', name: 'Damma', sound: 'u' }     // u sound
    ],

    // Game state
    score: 0,
    highScore: localStorage.getItem('farisHighScore') || 0,
    currentLevel: 1,

    // Save high score
    saveHighScore: function(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('farisHighScore', score);
        }
    }
};
