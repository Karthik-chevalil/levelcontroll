import { Levels } from './levels.js';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.tileSize = 40; // 800 / 20 = 40px
        this.rows = 15;
        this.cols = 20;
        this.tiles = []; // Array of tile objects
        this.startPos = { x: 0, y: 0 };
        this.goal = null;
    }

    loadLevel(levelIndex) {
        const levelData = Levels[levelIndex - 1];
        if (!levelData) return;

        this.tiles = [];
        this.startPos = { x: 50, y: 50 }; // Default
        this.goalTrolled = false; // Reset troll flag for new level

        const grid = levelData.grid;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const char = grid[r][c];
                const x = c * this.tileSize;
                const y = r * this.tileSize;

                // Base tile object
                const tile = {
                    x: x,
                    y: y,
                    width: this.tileSize,
                    height: this.tileSize,
                    type: 'empty',
                    solid: false,
                    deadly: false
                };

                switch (char) {
                    case '#': // Solid Block
                        tile.type = 'wall';
                        tile.solid = true;
                        tile.color = '#333';
                        this.tiles.push(tile);
                        break;
                    case '@': // Start
                        this.startPos = { x: x, y: y };
                        break;
                    case 'G': // Goal
                        tile.type = 'goal';
                        tile.color = '#f1c40f'; // Gold
                        this.tiles.push(tile);
                        this.goal = tile;
                        break;
                    case 'S': // Spike
                        tile.type = 'spike';
                        tile.deadly = true;
                        tile.solid = true; // Or false based on design preference, usually collisions check overlapping
                        tile.color = '#e74c3c';
                        this.tiles.push(tile);
                        break;
                    case 'F': // Fake Block
                        tile.type = 'fake';
                        tile.solid = false; // Player passes through
                        tile.color = '#333'; // Looks like wall
                        this.tiles.push(tile);
                        break;
                    case 'I': // Invisible Wall
                        tile.type = 'invisible';
                        tile.solid = true;
                        tile.color = 'rgba(0,0,0,0)'; // Invisible
                        this.tiles.push(tile);
                        break;
                    // Add more complex types later (moving platforms etc)
                    case 'M': // Moving Platform (Horizontal)
                        tile.type = 'moving';
                        tile.solid = true;
                        tile.color = '#3498db';
                        tile.vx = 2; // Speed
                        tile.startX = x;
                        tile.range = 100;
                        this.tiles.push(tile);
                        break;
                    case '^': // Moving Spike (Vertical)
                        tile.type = 'moving_spike';
                        tile.solid = true;
                        tile.deadly = true;
                        tile.color = '#e74c3c';
                        tile.vy = 2;
                        tile.startY = y;
                        tile.range = 80;
                        this.tiles.push(tile);
                        break;
                    case 'D': // Disappearing Block
                        tile.type = 'disappearing';
                        tile.solid = true; // Starts solid
                        tile.color = '#9b59b6';
                        tile.timer = 0;
                        tile.interval = 100; // Cycles every 100 frames (~1.6s)
                        this.tiles.push(tile);
                        break;
                    case 'B': // Falling Block
                        tile.type = 'falling';
                        tile.solid = true;
                        tile.color = '#7f8c8d'; // Grey
                        tile.falling = false;
                        tile.vy = 0;
                        tile.gravity = 0.5;
                        this.tiles.push(tile);
                        break;
                }
            }
        }
    }

    simplifyLevel3() {
        this.tiles = [];
        this.startPos = { x: 40, y: 7 * this.tileSize }; // Consistent with grid
        this.goalTrolled = true; // No more movement trolls

        const straightGrid = [
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "@..................G",
            "####################",
            "####################",
            "####################",
            "####################",
            "####################",
            "####################",
            "####################"
        ];

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const char = straightGrid[r][c];
                const x = c * this.tileSize;
                const y = r * this.tileSize;

                const tile = {
                    x: x,
                    y: y,
                    width: this.tileSize,
                    height: this.tileSize,
                    type: 'empty',
                    solid: false,
                    deadly: false
                };

                if (char === '#') {
                    tile.type = 'wall';
                    tile.solid = true;
                    tile.color = '#333';
                    this.tiles.push(tile);
                } else if (char === 'G') {
                    tile.type = 'goal';
                    tile.color = '#f1c40f';
                    this.tiles.push(tile);
                    this.goal = tile;
                } else if (char === '@') {
                    this.startPos = { x: x, y: y };
                }
            }
        }
    }

    simplifyLevel9() {
        this.tiles = [];
        this.startPos = { x: 40, y: 7 * this.tileSize };
        this.goalTrolled = true;

        const straightGrid = [
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "@..................G",
            "####################",
            "####################",
            "####################",
            "####################",
            "####################",
            "####################",
            "####################"
        ];

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const char = straightGrid[r][c];
                const x = c * this.tileSize;
                const y = r * this.tileSize;

                const tile = {
                    x: x,
                    y: y,
                    width: this.tileSize,
                    height: this.tileSize,
                    type: 'empty',
                    solid: false,
                    deadly: false
                };

                if (char === '#') {
                    tile.type = 'wall';
                    tile.solid = true;
                    tile.color = '#333';
                    this.tiles.push(tile);
                } else if (char === 'G') {
                    tile.type = 'goal';
                    tile.color = '#f1c40f';
                    this.tiles.push(tile);
                    this.goal = tile;
                } else if (char === '@') {
                    this.startPos = { x: x, y: y };
                }
            }
        }
    }

    update(deltaTime) {
        // Update dynamic tiles
        this.tiles.forEach(tile => {
            if (tile.type === 'moving') {
                tile.x += tile.vx;
                if (tile.x > tile.startX + tile.range || tile.x < tile.startX - tile.range) {
                    tile.vx *= -1;
                }
            } else if (tile.type === 'moving_spike') {
                tile.y += tile.vy;
                if (tile.y > tile.startY + tile.range || tile.y < tile.startY - tile.range) {
                    tile.vy *= -1;
                }
            } else if (tile.type === 'disappearing') {
                tile.timer++;
                if (tile.timer > tile.interval) {
                    tile.timer = 0;
                    tile.solid = !tile.solid; // Toggle State
                }
                // Visual opacity based on solid state
                // We'll handle drawing based on state
            } else if (tile.type === 'falling' && tile.falling) {
                tile.vy += tile.gravity;
                tile.y += tile.vy;
            }
        });
    }

    draw(ctx) {
        this.tiles.forEach(tile => {
            if (tile.type === 'invisible') {
                // Debug: draw faint outline? Or keep hidden.
                // ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                // ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);
                return;
            }

            if (tile.type === 'disappearing') {
                ctx.globalAlpha = tile.solid ? 1.0 : 0.2;
            } else {
                ctx.globalAlpha = 1.0;
            }

            ctx.fillStyle = tile.color;

            if (tile.type === 'spike' || tile.type === 'moving_spike') {
                // Draw triangle for spike
                ctx.beginPath();
                // Check orientation - for now assume pointing up or general hazard
                ctx.moveTo(tile.x, tile.y + tile.height);
                ctx.lineTo(tile.x + tile.width / 2, tile.y);
                ctx.lineTo(tile.x + tile.width, tile.y + tile.height);
                ctx.fill();
            } else {
                ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
            }
            ctx.globalAlpha = 1.0; // Reset
        });
    }

    // Collision Helper for AABB
    getTiles() {
        return this.tiles;
    }
}
