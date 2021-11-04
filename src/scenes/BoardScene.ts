import Phaser, { Game, Input } from 'phaser'
import game from '~/mainBS';

new Phaser.Game(config);

preload(){
    this.load.setBaseURL('http://labs.phaser.io')
    this.load.image('block', 'assets/sprites/block.png');
    this.load.image('clown', 'assets/sprites/clown.png');
    this.load.image('grid', 'assets/pics/uv-grid-diag.png');
}

create(){
    this.add.image(0, 0, 'grid');
    blcr = this.physics.add.image(500, 288, 'block');
    block = this.physics.add.image(500, 100, 'block');
    clown = this.physics.add.image(160, 288, 'clown');
    
    blcr.setScale(0.1);
    clown.setScale(1);
    
    this.physics.moveToObject(clown, blcr, 50);

    collider = this.physics.add.overlap(clown,  blcr, function (clownOnBlock)
    {
        clownOnBlock.body.stop();
        this.physics.world.removeCollider(collider);
    }, null, this);

    cursors = this.input.keyboard.createCursorKeys();
}

update(){  
    if (cursors.left.isDown)
    {
        blcr.x -= 5;
    }

    if (cursors.right.isDown)
    {
        blcr.x += 5;
    }

    if (cursors.up.isDown)
    {
        blcr.y -= 5;
    }

    if (cursors.down.isDown)
    {
        blcr.y += 5;
    }
}