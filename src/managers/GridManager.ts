import Phaser from 'phaser'
import MySprite from '../gameObjects/MySprite'

///////////////////////////////////////////CLASS_GRIDMANAGER/////////////////////////////////////
export default class GridManager{
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