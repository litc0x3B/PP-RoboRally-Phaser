<<<<<<< HEAD
import { Bounds } from 'matter';
import Phaser, { Game, GameObjects, Input, Tilemaps } from 'phaser'
import eventsCenter from './EventCenter';


enum GameObjectIndex{
    free = 0,
    inner_wall = 1,
    wall = 2,
    robot = 3
}

///////////////////////////////////////////CLASS_GRIDMANAGER/////////////////////////////////////
class GridManager{
    scene: Phaser.Scene;
    layer: Phaser.Tilemaps.TilemapLayer;
    tile_size: number;
    sprites: Set<MySprite> = new Set();

    
    constructor(scene: Phaser.Scene, layer: Phaser.Tilemaps.TilemapLayer, tile_size: number){
        this.layer = layer;
        this.scene = scene;
        this.tile_size = tile_size;
    }


    has(sprite: MySprite){
        return this.sprites.has(sprite);
    }

    getSpriteByPos(x: number, y: number) : MySprite | null {
        for (let sprite of this.sprites.values()){
            if (Math.abs(sprite.x - x) <= this.tile_size / 2 && Math.abs(sprite.y - y) <= this.tile_size / 2)
                return sprite;
        }
        return null;
    }

    getTileByPos(x: number, y: number){
        let tile = this.layer.getTileAtWorldXY(x, y, true);
        return tile;
    }

}

//////////////////////////////////////////CLASS_MYSPRITE///////////////////////////////////////////
class MySprite extends  Phaser.GameObjects.Sprite{
    index: GameObjectIndex;
    grid: GridManager;
    scene: Phaser.Scene;

    step_length = 32;
    command_duration = 300;
    forward_vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

    constructor(scene: Phaser.Scene, x: number, y: number, img: string, index: GameObjectIndex, grid: GridManager){
        super(scene, x, y, img);

        this.grid = grid;
        grid.sprites.add(this);

        this.index = index;
        this.scene = scene;
    }


    changePos(end_x: number, end_y: number)
    {
        this.scene.add.tween({
            targets: this,
            duration: this.command_duration,
            ease: 'Power4',
            x: end_x,
            y: end_y
        });
 
    }

    move(x: number, y: number) : boolean {
        let tile = this.grid.getTileByPos(x + this.x, y + this.y);
        let obj = this.grid.getSpriteByPos(x + this.x, y + this.y);
        if (tile.index == GameObjectIndex.free) {
            this.changePos(x + this.x, y + this.y);
            return true;
        }
        else
            return false;
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

}


////////////////////////////////CLASS_ROBOT///////////////////////////////////
class Robot extends MySprite {
    
    moves: Map <string, () => void> = new Map([
        ["moveForward", () => this.move(this.forward_vector.x * this.step_length, this.forward_vector.y * this.step_length)],
        ["moveBackward", () => this.move( (-this.forward_vector.x) * this.step_length, (-this.forward_vector.y) * this.step_length)],
        ["turnRight", () => this.turn(90)],
        ["turnLeft", () => this.turn(-90)]
    ]);

    constructor(scene: Phaser.Scene, x: number, y: number, img: string, grid: GridManager){
        super(scene, x, y, img, GameObjectIndex.robot, grid);
        this.scene = scene;
        this.type = "robot";
    }


    executeCommand(card_type) {
        let func = this.moves.get(card_type)?.bind(this);
        if (func) {func();}
    }

    makeMove (card_types: Array<string>, ind = 0) {
        this.executeCommand(card_types[ind])
        this.scene.time.delayedCall(this.command_duration, () => {this.makeMove(card_types, ind + 1)});
    }


    move(x: number, y: number) : boolean {
        let tile = this.grid.getTileByPos(x + this.x, y + this.y);
        let obj = this.grid.getSpriteByPos(x + this.x, y + this.y);

        var is_obj_robot = obj && obj.index == GameObjectIndex.robot;

        if ((tile.index == GameObjectIndex.free && !is_obj_robot) || 
            ((is_obj_robot) && obj?.move(this.forward_vector.x * this.step_length, this.forward_vector.y * this.step_length))) {

            this.changePos(x + this.x, y + this.y);
            return true;

        }
        else
            return false;
            
    }

}


///////////////////////////////SCENE////////////////////////////////////////////////////////////////
export default class BoardScene extends Phaser.Scene{

    clown!: Phaser.GameObjects.Image;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

   // makeMove(robot: Robot, card_types: Array<string>){
   //     this.time.delayedCall(robot.command_duration, () => robot.executeCommand(card_types[i]));
   //}

    preload(){
        this.load.image('clown', 'sprites/clown.png');
        this.load.image('tiles', [ 'sprites/drawtiles1.png', 'sprites/drawtiles1_n.png' ]);
        this.load.tilemapCSV('map', 'tilemaps/grid.csv');
    }

    create(){
        const TILE_SIZE = 32;

        var map = this.make.tilemap({ key: 'map', tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
        var tileset = map.addTilesetImage('tiles', undefined, TILE_SIZE, TILE_SIZE, 1, 2);
        var layer = map.createLayer(0, tileset, 0, 0)

        var grid = new GridManager(this, layer, TILE_SIZE);

        let robot1 = new Robot(this, 26/2 + TILE_SIZE, 32/2 + TILE_SIZE, 'clown', grid);
        let robot2 = new Robot(this, 26/2 + TILE_SIZE*2, 32/2 + TILE_SIZE, 'clown', grid);
        let robot3 = new Robot(this, 26/2 + TILE_SIZE*3, 32/2 + TILE_SIZE, 'clown', grid);

        this.add.existing(robot1);
        this.add.existing(robot2);
        this.add.existing(robot3);

        this.scene.launch("CardsScene");

        
        //robot1.makeMove(["moveForward", "moveForward","moveForward","moveForward","moveForward","moveForward","moveForward","moveForward", "turnRight","moveForward"]);
        eventsCenter.on("make-move", robot1.makeMove, robot1);
    }

    update(){  
        
    }

=======
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

>>>>>>> b9c6a8219d7026a7e47d1d245d74ea2ceadb0d39
}