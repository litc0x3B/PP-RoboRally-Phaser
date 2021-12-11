import Phaser, { Game, GameObjects, Input, Tilemaps } from 'phaser'
import GridManager from '../managers/GridManager';
import MySprite, {GameObjectIndex} from './MySprite'


////////////////////////////////CLASS_ROBOT///////////////////////////////////
export default class Robot extends MySprite {
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
                this.resp.x = x + this.x;
                this.resp.y = y + this.y;
            }

            return true;
        }
        else
            return false;
            
    }

}