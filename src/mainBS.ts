import Phaser from 'phaser'

import BoardScene from './scenes/BoardScene'

const config = {
    type: Phaser.AUTO,
    width: 510,
    height: 510,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

export default new Phaser.Game(config)