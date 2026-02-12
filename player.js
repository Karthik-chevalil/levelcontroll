export class Player {
    constructor(game) {
        this.game = game;
        this.width = 30;
        this.height = 30;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpForce = -12;
        this.gravity = 0.6;
        this.grounded = false;
        this.color = '#2ecc71'; // Green player
    }

    reset(pos) {
        this.x = pos.x;
        this.y = pos.y;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.dead = false;
    }

    update(deltaTime) {
        if (this.dead) return;

        // Input
        if (this.game.input.isLeft) {
            this.vx = -this.speed;
        } else if (this.game.input.isRight) {
            this.vx = this.speed;
        } else {
            this.vx = 0;
        }

        if (this.game.input.isJump && this.grounded) {
            this.vy = this.jumpForce;
            this.grounded = false;
            this.game.audio.playJump();
        }

        // Physics
        this.vy += this.gravity;

        // Horizontal Movement & Collision
        this.x += this.vx;
        this.checkHorizontalCollision();

        // Vertical Movement & Collision
        this.y += this.vy;
        this.grounded = false; // Assume in air until collision proves otherwise
        this.checkVerticalCollision();

        // Bounds check (Death logic if falls off screen)
        if (this.y > this.game.height) {
            this.die();
        }
    }

    checkHorizontalCollision() {
        const tiles = this.game.levelManager.getTiles();
        for (const tile of tiles) {
            if (!tile.solid) continue; // Skip non-solid tiles like fake blocks

            if (this.checkRectCollision(this.x, this.y, this.width, this.height, tile.x, tile.y, tile.width, tile.height)) {
                if (tile.deadly) {
                    this.die();
                    return;
                }

                if (this.vx > 0) { // Moving Right
                    this.x = tile.x - this.width;
                } else if (this.vx < 0) { // Moving Left
                    this.x = tile.x + tile.width;
                }
                this.vx = 0;
            }
        }
    }

    checkVerticalCollision() {
        const tiles = this.game.levelManager.getTiles();
        for (const tile of tiles) {

            // Special check for goals (non-solid usually but we want to know if we hit it)
            if (tile.type === 'goal') {
                if (this.checkRectCollision(this.x, this.y, this.width, this.height, tile.x, tile.y, tile.width, tile.height)) {
                    this.game.winLevel();
                    return;
                }
            }

            if (!tile.solid) continue;

            if (this.checkRectCollision(this.x, this.y, this.width, this.height, tile.x, tile.y, tile.width, tile.height)) {
                if (tile.deadly) {
                    this.die();
                    return;
                }

                if (this.vy > 0) { // Falling down
                    this.y = tile.y - this.height;
                    this.grounded = true;
                    this.vy = 0;

                    // Trigger falling block
                    if (tile.type === 'falling') {
                        setTimeout(() => tile.falling = true, 200); // Slight delay before fall
                    }
                } else if (this.vy < 0) { // Jumping up
                    this.y = tile.y + tile.height;
                    this.vy = 0;
                }
            }
        }
    }

    checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
            x1 + w1 > x2 &&
            y1 < y2 + h2 &&
            y1 + h1 > y2;
    }

    die() {
        if (this.dead) return;
        this.dead = true;

        // Screen shake for frustration
        const container = document.getElementById('game-container');
        if (container) {
            container.classList.add('shake-it');
            setTimeout(() => container.classList.remove('shake-it'), 300);
        }

        this.game.onPlayerDeath();

        this.game.audio.playDeath();
        this.game.particles.emit(this.x + this.width / 2, this.y + this.height / 2, this.color, 30);

        // Respawn delay
        setTimeout(() => {
            if (this.game.state === 'PLAYING') {
                this.reset(this.game.levelManager.startPos);
                this.dead = false;
            }
        }, 500);
    }

    draw(ctx) {
        if (this.dead) return; // Don't draw if dead (maybe add particle effect later)

        ctx.fillStyle = this.color;

        // Simple Squash and Stretch
        let drawW = this.width;
        let drawH = this.height;
        let drawX = this.x;
        let drawY = this.y;

        if (!this.grounded) {
            // Stretch vertical
            drawH += 5;
            drawW -= 5;
            drawX += 2.5;
        } else if (Math.abs(this.vx) > 0.1) {
            // Tilt slightly or animate walking? Keep simple for now.
        }

        ctx.fillRect(drawX, drawY, drawW, drawH);

        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(drawX + 5, drawY + 8, 8, 8);
        ctx.fillRect(drawX + drawW - 13, drawY + 8, 8, 8);

        // Pupils
        ctx.fillStyle = 'black';
        ctx.fillRect(drawX + 7, drawY + 10, 4, 4);
        ctx.fillRect(drawX + drawW - 11, drawY + 10, 4, 4);
    }
}
