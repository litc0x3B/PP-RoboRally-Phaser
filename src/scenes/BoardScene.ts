import Phaser, { Game, Input } from 'phaser'
import game from '~/main';

export default class BoardScene extends Phaser.Scene{

    blcr!: Phaser.GameObjects.Image;
    block!: Phaser.GameObjects.Image;
    clown!: Phaser.GameObjects.Image;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;



    preload(){
        this.load.setBaseURL('http://labs.phaser.io')
        this.load.image('block', 'assets/sprites/block.png');
        this.load.image('clown', 'assets/sprites/clown.png');
        this.load.image('grid', 'assets/pics/uv-grid-diag.png');
    }

    create(){
        this.add.image(0, 0, 'grid');
        this.blcr = this.physics.add.image(500, 288, 'block');
        this.block = this.physics.add.image(500, 100, 'block');
        this.clown = this.physics.add.image(160, 288, 'clown');


        this.blcr.setScale(0.1);
        this.clown.setScale(1);

        this.physics.moveToObject(this.clown, this.blcr, 50);

        var collider = this.physics.add.overlap(this.clown, this.blcr, (clownOnBlock) => {
            clownOnBlock.body.stop();
            this.physics.world.removeCollider(collider);
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.scene.launch("CardsScene");
    }

    update(){  
        if (this.cursors.left.isDown)
        {
            this.blcr.x -= 5;
        }

        if (this.cursors.right.isDown)
        {
            this.blcr.x += 5;
        }

        if (this.cursors.up.isDown)
        {
            this.blcr.y -= 5;
        }

        if (this.cursors.down.isDown)
        {
            this.blcr.y += 5;
        }
    }
}