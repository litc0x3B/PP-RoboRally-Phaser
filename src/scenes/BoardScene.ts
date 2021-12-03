import { Bounds } from 'matter';
import Phaser, { Game, GameObjects, Input, Tilemaps } from 'phaser'
import eventsCenter from './EventCenter';


enum GameObjectIndex{
    inactive = -1,
    free = 0,
    wall = 1,
    pit = 2,
    checkpoint = 2,
    robot = 10
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
        let tile = this.layer.getTileAtWorldXY(x, y);
        return tile;
    }

}

//////////////////////////////////////////CLASS_MYSPRITE///////////////////////////////////////////
class MySprite extends  Phaser.GameObjects.Sprite{
    index: GameObjectIndex;
    grid: GridManager;
    scene: Phaser.Scene;
    command_duration = 300;
    anims_duration = 300;
    delay = 20;
    forward_vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

    constructor(scene: Phaser.Scene, x: number, y: number, img: string, index: GameObjectIndex, grid: GridManager){
        super(scene, x, y, img);

        this.grid = grid;
        grid.sprites.add(this);
        this.forward_vector.x *= grid.tile_size;

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

        this.scene.children.bringToTop(this);

        if (tile.index != GameObjectIndex.wall) {
            this.changePos(x + this.x, y + this.y);
            return true;
        }
        else
            return false;
    }

    turn(_angle: number){
        this.scene.children.bringToTop(this);
        this.forward_vector.rotate(Phaser.Math.DEG_TO_RAD * (_angle));

        this.scene.add.tween({
            targets: this,
            duration: this.command_duration,
            ease: 'Power4',
            angle: this.angle + _angle
        });
    }

}


////////////////////////////////CLASS_ROBOT///////////////////////////////////
class Robot extends MySprite {
    resp: Phaser.Math.Vector2;

    moves: Map <string, () => void> = new Map([
        ["moveForward", () => this.move(this.forward_vector.x, this.forward_vector.y)],
        ["moveBackward", () => this.move(-this.forward_vector.x, -this.forward_vector.y)],
        ["turnRight", () => this.turn(90)],
        ["turnLeft", () => this.turn(-90)]
    ]);

    constructor(scene: Phaser.Scene, x: number, y: number, img: string, grid: GridManager){
        super(scene, x, y, img, GameObjectIndex.robot, grid);

        this.resp = new Phaser.Math.Vector2(x, y);

        this.scene = scene;
        this.type = "robot";
    }


    executeCommand(card_type) {
        let func = this.moves.get(card_type)?.bind(this);
        if (func) {func();}
    }

    makeMove (card_types: Array<string>, ind = 0) {
        this.executeCommand(card_types[ind])
        this.scene.time.delayedCall(this.command_duration + this.anims_duration + this.delay, () => {this.makeMove(card_types, ind + 1)});
    }


    move(x: number, y: number) : boolean {
        this.scene.children.bringToTop(this);

        let tile = this.grid.getTileByPos(x + this.x, y + this.y);
        let obj = this.grid.getSpriteByPos(x + this.x, y + this.y);

        var is_obj_robot = obj && obj.index == GameObjectIndex.robot;

        //can robot move?
        if ((tile && tile.index != GameObjectIndex.wall && !is_obj_robot) || 
            ((is_obj_robot) && obj?.move(x, y))) {

            this.changePos(x + this.x, y + this.y);
            console.log(tile.index);
            
            //tile is a pit
            if (tile.index == GameObjectIndex.pit) {
                var start_scale = this.scale;
                this.index = GameObjectIndex.inactive;

                this.scene.add.tween({
                    targets: this,
                    duration: this.anims_duration,
                    ease: 'Power4',
                    delay: this.command_duration,
                    scale: 0,
                    onComplete: () => {
                        this.x = this.resp.x;
                        this.y = this.resp.y;
                        this.scale = start_scale;
                        this.index = GameObjectIndex.robot;
                    }
                });
            }

            //tile is a checkpoint
            if (tile.index == GameObjectIndex.checkpoint) {
                this.resp.x = this.x;
                this.resp.y = this.y;
            }

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

   HUD_top_border!: number;

   constructor()
	{
		super('BoardScene');
	}

    init(args: {top_border: number}){
        if (args.top_border){
            this.HUD_top_border = args.top_border;
        }
    }

    preload(){
        this.load.image('robot1', 'sprites/robot1.png');
        this.load.image('robot2', 'sprites/robot2.png');
        this.load.image('tileset', 'tiles/tileset.png');
        this.load.tilemapCSV('map', 'tilemaps/map.csv');
    }

    create(){
        var scene_height = this.sys.game.scale.gameSize.height;
        var scene_width = this.sys.game.scale.gameSize.width;  
        var tile_size = 95;  

        this.add.image(0, 0, 'tiles');
        var map = this.make.tilemap({ key: 'map', tileWidth: tile_size, tileHeight: tile_size });
        var tileset = map.addTilesetImage('tileset', undefined, tile_size, tile_size);
        var layer = map.createLayer(0, tileset);
        
        var scaleH = this.HUD_top_border / layer.height;
        var scaleW = scene_width / layer.width;
        var scale = scaleH < scaleW ? scaleH : scaleW;

        layer.scale = scale;    
        tile_size *= scale;

        var grid = new GridManager(this, layer, tile_size);

       var robot1_x = 1;
       var robot1_y = 1;
       var robot2_x = 2;
       var robot2_y = 1;
        
        let robot1 = new Robot(this, tile_size / 2 + tile_size * robot1_x, tile_size / 2 + tile_size * robot1_y, 'robot1', grid);
        robot1.scale = scale;
        let robot2 = new Robot(this, tile_size / 2 + tile_size * robot2_x, tile_size / 2 + tile_size * robot2_y, 'robot2', grid);
        robot2.scale = scale

        this.add.existing(robot1);
        this.add.existing(robot2);

        eventsCenter.on("make-move", robot1.makeMove, robot1);
    }

    update(){  
        
    }

}