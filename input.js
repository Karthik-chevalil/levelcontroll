export class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false
        };

        this.touch = {
            left: false,
            right: false,
            jump: false
        };

        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));

        // Touch controls
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        const jumpBtn = document.getElementById('jump-btn');

        this.addTouchListener(leftBtn, 'left');
        this.addTouchListener(rightBtn, 'right');
        this.addTouchListener(jumpBtn, 'jump');
    }

    handleKey(e, isPressed) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = isPressed;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = isPressed;
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') this.keys.jump = isPressed;
    }

    addTouchListener(element, key) {
        if (!element) return;

        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touch[key] = true;
        });

        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch[key] = false;
        });
    }

    get isLeft() { return this.keys.left || this.touch.left; }
    get isRight() { return this.keys.right || this.touch.right; }
    get isJump() { return this.keys.jump || this.touch.jump; }
}
