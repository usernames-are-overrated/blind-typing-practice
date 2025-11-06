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
        this.applyDarkMode();
        this.bindEvents();
        this.updateUI();
        this.generateNewText();
        this.displayTips();

        if (!this.settings.showTips) {
            document.getElementById('tipsSection').classList.add('hidden');
        }

        // Enable typing input immediately
        document.getElementById('typingInput').disabled = false;
        document.getElementById('typingInput').focus();

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
            contentType: 'mixed',
            includeSpecialKeys: true,
            showTips: true,
            enableBreaks: true,
            breakInterval: 15,
            darkMode: false,
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

    // Apply dark mode
    applyDarkMode() {
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Bind event listeners
    bindEvents() {
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('settingsBackdrop').addEventListener('click', () => this.closeSettings());
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

        document.getElementById('contentType').addEventListener('change', (e) => {
            this.settings.contentType = e.target.value;
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

        document.getElementById('darkMode').addEventListener('change', (e) => {
            this.settings.darkMode = e.target.checked;
            this.saveSettings();
            this.applyDarkMode();
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
        document.getElementById('settingsBackdrop').classList.add('open');
        this.loadSettingsToUI();
    }

    // Close settings panel
    closeSettings() {
        document.getElementById('settingsPanel').classList.remove('open');
        document.getElementById('settingsBackdrop').classList.remove('open');
    }

    // Load settings to UI
    loadSettingsToUI() {
        document.getElementById('keyboardLayout').value = this.settings.keyboardLayout;
        document.getElementById('language').value = this.settings.language;
        document.getElementById('contentType').value = this.settings.contentType;
        document.getElementById('includeSpecialKeys').checked = this.settings.includeSpecialKeys;
        document.getElementById('showTips').checked = this.settings.showTips;
        document.getElementById('enableBreaks').checked = this.settings.enableBreaks;
        document.getElementById('breakInterval').value = this.settings.breakInterval;
        document.getElementById('darkMode').checked = this.settings.darkMode;
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
            this.applyDarkMode();
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

        document.getElementById('typingInput').focus();
        document.getElementById('typingInput').disabled = false;

        this.startTimer();
    }

    // Toggle pause
    togglePause() {
        this.practiceState.isPaused = !this.practiceState.isPaused;

        if (this.practiceState.isPaused) {
            clearInterval(this.practiceState.timerInterval);
            document.getElementById('typingInput').disabled = true;
        } else {
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

        document.getElementById('typingInput').value = '';
        document.getElementById('typingInput').focus();
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

        // Clear input first to prevent highlighting issues
        document.getElementById('typingInput').value = '';

        // Randomly decide whether to include special key (if enabled)
        if (this.settings.includeSpecialKeys && Math.random() < 0.2) {
            this.generateSpecialKeyPrompt();
            return;
        }

        this.specialKeyMode = false;

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
            document.getElementById('typingInput').placeholder = 'Start typing...';
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
        if (level < 25) return 'easy';
        if (level < 50) return 'medium';
        if (level < 75) return 'hard';
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

        // Show prompt in placeholder and target text
        const promptText = `Press: ${this.currentSpecialKey.display}`;
        document.getElementById('typingInput').placeholder = promptText;
        document.getElementById('targetText').innerHTML = `<span style="color: var(--text-secondary);">${promptText}</span>`;
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
        const contentType = this.settings.contentType;

        // Mixed mode - pick a random content type
        let actualContentType = contentType;
        if (contentType === 'mixed') {
            const types = ['typing-tips', 'lorem-ipsum', 'literature', 'quotes', 'conversation', 'facts'];
            actualContentType = types[Math.floor(Math.random() * types.length)];
        }

        switch (actualContentType) {
            case 'typing-tips':
                return this.generateTypingTips(difficulty);
            case 'lorem-ipsum':
                return this.generateLoremIpsum(difficulty);
            case 'literature':
                return this.generateLiterature(difficulty);
            case 'quotes':
                return this.generateQuotes(difficulty);
            case 'conversation':
                return this.generateConversation(difficulty);
            case 'facts':
                return this.generateFacts(difficulty);
            default:
                return this.generateTypingTips(difficulty);
        }
    }

    // Generate typing tips
    generateTypingTips(difficulty) {
        const tips = [
            'Keep your wrists elevated and straight while typing.',
            'Use the bumps on F and J keys to position your index fingers correctly.',
            'Practice typing common letter combinations like "th", "ch", and "ing".',
            'Type with a light touch - don\'t press keys too hard.',
            'Take breaks every 15 minutes to prevent repetitive strain injury.',
            'Focus on accuracy first, speed will come naturally with practice.',
            'Maintain good posture: back straight, feet flat on the floor.',
            'The home row keys are ASDF for the left hand and JKL; for the right hand.',
            'Use your pinky fingers for the shift keys, not your whole hand.',
            'Practice regularly for short periods rather than long marathon sessions.',
            'Don\'t look at the keyboard - trust your muscle memory.',
            'Use all ten fingers when typing, each finger has specific keys.',
            'Keep your eyes on the screen, not on the keyboard.',
            'Type in rhythm to develop consistent speed and accuracy.'
        ];
        return this.adjustTextLength(tips[Math.floor(Math.random() * tips.length)], difficulty);
    }

    // Generate lorem ipsum
    generateLoremIpsum(difficulty) {
        const texts = [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
            'Duis aute irure dolor in reprehenderit in voluptate velit.',
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
            'Qui officia deserunt mollit anim id est laborum et dolorum fuga.',
            'Et harum quidem rerum facilis est et expedita distinctio.',
            'Nam libero tempore, cum soluta nobis est eligendi optio.',
            'Temporibus autem quibusdam et aut officiis debitis aut rerum.',
            'Itaque earum rerum hic tenetur a sapiente delectus aut.'
        ];
        return this.adjustTextLength(texts[Math.floor(Math.random() * texts.length)], difficulty);
    }

    // Generate literature excerpts
    generateLiterature(difficulty) {
        const excerpts = [
            'It was the best of times, it was the worst of times.',
            'All happy families are alike; each unhappy family is unhappy in its own way.',
            'Call me Ishmael. Some years ago, never mind how long precisely.',
            'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.',
            'The sun shone, having no alternative, on the nothing new.',
            'Many years later, as he faced the firing squad, Colonel Aureliano Buendía recalled that distant afternoon.',
            'It was a bright cold day in April, and the clocks were striking thirteen.',
            'Ships at a distance have every man\'s wish on board.',
            'In my younger and more vulnerable years my father gave me some advice.',
            'Someone must have slandered Josef K., for one morning, without having done anything truly wrong, he was arrested.',
            'Once upon a time and a very good time it was there was a moocow coming down the road.',
            'Mother died today. Or maybe yesterday; I can\'t be sure.',
            'The past is a foreign country; they do things differently there.',
            'Happy families are all alike; every unhappy family is unhappy in its own way.'
        ];
        return this.adjustTextLength(excerpts[Math.floor(Math.random() * excerpts.length)], difficulty);
    }

    // Generate famous quotes
    generateQuotes(difficulty) {
        const quotes = [
            'The only way to do great work is to love what you do.',
            'In the middle of difficulty lies opportunity.',
            'Life is what happens when you\'re busy making other plans.',
            'The future belongs to those who believe in the beauty of their dreams.',
            'It does not matter how slowly you go as long as you do not stop.',
            'Everything you\'ve ever wanted is on the other side of fear.',
            'Believe you can and you\'re halfway there.',
            'The only impossible journey is the one you never begin.',
            'Success is not final, failure is not fatal: it is the courage to continue that counts.',
            'Don\'t watch the clock; do what it does. Keep going.',
            'The best time to plant a tree was 20 years ago. The second best time is now.',
            'Your time is limited, don\'t waste it living someone else\'s life.',
            'Whether you think you can or you think you can\'t, you\'re right.',
            'The only limit to our realization of tomorrow is our doubts of today.'
        ];
        return this.adjustTextLength(quotes[Math.floor(Math.random() * quotes.length)], difficulty);
    }

    // Generate conversation snippets
    generateConversation(difficulty) {
        const conversations = [
            'How are you doing today? I\'m doing great, thanks for asking!',
            'Would you like some coffee? Yes, please, with milk and sugar.',
            'What time is the meeting? It starts at 3 PM in the conference room.',
            'Did you see that movie? Yes, it was absolutely fantastic!',
            'Can you help me with this? Of course, what do you need?',
            'Where are you going? I\'m heading to the store to buy groceries.',
            'Have you finished the report? Almost done, I just need another hour.',
            'What do you think about this? I think it\'s a great idea!',
            'How was your weekend? It was wonderful, I went hiking in the mountains.',
            'Do you want to grab lunch? Sure, where would you like to go?',
            'Is everything okay? Yes, everything is fine, don\'t worry.',
            'When will you be back? I\'ll be back around 5 o\'clock.',
            'Did you hear the news? No, what happened?',
            'Can I ask you something? Of course, go ahead and ask.'
        ];
        return this.adjustTextLength(conversations[Math.floor(Math.random() * conversations.length)], difficulty);
    }

    // Generate interesting facts
    generateFacts(difficulty) {
        const facts = [
            'Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs.',
            'Octopuses have three hearts and blue blood.',
            'A day on Venus is longer than a year on Venus.',
            'Bananas are berries, but strawberries are not.',
            'The shortest war in history lasted only 38 minutes.',
            'A group of flamingos is called a flamboyance.',
            'Butterflies can taste with their feet.',
            'The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.',
            'Sharks have been around longer than trees.',
            'Your brain uses 20% of your body\'s energy but is only 2% of your body weight.',
            'Wombat poop is cube-shaped.',
            'The longest English word without a vowel is "rhythms".',
            'A bolt of lightning is five times hotter than the surface of the sun.',
            'Polar bears have black skin under their white fur.'
        ];
        return this.adjustTextLength(facts[Math.floor(Math.random() * facts.length)], difficulty);
    }

    // Adjust text length based on difficulty
    adjustTextLength(text, difficulty) {
        if (difficulty === 'easy') {
            return text.slice(0, Math.min(40, text.length));
        } else if (difficulty === 'expert') {
            // For expert, sometimes combine two sentences
            return text;
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
        // Auto-start practice when user starts typing
        if (!this.practiceState.isActive) {
            this.startPractice();
        }

        if (this.practiceState.isPaused || this.specialKeyMode) {
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

        // Calculate skill change based on performance (0-100 scale)
        let skillChange = 0;

        // Accuracy-based adjustment
        if (accuracy >= 98) {
            skillChange += 0.8;
        } else if (accuracy >= 95) {
            skillChange += 0.5;
        } else if (accuracy >= 90) {
            skillChange += 0.2;
        } else if (accuracy < 80) {
            skillChange -= 0.3;
        } else if (accuracy < 85) {
            skillChange -= 0.1;
        }

        // WPM-based adjustment (relative to skill level)
        const expectedWPM = 20 + (this.skillData.level * 0.6); // Expected WPM increases with skill
        if (wpm > expectedWPM + 10) {
            skillChange += 0.5;
        } else if (wpm > expectedWPM) {
            skillChange += 0.2;
        } else if (wpm < expectedWPM - 10) {
            skillChange -= 0.2;
        }

        // Special key bonus
        if (isSpecialKey) {
            skillChange += 0.5;
        }

        // Apply skill change with bounds
        const oldLevel = this.skillData.level;
        this.skillData.level = Math.max(0, Math.min(100, this.skillData.level + skillChange));

        // Update averages
        this.skillData.averageWPM = (this.skillData.averageWPM * 0.9) + (wpm * 0.1);
        this.skillData.averageAccuracy = (this.skillData.averageAccuracy * 0.9) + (accuracy * 0.1);

        this.saveSkillData();
        this.updateUI();

        // Celebrate milestone (every 10 points)
        const oldMilestone = Math.floor(oldLevel / 10);
        const newMilestone = Math.floor(this.skillData.level / 10);
        if (newMilestone > oldMilestone) {
            this.celebrateLevelUp(Math.floor(this.skillData.level));
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

        document.getElementById('skillLevel').textContent = level;
        document.getElementById('skillProgress').style.width = level + '%';
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
