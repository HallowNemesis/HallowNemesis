const monsters = {
    Emby: {
        position: {
            x: 280,
            y: 325
        },
        image: {
            src: '/assets/game/backgrounds/simple2d/embySprite.png'
        },
        frames: {
            max: 4,
            hold: 40
        },
        animate: true,
        name: 'Emby',
        attacks: [attacks.Tackle, attacks.Fireball, attacks.Fireball, attacks.Watershot]
    },
    Draggle: {
        position: {
            x: 800,
            y: 100
        },
        image: {
            src: '/assets/game/backgrounds/simple2d/draggleSprite.png'
        },
        frames: {
            max: 4,
            hold: 40
        },
        animate: true,
        isEnemy: true,
        name: 'Draggle',
        attacks: [attacks.Tackle, attacks.Watershot]
    },
    Ghost: {
        position: {
            x: 800,
            y: 100
        },
        image: {
            src: '/assets/game/backgrounds/simple2d/ghostevo.png'
        },
        frames: {
            max: 5,
            hold: 40
        },
        animate: true,
        isEnemy: true,
        name: 'Ghost',
        attacks: [attacks.Fireball, attacks.Watershot]
    }
};