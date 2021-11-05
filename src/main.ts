import Phaser from 'phaser'

const config = {
	type: Phaser.AUTO,
	width: 2000,
	height: 600,
	backgroundColor: '#148C6A',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0}
		}
	},
	scene: [BoardScene]
}

var game = new Phaser.Game(config);

//import CardsScene from './scenes/CardsScene';
import BoardScene from './scenes/BoardScene';

export default game;
