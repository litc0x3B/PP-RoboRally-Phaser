import Phaser from 'phaser'
import eventsCenter from '~/managers/EventCenter';
import GridManager from '~/managers/GridManager';
import Robot from '~/gameObjects/Robot';



///////////////////////////////SCENE////////////////////////////////////////////////////////////////
export default class BoardScene extends Phaser.Scene{
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
        var robot2_x = 3;
        var robot2_y = 1;
        
        let robot1 = new Robot(this, tile_size / 2 + tile_size * robot1_x, tile_size / 2 + tile_size * robot1_y, 'robot1', grid);
        robot1.scale = scale;
        this.add.existing(robot1);

        let robot2 = new Robot(this, tile_size / 2 + tile_size * robot2_x, tile_size / 2 + tile_size * robot2_y, 'robot2', grid);
        robot2.scale = scale;
        this.add.existing(robot2);

        eventsCenter.on("make-move", robot1.makeMove, robot1);
    }

    update(){  
        
    }

}