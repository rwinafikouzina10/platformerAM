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
    // Arabic Letters with all forms (isolated, initial, medial, final)
    // forms array: [isolated, initial, medial, final]
    letters: [
        { char: 'ا', name: 'Alif', sound: 'alif', forms: ['ا', 'ا', 'ـا', 'ـا'] },
        { char: 'ب', name: 'Ba', sound: 'ba', forms: ['ب', 'بـ', 'ـبـ', 'ـب'] },
        { char: 'ت', name: 'Ta', sound: 'ta', forms: ['ت', 'تـ', 'ـتـ', 'ـت'] },
        { char: 'ث', name: 'Tha', sound: 'tha', forms: ['ث', 'ثـ', 'ـثـ', 'ـث'] },
        { char: 'ج', name: 'Jeem', sound: 'jeem', forms: ['ج', 'جـ', 'ـجـ', 'ـج'] },
        { char: 'ح', name: 'Ha', sound: 'ha', forms: ['ح', 'حـ', 'ـحـ', 'ـح'] },
        { char: 'خ', name: 'Kha', sound: 'kha', forms: ['خ', 'خـ', 'ـخـ', 'ـخ'] },
        { char: 'د', name: 'Dal', sound: 'dal', forms: ['د', 'د', 'ـد', 'ـد'] },
        { char: 'ذ', name: 'Thal', sound: 'thal', forms: ['ذ', 'ذ', 'ـذ', 'ـذ'] },
        { char: 'ر', name: 'Ra', sound: 'ra', forms: ['ر', 'ر', 'ـر', 'ـر'] },
        { char: 'ز', name: 'Zay', sound: 'zay', forms: ['ز', 'ز', 'ـز', 'ـز'] },
        { char: 'س', name: 'Seen', sound: 'seen', forms: ['س', 'سـ', 'ـسـ', 'ـس'] },
        { char: 'ش', name: 'Sheen', sound: 'sheen', forms: ['ش', 'شـ', 'ـشـ', 'ـش'] },
        { char: 'ص', name: 'Sad', sound: 'sad', forms: ['ص', 'صـ', 'ـصـ', 'ـص'] },
        { char: 'ض', name: 'Dad', sound: 'dad', forms: ['ض', 'ضـ', 'ـضـ', 'ـض'] },
        { char: 'ط', name: 'Taa', sound: 'taa', forms: ['ط', 'طـ', 'ـطـ', 'ـط'] },
        { char: 'ظ', name: 'Zaa', sound: 'zaa', forms: ['ظ', 'ظـ', 'ـظـ', 'ـظ'] },
        { char: 'ع', name: 'Ain', sound: 'ain', forms: ['ع', 'عـ', 'ـعـ', 'ـع'] },
        { char: 'غ', name: 'Ghain', sound: 'ghain', forms: ['غ', 'غـ', 'ـغـ', 'ـغ'] },
        { char: 'ف', name: 'Fa', sound: 'fa', forms: ['ف', 'فـ', 'ـفـ', 'ـف'] },
        { char: 'ق', name: 'Qaf', sound: 'qaf', forms: ['ق', 'قـ', 'ـقـ', 'ـق'] },
        { char: 'ك', name: 'Kaf', sound: 'kaf', forms: ['ك', 'كـ', 'ـكـ', 'ـك'] },
        { char: 'ل', name: 'Lam', sound: 'lam', forms: ['ل', 'لـ', 'ـلـ', 'ـل'] },
        { char: 'م', name: 'Meem', sound: 'meem', forms: ['م', 'مـ', 'ـمـ', 'ـم'] },
        { char: 'ن', name: 'Noon', sound: 'noon', forms: ['ن', 'نـ', 'ـنـ', 'ـن'] },
        { char: 'ه', name: 'Ha', sound: 'haa', forms: ['ه', 'هـ', 'ـهـ', 'ـه'] },
        { char: 'و', name: 'Waw', sound: 'waw', forms: ['و', 'و', 'ـو', 'ـو'] },
        { char: 'ي', name: 'Ya', sound: 'ya', forms: ['ي', 'يـ', 'ـيـ', 'ـي'] }
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
