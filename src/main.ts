import Phaser from 'phaser'

import CardsScene from './scenes/CardsScene'

const config = {
	type: Phaser.AUTO,
	width: 2000,
	height: 600,
	backgroundColor: '#148C6A',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [CardsScene]
}

export default new Phaser.Game(config)
