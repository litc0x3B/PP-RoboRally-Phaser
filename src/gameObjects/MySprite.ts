import GridManager from "../managers/GridManager";

export enum GameObjectIndex{
    inactive = -1,
    free = 0,
    wall = 1,
    pit = 2,
    checkpoint = 3,
    robot = 10
}

//////////////////////////////////////////CLASS_MYSPRITE///////////////////////////////////////////
export default class MySprite extends  Phaser.GameObjects.Sprite{
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