import Phaser from 'phaser'

import CardsScene from './scenes/CardsScene';
import BoardScene from './scenes/BoardScene';

const config = {
	type: Phaser.AUTO,
	width: 1920,
	height: 900,
	backgroundColor: '#148C6A',
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	},
	scene: [BoardScene, CardsScene]
}


var game = new Phaser.Game(config);

