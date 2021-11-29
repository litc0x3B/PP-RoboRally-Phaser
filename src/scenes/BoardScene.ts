import { Bounds } from 'matter';
import Phaser, { Game, Input } from 'phaser'
import eventsCenter from './EventCenter';

class Robot extends  Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body = this.body;
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
        //new Phaser.Physics.Arcade.Body(scene.game, this);
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
        this.body.setImmovable(true);
    }

}

export default class BoardScene extends Phaser.Scene{

    blcr!: Phaser.GameObjects.Image;
    block!:  Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
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
        this.block = this.physics.add.image(200, 300, 'block').setFriction(0);//.setDamping(true).setDrag(10);
        this.block.body.setImmovable();
        
        let robots = this.physics.add.group({});

        let robot1 = new Robot(this, 200, 200, 'clown');
        robots.add(robot1);
        this.add.existing(robot1);

        let robot2 = new Robot(this, 300, 300, 'clown');
        this.add.existing(robot2);
        robots.add(robot2);

        this.physics.add.collider(robots, robots);
        this.physics.add.collider(robots, this.block);
        

        this

        this.scene.launch("CardsScene");
        robot1.makeMove(["turnRight", "moveForward", "turnRight", "moveBackward"]);
        //eventsCenter.on("make-move", this.makeMove, this);
    }

    update(){  
        
    }

}