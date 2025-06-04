const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 640;

const scaledCanvas = {
    width: canvas.width / 4,
    height: canvas.height / 4,
}

const gravity = 0.2;

const floorCollisions2D = [];
for (let i = 0; i < floorCollisions.length; i += 36) {
    floorCollisions2D.push(floorCollisions.slice(i, i + 36));
}

const collisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            collisionBlocks.push(new CollisionBlock({
                position: {
                    x: x * 16,
                    y: y * 16,
                },
            })
            )
        }
    })
})

const platformCollisions2D = [];
for (let i = 0; i < platformCollisions.length; i += 36) {
    platformCollisions2D.push(platformCollisions.slice(i, i + 36));
}

const platformCollisionBlocks = [];
platformCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            platformCollisionBlocks.push(new CollisionBlock({
                position: {
                    x: x * 16,
                    y: y * 16,
                },
                height: 4,
            })
            )
        }
    })
})

const player = new Player({
    position: {
        x: 100,
        y: 300,
    },
    collisionBlocks,
    platformCollisionBlocks,
    imageSrc: '/assets/game/entities/warrior/Idle.png',
    frameRate: 8,
    animations: {
        Idle: {
            imageSrc: '/assets/game/entities/warrior/Idle.png',
            frameRate: 8,
            frameBuffer: 12,
        },
        IdleLeft: {
            imageSrc: '/assets/game/entities/warrior/IdleLeft.png',
            frameRate: 8,
            frameBuffer: 12,
        },
        Run: {
            imageSrc: '/assets/game/entities/warrior/Run.png',
            frameRate: 8,
            frameBuffer: 8,
        },
        RunLeft: {
            imageSrc: '/assets/game/entities/warrior/RunLeft.png',
            frameRate: 8,
            frameBuffer: 8,
        },
        Jump: {
            imageSrc: '/assets/game/entities/warrior/Jump.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        JumpLeft: {
            imageSrc: '/assets/game/entities/warrior/JumpLeft.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        Fall: {
            imageSrc: '/assets/game/entities/warrior/Fall.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        FallLeft: {
            imageSrc: '/assets/game/entities/warrior/FallLeft.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        Attack1: {
            imageSrc: '/assets/game/entities/warrior/Attack1.png',
            frameRate: 4,
            frameBuffer: 5,
        },
        Attack2: {
            imageSrc: '/assets/game/entities/warrior/Attack2.png',
            frameRate: 4,
            frameBuffer: 10,
        },
        Attack3: {
            imageSrc: '/assets/game/entities/warrior/Attack3.png',
            frameRate: 4,
            frameBuffer: 15,
        },
        Death: {
            imageSrc: '/assets/game/entities/warrior/Death.png',
            frameRate: 6,
            frameBuffer: 20,
        },
        GetHit: {
            imageSrc: '/assets/game/entities/warrior/TakeHit.png',
            frameRate: 4,
            frameBuffer: 5,
        },
    }
});

const enemies = [];
// const enemy = new Enemy({
//     position: {
//         x: 120,
//         y: 300,
//     },
//     collisionBlocks,
//     platformCollisionBlocks,
//     imageSrc: '/assets/game/entities/warrior/Idle.png',
//     frameRate: 8,
//     animations: {
//         Idle: {
//             imageSrc: '/assets/game/entities/warrior/Idle.png',
//             frameRate: 8,
//             frameBuffer: 12,
//         },
//         IdleLeft: {
//             imageSrc: '/assets/game/entities/warrior/IdleLeft.png',
//             frameRate: 8,
//             frameBuffer: 12,
//         },
//         Run: {
//             imageSrc: '/assets/game/entities/warrior/Run.png',
//             frameRate: 8,
//             frameBuffer: 8,
//         },
//         RunLeft: {
//             imageSrc: '/assets/game/entities/warrior/RunLeft.png',
//             frameRate: 8,
//             frameBuffer: 8,
//         },
//         Jump: {
//             imageSrc: '/assets/game/entities/warrior/Jump.png',
//             frameRate: 2,
//             frameBuffer: 3,
//         },
//         JumpLeft: {
//             imageSrc: '/assets/game/entities/warrior/JumpLeft.png',
//             frameRate: 2,
//             frameBuffer: 3,
//         },
//         Fall: {
//             imageSrc: '/assets/game/entities/warrior/Fall.png',
//             frameRate: 2,
//             frameBuffer: 3,
//         },
//         FallLeft: {
//             imageSrc: '/assets/game/entities/warrior/FallLeft.png',
//             frameRate: 2,
//             frameBuffer: 3,
//         },
//         Attack1: {
//             imageSrc: '/assets/game/entities/warrior/Attack1.png',
//             frameRate: 4,
//             frameBuffer: 5,
//         },
//         Attack2: {
//             imageSrc: '/assets/game/entities/warrior/Attack2.png',
//             frameRate: 4,
//             frameBuffer: 10,
//         },
//         Attack3: {
//             imageSrc: '/assets/game/entities/warrior/Attack3.png',
//             frameRate: 4,
//             frameBuffer: 15,
//         },
//         Death: {
//             imageSrc: '/assets/game/entities/warrior/Death.png',
//             frameRate: 6,
//             frameBuffer: 20,
//         },
//         GetHit: {
//             imageSrc: '/assets/game/entities/warrior/TakeHit.png',
//             frameRate: 4,
//             frameBuffer: 5,
//         },
//     }
// });

const keys = {
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
    s: {
        pressed: false,
    },
    f: {
        pressed: false,
    },
    g: {
        pressed: false,
    },
    v: {
        pressed: false,
    }
}

const defaultBackground = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: '/assets/game/backgrounds/platform/background.png',
})

const backgroundImageHeight = 432;

const camera = {
    position: {
        x: 0,
        y: -backgroundImageHeight + scaledCanvas.height,
    },
}



function animate() {
    window.requestAnimationFrame(animate);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // backgroundArray.forEach(object => object.update());
    ctx.save();
    ctx.scale(4, 4);
    ctx.translate(camera.position.x, camera.position.y);
    defaultBackground.update();

    collisionBlocks.forEach((collisionBlock) => {
        collisionBlock.update();
    });

    platformCollisionBlocks.forEach((block) => {
        block.update();
    });

    player.checkForHorizontalCanvasCollision();
    player.update();

    player.velocity.x = 0;

    if (player.currentlife >= 0) {
        if (keys.a.pressed) {
            player.switchSprite('RunLeft');
            player.velocity.x = -1;
            player.lastDirection = 'left';
            player.shouldPanCameraRight({ canvas, camera });
        }
        else if (keys.s.pressed) player.velocity.y = 0;
        else if (keys.d.pressed) {
            player.switchSprite('Run');
            player.velocity.x = 1;
            player.lastDirection = 'right';
            player.shouldPanCameraLeft({ canvas, camera });
        }
        else if (player.velocity.y === 0 && player.velocity.x === 0) {
            if (player.lastDirection === 'right') player.switchSprite('Idle');
            else player.switchSprite('IdleLeft');
        }

        if (player.velocity.y < 0) {
            player.shouldPanCameraDown({ camera, canvas });
            if (player.lastDirection === 'right') player.switchSprite('Jump');
            else player.switchSprite('JumpLeft');
        } else if (player.velocity.y > 0) {
            player.shouldPanCameraUp({ camera, canvas });
            if (player.lastDirection === 'right') player.switchSprite('Fall');
            else player.switchSprite('FallLeft');
        }
    }
    else {
        player.switchSprite('Death');
    }


    // enemy.checkForHorizontalCanvasCollision();
    // enemy.update();
    // enemy.velocity.x = 0;

    /*Create collision between objects*/

    //Must create enemies as well.

    /*Create the damage function */

    // receivedDamage = damage(enemies, player);
    // player.currentlife -= receivedDamage;

    if (keys.f.pressed) {
        player.switchSprite('Attack1');
    }

    else if (keys.g.pressed) {
        player.switchSprite('Attack2');
    }

    else if (keys.v.pressed) {
        player.switchSprite('Attack3');
    }

    ctx.restore();
}

animate();

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case ' ':
        case 'w':
            player.velocity.y = -5;
            break;
        case 'a':
            keys.a.pressed = true;
            break;
        case 's':
            keys.s.pressed = true;
            break;
        case 'd':
            keys.d.pressed = true;
            break;
        case 'f':
            keys.f.pressed = true;
            break;
        case 'g':
            keys.g.pressed = true;
            break;
        case 'v':
            keys.v.pressed = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case 'f':
            keys.f.pressed = false;
            break;
        case 'g':
            keys.g.pressed = false;
            break;
        case 'v':
            keys.v.pressed = false;
            break;
    }
});

window.onkeydown = function (e) { return !(e.key == ' ' && e.target == document.body); };