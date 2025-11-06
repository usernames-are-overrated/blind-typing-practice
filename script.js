// Blind Typing Practice - Main Script

class TypingPractice {
    constructor() {
        this.settings = this.loadSettings();
        this.skillData = this.loadSkillData();
        this.practiceState = {
            isActive: false,
            isPaused: false,
            currentText: '',
            currentIndex: 0,
            startTime: null,
            errors: 0,
            totalChars: 0,
            correctChars: 0,
            timerInterval: null,
            lastBreakTime: Date.now(),
            sessionStartTime: Date.now()
        };

        this.specialKeyMode = false;
        this.currentSpecialKey = null;
        this.currentTipIndex = 0;
        this.tips = this.getAllTips();

        this.init();
    }

    // Initialize the application
    init() {
        this.applyColorScheme();
        this.bindEvents();
        this.updateUI();
        this.generateNewText();
        this.displayTips();

        if (!this.settings.showTips) {
            document.getElementById('tipsSection').classList.add('hidden');
        }

        // Check for breaks periodically
        setInterval(() => this.checkBreakTime(), 60000); // Check every minute

        // Rotate tips every 30 seconds
        setInterval(() => this.rotateTips(), 30000);
    }

    // Get all tips
    getAllTips() {
        return [
            "Keep your fingers on the home row (ASDF for left, JKL; for right)",
            "Use the bumps on F and J keys to position your index fingers",
            "Don't look at the keyboard - trust your muscle memory",
            "Maintain good posture: back straight, feet flat on the floor",
            "Type with a light touch - don't press keys too hard",
            "Practice regularly for short periods rather than long sessions",
            "Left pinky: Q, A, Z, Shift, Ctrl, Tab",
            "Left ring finger: W, S, X",
            "Left middle finger: E, D, C",
            "Left index finger: R, F, V, T, G, B",
            "Right index finger: Y, H, N, U, J, M",
            "Right middle finger: I, K, comma",
            "Right ring finger: O, L, period",
            "Right pinky: P, semicolon, forward slash, brackets, Enter",
            "Thumbs are used for the space bar",
            "Start slow and focus on accuracy, speed will come naturally",
            "Take breaks to prevent strain and maintain focus",
            "Keep your wrists elevated and straight while typing",
            "Use all ten fingers - avoid hunting and pecking",
            "Practice common letter combinations and words"
        ];
    }

    // Display random tips
    displayTips() {
        const tipsList = document.getElementById('tipsList');
        tipsList.innerHTML = '';

        // Display 3 random tips
        const displayedTips = [];
        const tipsCopy = [...this.tips];

        for (let i = 0; i < 3 && tipsCopy.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tipsCopy.length);
            displayedTips.push(tipsCopy[randomIndex]);
            tipsCopy.splice(randomIndex, 1);
        }

        displayedTips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });
    }

    // Rotate tips
    rotateTips() {
        if (this.settings.showTips && !document.getElementById('tipsSection').classList.contains('hidden')) {
            this.displayTips();
        }
    }

    // Load settings from localStorage
    loadSettings() {
        const defaults = {
            keyboardLayout: 'qwerty',
            language: 'english',
            includeSpecialKeys: true,
            showTips: true,
            enableBreaks: true,
            breakInterval: 15,
            primaryColor: '#4A90E2',
            secondaryColor: '#50C878'
        };

        const saved = localStorage.getItem('typingPracticeSettings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('typingPracticeSettings', JSON.stringify(this.settings));
    }

    // Load skill data from localStorage
    loadSkillData() {
        const defaults = {
            level: 0,
            totalPracticeTime: 0,
            totalWords: 0,
            averageWPM: 0,
            averageAccuracy: 100,
            lastLevelUp: Date.now(),
            history: []
        };

        const saved = localStorage.getItem('typingPracticeSkillData');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    // Save skill data to localStorage
    saveSkillData() {
        localStorage.setItem('typingPracticeSkillData', JSON.stringify(this.skillData));
    }

    // Apply color scheme
    applyColorScheme() {
        document.documentElement.style.setProperty('--primary-color', this.settings.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', this.settings.secondaryColor);
    }

    // Bind event listeners
    bindEvents() {
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());

        // Settings inputs
        document.getElementById('keyboardLayout').addEventListener('change', (e) => {
            this.settings.keyboardLayout = e.target.value;
            this.saveSettings();
            if (this.practiceState.isActive) this.generateNewText();
        });

        document.getElementById('language').addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            this.saveSettings();
            if (this.practiceState.isActive) this.generateNewText();
        });

        document.getElementById('includeSpecialKeys').addEventListener('change', (e) => {
            this.settings.includeSpecialKeys = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('showTips').addEventListener('change', (e) => {
            this.settings.showTips = e.target.checked;
            this.saveSettings();
            document.getElementById('tipsSection').classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('enableBreaks').addEventListener('change', (e) => {
            this.settings.enableBreaks = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('breakInterval').addEventListener('change', (e) => {
            this.settings.breakInterval = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('primaryColor').addEventListener('change', (e) => {
            this.settings.primaryColor = e.target.value;
            this.saveSettings();
            this.applyColorScheme();
        });

        document.getElementById('secondaryColor').addEventListener('change', (e) => {
            this.settings.secondaryColor = e.target.value;
            this.saveSettings();
            this.applyColorScheme();
        });

        // Practice controls
        document.getElementById('startBtn').addEventListener('click', () => this.startPractice());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetPractice());

        // Typing input
        const typingInput = document.getElementById('typingInput');
        typingInput.addEventListener('input', (e) => this.handleInput(e));
        typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Break controls
        document.getElementById('skipBreak').addEventListener('click', () => this.skipBreak());

        // Celebration
        document.getElementById('closeCelebration').addEventListener('click', () => this.closeCelebration());
    }

    // Open settings panel
    openSettings() {
        document.getElementById('settingsPanel').classList.add('open');
        this.loadSettingsToUI();
    }

    // Close settings panel
    closeSettings() {
        document.getElementById('settingsPanel').classList.remove('open');
    }

    // Load settings to UI
    loadSettingsToUI() {
        document.getElementById('keyboardLayout').value = this.settings.keyboardLayout;
        document.getElementById('language').value = this.settings.language;
        document.getElementById('includeSpecialKeys').checked = this.settings.includeSpecialKeys;
        document.getElementById('showTips').checked = this.settings.showTips;
        document.getElementById('enableBreaks').checked = this.settings.enableBreaks;
        document.getElementById('breakInterval').value = this.settings.breakInterval;
        document.getElementById('primaryColor').value = this.settings.primaryColor;
        document.getElementById('secondaryColor').value = this.settings.secondaryColor;
    }

    // Reset settings to defaults
    resetSettings() {
        if (confirm('Reset all settings to defaults?')) {
            localStorage.removeItem('typingPracticeSettings');
            this.settings = this.loadSettings();
            this.loadSettingsToUI();
            this.applyColorScheme();
            this.updateUI();
        }
    }

    // Start practice
    startPractice() {
        this.practiceState.isActive = true;
        this.practiceState.isPaused = false;
        this.practiceState.startTime = Date.now();
        this.practiceState.sessionStartTime = Date.now();
        this.practiceState.currentIndex = 0;
        this.practiceState.errors = 0;
        this.practiceState.totalChars = 0;
        this.practiceState.correctChars = 0;

        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('pauseBtn').classList.remove('hidden');
        document.getElementById('typingInput').focus();
        document.getElementById('typingInput').disabled = false;

        this.startTimer();
        this.generateNewText();
    }

    // Toggle pause
    togglePause() {
        this.practiceState.isPaused = !this.practiceState.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');

        if (this.practiceState.isPaused) {
            pauseBtn.textContent = 'Resume';
            clearInterval(this.practiceState.timerInterval);
            document.getElementById('typingInput').disabled = true;
        } else {
            pauseBtn.textContent = 'Pause';
            this.startTimer();
            document.getElementById('typingInput').disabled = false;
            document.getElementById('typingInput').focus();
        }
    }

    // Reset practice
    resetPractice() {
        this.practiceState.isActive = false;
        this.practiceState.isPaused = false;
        this.practiceState.currentIndex = 0;
        this.practiceState.errors = 0;
        this.practiceState.totalChars = 0;
        this.practiceState.correctChars = 0;

        clearInterval(this.practiceState.timerInterval);

        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('pauseBtn').classList.add('hidden');
        document.getElementById('typingInput').value = '';
        document.getElementById('typingInput').disabled = true;
        document.getElementById('specialKeyPrompt').classList.remove('active');

        this.updateStats();
        this.generateNewText();
    }

    // Start timer
    startTimer() {
        this.practiceState.timerInterval = setInterval(() => {
            this.updateStats();
        }, 100);
    }

    // Generate new text based on language and difficulty
    generateNewText() {
        const difficulty = this.getDifficultyLevel();

        // Randomly decide whether to include special key (if enabled)
        if (this.settings.includeSpecialKeys && Math.random() < 0.2) {
            this.generateSpecialKeyPrompt();
            return;
        }

        this.specialKeyMode = false;
        document.getElementById('specialKeyPrompt').classList.remove('active');

        let text = '';
        const language = this.settings.language;

        if (this.isCodeLanguage(language)) {
            text = this.generateCodeSnippet(language, difficulty);
        } else {
            text = this.generateNaturalText(language, difficulty);
        }

        this.practiceState.currentText = text;
        this.practiceState.currentIndex = 0;
        this.renderTargetText();

        if (this.practiceState.isActive) {
            document.getElementById('typingInput').value = '';
            document.getElementById('typingInput').focus();
        }
    }

    // Check if language is a programming language
    isCodeLanguage(lang) {
        return ['javascript', 'python', 'java', 'cpp', 'csharp', 'rust', 'go', 'typescript', 'html', 'css'].includes(lang);
    }

    // Get difficulty level based on skill
    getDifficultyLevel() {
        const level = this.skillData.level;
        if (level < 10) return 'easy';
        if (level < 30) return 'medium';
        if (level < 60) return 'hard';
        return 'expert';
    }

    // Generate special key prompt
    generateSpecialKeyPrompt() {
        const specialKeys = [
            { key: 'Enter', display: 'Enter ↵' },
            { key: 'Tab', display: 'Tab ⇥' },
            { key: 'Control', display: 'Ctrl' },
            { key: 'Alt', display: 'Alt' },
            { key: 'Shift', display: 'Shift ⇧' },
            { key: 'Escape', display: 'Esc' },
            { key: 'Backspace', display: 'Backspace ⌫' },
            { key: 'Delete', display: 'Delete' }
        ];

        this.currentSpecialKey = specialKeys[Math.floor(Math.random() * specialKeys.length)];
        this.specialKeyMode = true;

        const prompt = document.getElementById('specialKeyPrompt');
        prompt.innerHTML = `Press: <span class="key-display">${this.currentSpecialKey.display}</span>`;
        prompt.classList.add('active');

        document.getElementById('targetText').innerHTML = '';
        document.getElementById('typingInput').value = '';
    }

    // Generate code snippet
    generateCodeSnippet(language, difficulty) {
        const snippets = {
            javascript: [
                'const greeting = "Hello, World!";',
                'function add(a, b) { return a + b; }',
                'const numbers = [1, 2, 3, 4, 5];',
                'for (let i = 0; i < 10; i++) { console.log(i); }',
                'const obj = { key: "value", count: 42 };',
                'arr.map(x => x * 2).filter(x => x > 5);'
            ],
            python: [
                'def greet(name): return f"Hello, {name}"',
                'numbers = [x**2 for x in range(10)]',
                'import sys, os, json',
                'if __name__ == "__main__": main()',
                'class Person: def __init__(self, name): self.name = name',
                'with open("file.txt", "r") as f: data = f.read()'
            ],
            java: [
                'public class Main { public static void main(String[] args) {} }',
                'int[] numbers = {1, 2, 3, 4, 5};',
                'String message = "Hello World";',
                'for (int i = 0; i < 10; i++) { System.out.println(i); }',
                'List<String> list = new ArrayList<>();'
            ],
            cpp: [
                '#include <iostream>',
                'std::vector<int> vec = {1, 2, 3};',
                'int main() { return 0; }',
                'for (auto& item : collection) { process(item); }',
                'std::string str = "Hello";'
            ],
            html: [
                '<div class="container"><h1>Title</h1></div>',
                '<input type="text" id="name" placeholder="Enter name">',
                '<a href="#" onclick="handleClick()">Click me</a>',
                '<ul><li>Item 1</li><li>Item 2</li></ul>'
            ],
            css: [
                '.container { display: flex; justify-content: center; }',
                'body { margin: 0; padding: 0; font-family: Arial; }',
                '#header { background: #333; color: white; }',
                '.btn:hover { transform: scale(1.1); }'
            ]
        };

        // Swedish-specific code snippets with åöä characters
        const swedishSnippets = {
            javascript: [
                'const hälsning = "Hej, världen!";',
                'function läggTill(a, b) { return a + b; }',
                'const städer = ["Stockholm", "Göteborg", "Malmö"];',
                'const objekt = { nyckel: "värde", räknare: 42 };',
                'användare.forEach(u => console.log(u.ålder));'
            ],
            python: [
                'def hälsa(namn): return f"Hej, {namn}"',
                'städer = ["Stockholm", "Göteborg", "Malmö"]',
                'class Person: def __init__(self, namn, ålder): pass',
                'data = {"förnamn": "Erik", "ålder": 25}',
                'sträng = "åäö".upper()'
            ],
            java: [
                'String meddelande = "Hälsningar från Sverige";',
                'String[] städer = {"Stockholm", "Göteborg", "Malmö"};',
                'int ålder = 25; // Ålder i år',
                'List<String> länder = new ArrayList<>();'
            ],
            cpp: [
                'std::string hälsning = "Hej världen";',
                'std::vector<std::string> städer = {"Malmö", "Örebro"};',
                'char bokstäver[] = "åäö";'
            ],
            html: [
                '<h1>Välkommen till vår sida</h1>',
                '<p>Läs mer om våra tjänster här</p>',
                '<input type="text" placeholder="Ange ditt förnamn">',
                '<button>Lägg till</button>'
            ],
            css: [
                '.rubrik { färg: blå; bakgrund: grön; }',
                '/* Stöd för åäö i CSS-kommentarer */',
                '.knapp:hover { övergång: 0.3s; }'
            ]
        };

        let langSnippets = snippets[language] || snippets.javascript;

        // Use Swedish snippets if Swedish keyboard is selected
        if (this.settings.keyboardLayout === 'qwerty-swedish' && swedishSnippets[language]) {
            // Mix regular and Swedish snippets
            langSnippets = [...langSnippets, ...swedishSnippets[language]];
        }

        return langSnippets[Math.floor(Math.random() * langSnippets.length)];
    }

    // Generate natural language text
    generateNaturalText(language, difficulty) {
        const texts = {
            english: [
                'The quick brown fox jumps over the lazy dog.',
                'Practice makes perfect when learning to type.',
                'Keep your fingers on the home row keys.',
                'Touch typing is a valuable skill to develop.',
                'Regular practice will improve your typing speed.',
                'Focus on accuracy before worrying about speed.',
                'Good posture is important for comfortable typing.'
            ],
            spanish: [
                'El veloz murciélago hindú comía feliz cardillo.',
                'La práctica hace al maestro.',
                'Escribir sin mirar el teclado es útil.',
                'La constancia es la clave del éxito.'
            ],
            french: [
                'Portez ce vieux whisky au juge blond qui fume.',
                'La pratique rend parfait.',
                'Tapez sans regarder le clavier.',
                'La patience est une vertu.'
            ],
            german: [
                'Zwei flinke Boxer jagen die quirlige Eva.',
                'Übung macht den Meister.',
                'Schreiben ohne auf die Tastatur zu schauen.',
                'Geduld ist eine Tugend.'
            ]
        };

        const langTexts = texts[language] || texts.english;

        // Adjust length based on difficulty
        let text = langTexts[Math.floor(Math.random() * langTexts.length)];

        if (difficulty === 'easy') {
            text = text.slice(0, 30);
        } else if (difficulty === 'expert' && langTexts.length > 1) {
            text = langTexts[Math.floor(Math.random() * langTexts.length)] + ' ' +
                   langTexts[Math.floor(Math.random() * langTexts.length)];
        }

        return text;
    }

    // Render target text with character highlighting
    renderTargetText() {
        const targetDiv = document.getElementById('targetText');
        const text = this.practiceState.currentText;
        const currentIndex = this.practiceState.currentIndex;
        const input = document.getElementById('typingInput').value;

        let html = '';
        for (let i = 0; i < text.length; i++) {
            let className = 'char';

            if (i < input.length) {
                if (input[i] === text[i]) {
                    className += ' correct';
                } else {
                    className += ' incorrect';
                }
            } else if (i === input.length) {
                className += ' current';
            }

            const char = text[i] === ' ' ? '&nbsp;' : text[i];
            html += `<span class="${className}">${char}</span>`;
        }

        targetDiv.innerHTML = html;
    }

    // Handle input
    handleInput(e) {
        if (!this.practiceState.isActive || this.practiceState.isPaused || this.specialKeyMode) {
            return;
        }

        const input = e.target.value;
        const targetText = this.practiceState.currentText;

        this.practiceState.totalChars++;

        // Check if character is correct
        if (input[input.length - 1] === targetText[input.length - 1]) {
            this.practiceState.correctChars++;
        } else {
            this.practiceState.errors++;
        }

        this.renderTargetText();

        // Check if text is complete
        if (input === targetText) {
            this.completeText();
        }

        this.updateStats();
    }

    // Handle key down for special keys
    handleKeyDown(e) {
        if (!this.specialKeyMode || !this.practiceState.isActive) {
            return;
        }

        if (e.key === this.currentSpecialKey.key) {
            e.preventDefault();
            this.specialKeyCorrect();
        }
    }

    // Handle special key correct
    specialKeyCorrect() {
        this.practiceState.correctChars += 5; // Bonus for special keys
        this.practiceState.totalChars += 5;
        this.generateNewText();
        this.updateSkill(true);
    }

    // Complete current text
    completeText() {
        const elapsedTime = (Date.now() - this.practiceState.startTime) / 1000;
        const words = this.practiceState.currentText.split(' ').length;

        // Update skill data
        this.updateSkill(false);

        // Generate new text
        setTimeout(() => {
            this.generateNewText();
            this.practiceState.startTime = Date.now();
        }, 100);
    }

    // Update skill level
    updateSkill(isSpecialKey) {
        const accuracy = this.getCurrentAccuracy();
        const wpm = this.getCurrentWPM();

        // Calculate skill increase based on performance
        let skillIncrease = 0.1;

        if (accuracy > 95) skillIncrease += 0.2;
        if (accuracy > 98) skillIncrease += 0.3;
        if (wpm > 40) skillIncrease += 0.2;
        if (wpm > 60) skillIncrease += 0.3;
        if (isSpecialKey) skillIncrease += 0.5;

        const oldLevel = Math.floor(this.skillData.level);
        this.skillData.level += skillIncrease;
        const newLevel = Math.floor(this.skillData.level);

        // Update averages
        this.skillData.averageWPM = (this.skillData.averageWPM * 0.9) + (wpm * 0.1);
        this.skillData.averageAccuracy = (this.skillData.averageAccuracy * 0.9) + (accuracy * 0.1);

        this.saveSkillData();
        this.updateUI();

        // Celebrate level up
        if (newLevel > oldLevel) {
            this.celebrateLevelUp(newLevel);
        }
    }

    // Celebrate level up
    celebrateLevelUp(level) {
        const overlay = document.getElementById('celebrationOverlay');
        const title = document.getElementById('celebrationTitle');
        const message = document.getElementById('celebrationMessage');
        const closeButton = document.getElementById('closeCelebration');

        title.textContent = `🎉 Level ${level}! 🎉`;

        const messages = [
            "Great progress! Your typing skills are improving!",
            "Excellent work! Keep up the practice!",
            "Amazing! You're becoming a typing master!",
            "Fantastic! Your dedication is paying off!",
            "Outstanding! You're on fire!",
            "Incredible! Your fingers are flying!",
            "Superb! You're a typing champion!"
        ];

        message.textContent = messages[Math.floor(Math.random() * messages.length)];

        overlay.classList.remove('hidden');

        // Focus the close button instead of the input field
        setTimeout(() => {
            closeButton.focus();
        }, 100);

        // Rotate tips on level up
        this.displayTips();

        // Auto-close after 3 seconds
        setTimeout(() => {
            overlay.classList.add('hidden');
            // Return focus to typing input if practice is active
            if (this.practiceState.isActive && !this.practiceState.isPaused) {
                document.getElementById('typingInput').focus();
            }
        }, 3000);
    }

    // Close celebration
    closeCelebration() {
        document.getElementById('celebrationOverlay').classList.add('hidden');
    }

    // Update stats display
    updateStats() {
        const wpm = this.getCurrentWPM();
        const accuracy = this.getCurrentAccuracy();
        const elapsed = this.getElapsedTime();

        document.getElementById('wpm').textContent = Math.round(wpm);
        document.getElementById('accuracy').textContent = Math.round(accuracy) + '%';
        document.getElementById('timer').textContent = this.formatTime(elapsed);
    }

    // Get current WPM
    getCurrentWPM() {
        if (!this.practiceState.startTime) return 0;

        const elapsed = (Date.now() - this.practiceState.startTime) / 1000 / 60;
        if (elapsed === 0) return 0;

        const words = this.practiceState.correctChars / 5; // Standard: 5 chars = 1 word
        return words / elapsed;
    }

    // Get current accuracy
    getCurrentAccuracy() {
        if (this.practiceState.totalChars === 0) return 100;
        return (this.practiceState.correctChars / this.practiceState.totalChars) * 100;
    }

    // Get elapsed time
    getElapsedTime() {
        if (!this.practiceState.startTime) return 0;
        return Math.floor((Date.now() - this.practiceState.startTime) / 1000);
    }

    // Format time
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Update UI
    updateUI() {
        const level = Math.floor(this.skillData.level);
        const progress = (this.skillData.level % 1) * 100;

        document.getElementById('skillLevel').textContent = level;
        document.getElementById('skillProgress').style.width = progress + '%';
    }

    // Check if it's time for a break
    checkBreakTime() {
        if (!this.settings.enableBreaks || !this.practiceState.isActive) return;

        const elapsed = (Date.now() - this.practiceState.lastBreakTime) / 1000 / 60;

        if (elapsed >= this.settings.breakInterval) {
            this.startBreak();
        }
    }

    // Start break
    startBreak() {
        this.togglePause();

        const breakScreen = document.getElementById('breakScreen');
        breakScreen.classList.remove('hidden');

        const breakTips = [
            "Stretch your fingers and wrists gently.",
            "Look away from the screen and focus on something distant.",
            "Roll your shoulders to release tension.",
            "Take a few deep breaths and relax.",
            "Shake out your hands gently.",
            "Stand up and move around for a moment."
        ];

        document.getElementById('breakTip').textContent =
            breakTips[Math.floor(Math.random() * breakTips.length)];

        this.startBreakTimer();
    }

    // Start break timer
    startBreakTimer() {
        let timeLeft = 30;
        const timerDisplay = document.getElementById('breakTimer');

        const interval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(interval);
                this.endBreak();
            }
        }, 1000);

        // Store interval ID for skip functionality
        this.breakInterval = interval;
    }

    // End break
    endBreak() {
        document.getElementById('breakScreen').classList.add('hidden');
        this.practiceState.lastBreakTime = Date.now();

        if (this.practiceState.isPaused) {
            this.togglePause();
        }
    }

    // Skip break
    skipBreak() {
        if (this.breakInterval) {
            clearInterval(this.breakInterval);
        }
        this.endBreak();
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TypingPractice();
});
