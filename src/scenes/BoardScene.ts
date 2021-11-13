import Phaser, { Game, Input } from 'phaser'
import eventsCenter from './EventCenter';

class Robot extends Phaser.GameObjects.Sprite {
    scene: Phaser.Scene;

    step_length = 50;
    command_duration = 1000;
    forward_vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

    moves: Map <string, () => void> = new Map([
        ["moveForward", () => this.moveTo(this.forward_vector.x * this.step_length + this.x, this.forward_vector.y * this.step_length + this.y, this.command_duration)],
        ["moveBackward", () => this.moveTo( (-this.forward_vector.x) * this.step_length + this.x, (-this.forward_vector.y) * this.step_length + this.y, this.command_duration)],
        ["turnRight", () => this.turn(90)],
        ["turnLeft", () => this.turn(-90)]
    ]);

    constructor(scene: Phaser.Scene, x: number, y: number, img: string){
        super(scene, x, y, img);
        this.scene = scene;
    }

    executeCommand(card_type){
        let func = this.moves.get(card_type)?.bind(this);
        if (func) {func();}
    }

    makeMove (card_types: Array<string>, ind = 0){
        this.executeCommand(card_types[ind])
        this.scene.time.delayedCall(this.command_duration, () => {this.makeMove(card_types, ind + 1)});
    }


    turn(_angle: number){
        this.scene.add.tween({
            targets: this,
            duration: this.command_duration,
            ease: 'Power4',
            angle: this.angle + _angle
        });
        this.forward_vector.rotate(Phaser.Math.DEG_TO_RAD * (this.angle + _angle))
    }

    moveTo(end_x: number, end_y: number, duration: number){
        this.scene.physics.moveTo(this, end_x, end_y, 60, duration);
        
        this.scene.time.delayedCall(duration, () => {
             this.body.velocity.x = 0;
             this.body.velocity.y = 0;
             console.log(this.x);
             console.log(this.y);
             
            } ); 
    }

    addedToScene(){
        this.scene.physics.add.existing(this);
    }

}

export default class BoardScene extends Phaser.Scene{

    blcr!: Phaser.GameObjects.Image;
    block!: Phaser.GameObjects.Image;
    clown!: Phaser.GameObjects.Image;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    // makeMove(robot: Robot, card_types: Array<string>){
    //     this.time.delayedCall(robot.command_duration, () => robot.makeMove(card_types[i]));
    // }

    preload(){
        this.load.setBaseURL('http://labs.phaser.io')
        this.load.image('block', 'assets/sprites/block.png');
        this.load.image('clown', 'assets/sprites/clown.png');
        this.load.image('grid', 'assets/pics/uv-grid-diag.png');
    }

    create(){
        
        
        this.add.image(0, 0, 'grid');
        this.block = this.physics.add.image(200, 300, 'block').setDamping(true).setDrag(0.1);
        

        let robot = new Robot(this, 200, 200, 'clown');

        this.physics.add.collider(robot, this.block);
        this.add.existing(robot);

        this.scene.launch("CardsScene");
        robot.makeMove(["turnRight", "moveForward", "turnRight", "moveBackward"]);
        //eventsCenter.on("make-move", this.makeMove, this);
    }

    update(){  
        
    }

}