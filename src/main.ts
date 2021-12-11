import Phaser from 'phaser'

import CardsScene from './scenes/CardsScene';
import BoardScene from './scenes/BoardScene';

const config = {
	type: Phaser.AUTO,
	width: window.innerWidth - 10,
	height: window.innerHeight - 10,
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	},
	scene: [CardsScene, BoardScene]
}


var game = new Phaser.Game(config);

