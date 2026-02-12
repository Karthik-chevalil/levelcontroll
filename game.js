import { InputHandler } from './input.js';
import { AudioManager } from './audio_manager.js';
import { LevelManager } from './level_manager.js';
import { Player } from './player.js';
import { ParticleSystem } from './particles.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.input = new InputHandler();
        this.audio = new AudioManager();
        this.particles = new ParticleSystem();
        this.levelManager = new LevelManager(this);
        this.player = new Player(this);

        this.state = 'MENU'; // MENU, PLAYING, PAUSED, WIN, GAME_OVER
        this.currentLevel = 1;
        this.maxLevels = 10;

        // Persistent Stats
        this.totalDeaths = parseInt(localStorage.getItem('levelDevil_totalDeaths')) || 0;
        this.totalTimePlayed = parseFloat(localStorage.getItem('levelDevil_totalTimePlayed')) || 0; // In milliseconds

        this.initUI();
        this.checkBanStatus();
        this.initMobileOptimizations();
    }

    initMobileOptimizations() {
        // Prevent context menu on long press (mobile)
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Handle resize if needed in future, current CSS handles aspect ratio scaling
        window.addEventListener('resize', () => {
            // We can pulse the UI or adjust scaling here if needed
        });
    }

    checkBanStatus() {
        if (localStorage.getItem('levelDevil_banned') === 'true') {
            this.banClicks = 0;
            setTimeout(() => {
                this.showPopup("YOU ARE NOT ELIGIBLE TO PLAY THIS GAME.", 10000);
                const startBtn = document.getElementById('start-btn');
                if (startBtn) {
                    startBtn.disabled = false; // Enable it so we can track clicks
                    startBtn.textContent = "BANNED";
                    startBtn.style.background = "#555";

                    // Secret Unban Mechanic
                    const unbanHandler = () => {
                        this.banClicks++;
                        this.showPopup(`ACCESS DENIED (${20 - this.banClicks})`, 500);
                        this.audio.playDeath(); // Annoying sound

                        if (this.banClicks >= 20) {
                            localStorage.removeItem('levelDevil_banned');
                            localStorage.setItem('levelDevil_unlocked', '1');
                            location.reload(); // Refresh to reset state
                        }
                    };

                    // Remove any existing listeners and add the new one
                    startBtn.onclick = unbanHandler;
                }
            }, 500);
        }
    }

    initUI() {
        // Screens
        this.screens = {
            home: document.getElementById('home-screen'),
            levelSelect: document.getElementById('level-select-screen'),
            hud: document.getElementById('hud'),
            pause: document.getElementById('pause-screen'),
            win: document.getElementById('win-screen'),
            stats: document.getElementById('stats-screen')
        };

        // Buttons
        document.getElementById('start-btn').addEventListener('click', () => {
            if (localStorage.getItem('levelDevil_banned') === 'true') return;
            this.setScreen('levelSelect');
            this.renderLevelGrid();
        });

        document.getElementById('stats-btn').addEventListener('click', () => {
            this.renderStats();
            this.setScreen('stats');
        });

        document.getElementById('stats-back-btn').addEventListener('click', () => {
            this.setScreen('home');
        });

        document.getElementById('back-to-home-btn').addEventListener('click', () => {
            this.setScreen('home');
        });

        document.getElementById('pause-btn').addEventListener('click', () => {
            if (this.state === 'PLAYING') this.togglePause();
        });

        document.getElementById('resume-btn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            this.setScreen('home');
        });

        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });

        // Cheat Console
        this.cheatConsole = document.getElementById('cheat-console');
        this.cheatInput = document.getElementById('cheat-input');

        document.getElementById('cheat-run-btn').addEventListener('click', () => this.handleCheatCommand());
        document.getElementById('cheat-close-btn').addEventListener('click', () => this.toggleCheat(false));

        this.cheatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleCheatCommand();
            if (e.key === 'Escape') this.toggleCheat(false);
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyT' && this.state !== 'PLAYING') {
                this.toggleCheat(true);
            }
        });
    }

    toggleCheat(show) {
        if (show) {
            this.cheatConsole.classList.remove('hidden');
            this.cheatInput.value = '';
            this.cheatInput.focus();
        } else {
            this.cheatConsole.classList.add('hidden');
        }
    }

    handleCheatCommand() {
        const cmd = this.cheatInput.value.trim().toLowerCase();
        if (cmd === 'unlock') {
            localStorage.setItem('levelDevil_unlocked', this.maxLevels.toString());
            this.showPopup("LEVELS UNLOCKED!", 3000);
            this.toggleCheat(false);
            if (this.screens.levelSelect.classList.contains('active')) {
                this.renderLevelGrid(); // Refresh grid if currently viewing
            }
        } else {
            this.showPopup("INVALID CODE", 1000);
        }
    }

    renderStats() {
        const timeDisplay = document.getElementById('stat-time');
        const deathDisplay = document.getElementById('stat-deaths');
        const trollMsg = document.getElementById('stat-troll-msg');

        // Format Time
        const totalSeconds = Math.floor(this.totalTimePlayed / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timeDisplay.textContent = `${minutes}m ${seconds}s`;

        // Format Deaths
        deathDisplay.textContent = this.totalDeaths;

        // Get Troll Message
        trollMsg.textContent = this.getTrollMessage();
    }

    getTrollMessage() {
        const totalSeconds = Math.floor(this.totalTimePlayed / 1000);

        if (this.totalDeaths === 0 && totalSeconds < 10) return "You haven't even started failing yet. How cute.";
        if (this.totalDeaths > 100) return "100+ deaths? Maybe this genre isn't for you.";
        if (this.totalDeaths > 50) return "Imagine dying 50 times and still thinking you're good.";
        if (totalSeconds > 600) return "10 minutes wasted on a square. Peak performance.";
        if (this.totalDeaths > 20) return "20 deaths? My keyboard could do better.";

        const genericTrolls = [
            "You're actually making me look bad.",
            "Is the screen on?",
            "I've seen bots with better reaction times.",
            "Wow. Just... wow.",
            "Maybe try a different game? Like Solitaire?"
        ];
        return genericTrolls[Math.floor(Math.random() * genericTrolls.length)];
    }

    startTrollMusic() {
        const container = document.getElementById('music-troll-container');
        if (!container || container.innerHTML !== '') return;

        // Embedding the requested track with autoplay and loop
        const videoId = 'X73mqThCp8w';
        container.innerHTML = `
            <iframe 
                width="1" 
                height="1" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0" 
                frameborder="0" 
                allow="autoplay">
            </iframe>
        `;
    }

    stopTrollMusic() {
        const container = document.getElementById('music-troll-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    setScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        Object.values(this.screens).forEach(s => s.classList.remove('active'));

        // Show target screen
        const screen = this.screens[screenName];
        if (screen) {
            screen.classList.remove('hidden');
            setTimeout(() => screen.classList.add('active'), 10);
        }

        if (screenName === 'home') this.state = 'MENU';
    }

    renderLevelGrid() {
        const grid = document.getElementById('level-grid');
        grid.innerHTML = '';
        const unlocked = parseInt(localStorage.getItem('levelDevil_unlocked')) || 1;

        for (let i = 1; i <= this.maxLevels; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;

            if (i > unlocked) {
                btn.classList.add('locked');
                btn.disabled = true;
            } else {
                btn.onclick = () => this.startLevel(i);
            }

            grid.appendChild(btn);
        }
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.levelDeaths = 0; // Reset deaths for this level check
        this.levelManager.loadLevel(levelIndex);
        this.player.reset(this.levelManager.startPos);

        // Music Control
        if (levelIndex === 3 && this.totalDeaths > 10) {
            this.startTrollMusic();
        } else {
            this.stopTrollMusic();
        }

        this.setScreen('hud');
        document.getElementById('level-indicator').textContent = `Level ${levelIndex}`;
        this.updateDeathUI();

        this.state = 'PLAYING';
    }

    onPlayerDeath() {
        this.levelDeaths++;
        this.totalDeaths++;
        localStorage.setItem('levelDevil_totalDeaths', this.totalDeaths.toString());
        this.updateDeathUI();

        // Music Pity Troll: More than 10 total deaths and Level 3 ONLY
        if (this.totalDeaths > 10 && this.currentLevel === 3) {
            this.startTrollMusic();
        }

        // Level 5 Redirect Troll: 20 deaths on Level 5 = Redirect (Triggered once only)
        if (this.currentLevel === 5 && this.levelDeaths === 20 && !localStorage.getItem('levelDevil_hasBeenTrolledL5')) {
            localStorage.setItem('levelDevil_hasBeenTrolledL5', 'true');
            window.location.href = "https://youtu.be/1irDLZlap64?si=KiRYN6Hzk76XXw-m";
            return;
        }

        // Hard Troll: More than 5 deaths on Level 1 = Redirect & Ban (Triggered once only per player)
        if (this.currentLevel === 1 && this.levelDeaths > 5 && !localStorage.getItem('levelDevil_hasBeenTrolled')) {
            localStorage.setItem('levelDevil_banned', 'true');
            localStorage.setItem('levelDevil_hasBeenTrolled', 'true');
            window.location.href = "https://youtu.be/e_04ZrNroTo?si=04CrP2ujXXztbb5F";
            return;
        }

        // Aggressive & Mocking Messages
        const messages = [
            "Are you even trying?",
            "My grandma plays better than this.",
            "Delete the game, honestly.",
            "That was embarrassing to watch.",
            "LOL. Again?",
            "Still stuck here?",
            "Maybe use your eyes next time?",
            "Is the keyboard plugged in?",
            "You're making this look hard.",
            "It's just a square. How did you lose?",
            "Error: Player skill not found.",
            "I'm actually bored watching you fail."
        ];

        // Specific Trolls
        if (this.currentLevel === 1 && this.levelDeaths === 3) {
            this.showPopup("It's Level 1... seriously?", 3000);
        } else if (this.currentLevel === 3 && this.levelDeaths === 11) {
            this.levelManager.simplifyLevel3();
            this.showPopup("YOU ARE PATHETIC. HERE, HAVE A ROAD.", 5000);
        } else if (this.currentLevel === 10) {
            if (this.levelDeaths === 10) {
                this.showPopup("WARNING: 5 MORE FAILS AND PROGRESS WILL BE WIPED.", 5000);
            } else if (this.levelDeaths >= 15) {
                localStorage.setItem('levelDevil_unlocked', '1');
                this.showPopup("PROGRESS WIPED. START OVER.", 5000);
                setTimeout(() => this.startLevel(1), 2000);
                return;
            }
        } else if (this.currentLevel === 9 && this.levelDeaths === 50) {
            this.levelManager.simplifyLevel9();
            this.showPopup("50 DEATHS? HERE, I MADE IT IMPOSSIBLE TO LOSE.", 5000);
        } else if (this.levelDeaths % 3 === 0) {
            const msg = messages[Math.floor(Math.random() * messages.length)];
            this.showPopup(msg, 2000);
        }
    }

    updateDeathUI() {
        const counter = document.getElementById('death-counter');
        if (counter) counter.textContent = `Total Fails: ${this.levelDeaths}`;
    }

    showPopup(text, duration = 2000) {
        const popup = document.getElementById('popup-message');
        if (!popup) return;

        popup.textContent = text;
        popup.classList.remove('hidden');
        popup.style.opacity = '1';
        popup.style.transform = `translate(-50%, -50%) scale(${1 + Math.random() * 0.2})`; // Random scale for annoyance

        // Clear previous timeout if exists
        if (this.popupTimeout) clearTimeout(this.popupTimeout);

        this.popupTimeout = setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.classList.add('hidden'), 300);
        }, duration);
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.screens.pause.classList.remove('hidden');
            this.screens.pause.classList.add('active');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.screens.pause.classList.remove('active');
            this.screens.pause.classList.add('hidden');
        }
    }

    winLevel() {
        if (this.state !== 'PLAYING') return;
        this.state = 'WIN';
        this.audio.playWin();

        // Unlock next level
        const unlocked = parseInt(localStorage.getItem('levelDevil_unlocked')) || 1;
        if (this.currentLevel >= unlocked && this.currentLevel < this.maxLevels) {
            localStorage.setItem('levelDevil_unlocked', this.currentLevel + 1);
        }

        // Custom Troll Message for Level 1
        const winTitle = this.screens.win.querySelector('h2');
        if (this.currentLevel === 1) {
            if (this.levelDeaths === 0) {
                winTitle.textContent = "WOW, A GENIUS! (Sarcastic)";
            } else if (this.levelDeaths > 5) {
                winTitle.textContent = "FINALLY! ONLY TOOK YOU FOREVER.";
            } else if (this.levelDeaths > 2) {
                winTitle.textContent = "REALLY? LEVEL 1 HAD YOU SHAKING.";
            } else {
                winTitle.textContent = "LEVEL COMPLETE... DO BETTER.";
            }
        } else {
            winTitle.textContent = "LUCKY WIN!";
        }

        this.setScreen('win');
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevels) {
            this.startLevel(this.currentLevel + 1);
        } else {
            this.setScreen('home'); // Game Complete
        }
    }

    update(deltaTime) {
        if (!isNaN(deltaTime)) {
            this.totalTimePlayed += deltaTime;
            // Periodically save to localStorage to avoid excessive writes, or just save every frame (it's small)
            localStorage.setItem('levelDevil_totalTimePlayed', this.totalTimePlayed.toString());
        }

        if (this.state === 'PLAYING') {
            this.player.update(deltaTime);
            this.levelManager.update(deltaTime);
            this.particles.update(deltaTime);

            // Goal Troll Mechanic: Goal moves away when you get close
            if (this.levelManager.goal && !this.levelManager.goalTrolled) {
                const dist = Math.sqrt(
                    Math.pow(this.player.x - this.levelManager.goal.x, 2) +
                    Math.pow(this.player.y - this.levelManager.goal.y, 2)
                );

                if (dist < 100) {
                    this.levelManager.goal.x += (this.player.x < this.levelManager.goal.x ? 80 : -80);
                    // Ensure it stays in bounds
                    if (this.levelManager.goal.x < 0) this.levelManager.goal.x = 80;
                    if (this.levelManager.goal.x > this.width - 40) this.levelManager.goal.x = this.width - 120;

                    this.levelManager.goalTrolled = true;
                    this.showPopup("Oop! Almost had it!", 1500);
                    this.audio.playDeath(); // Use a sad sound for the troll
                }
            }

            this.checkCollisions();
        }
    }

    checkCollisions() {
        // Player vs Level Objects collision logic will live here or in Player class
        // For simplicity, we can let Player handle it via access to LevelManager
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'WIN') {
            this.levelManager.draw(this.ctx);
            this.player.draw(this.ctx);
            this.particles.draw(this.ctx);
        }
    }
}
