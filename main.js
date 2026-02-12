/**
 * Main Entry Point
 */
import { Game } from './game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);

    // Start the game loop
    let lastTime = 0;
    function animate(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        game.update(deltaTime);
        game.draw();

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});
