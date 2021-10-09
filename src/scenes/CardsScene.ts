import Phaser from 'phaser'

class Card extends Phaser.GameObjects.Image{
    startX: number;
    startY: number;
    cardType: string;
    scene: Phaser.Scene;

    constructor(_scene :Phaser.Scene, x: number, y: number, texture: string, frame: string){
        super(_scene, x, y, texture, frame);
        this.startX = x;
        this.startY = y;
        this.cardType = frame.replace(".png","");
        this.scene = _scene;
    }

    addedToScene(){
        this.setInteractive();
        this.scene.input.setDraggable(this);
    }


}

class DropZone extends Phaser.GameObjects.Zone{
    card: Card;
    scene: Phaser.Scene;
    graphics: Phaser.GameObjects.Graphics;

    constructor(_scene: Phaser.Scene, x: number, y: number, width: number, height: number){
        super(_scene, x, y, width, height);
        this.setRectangleDropZone(width, height);
        this.scene = _scene;
        this.graphics = _scene.add.graphics();
        this.card = new Card(this.scene, 0, 0, 'empty', 'empty');
    }

    addedToScene(){
        this.graphics.lineStyle(2, 0x592D2D);
        this.graphics.strokeRect(this.x - this.input.hitArea.width / 2, this.y - this.input.hitArea.height / 2, this.input.hitArea.width, this.input.hitArea.height);
    }


}

export default class CardsScene extends Phaser.Scene
{
    output: Array<Phaser.GameObjects.Text> = [];
    zones: Array<DropZone> = [];

	constructor()
	{
		super('CardsScene')
	}

	preload()
    {
        //this.load.atlas('cards', 'cards/cards.png', 'cards/cards.json');
        this.load.setBaseURL('http://labs.phaser.io')
        this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
    }
    
    //create stack of cards
    cardsCreate(amount, x, y, width, height, margin){
        var frames = this.textures.get('cards').getFrameNames();

        for (var i = 0; i < amount; i++)
        {   
            var card = new Card(this, x, y, 'cards', Phaser.Math.RND.pick(frames));
            this.add.existing(card);

            x += margin + width;
        }
    }

    dropZonesCreate(amount, x, y, width, height, margin){


        for (var i = 0; i < amount; i++){
            let dropZone = new DropZone (this, x, y, width + margin, height + margin);
            this.add.existing(dropZone);
            this.zones.push(dropZone);
            x += width + margin;
        }
    }


    //cards movement logic
    cardsMovement(){
        this.input.on('dragstart', (pointer, gameObject) => {

            this.children.bringToTop(gameObject);

        }, this);

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

            gameObject.x = dragX;
            gameObject.y = dragY;

        });

        this.input.on('dragleave', (pointer, gameObject, _target) => {
            if (_target.card === gameObject){
                _target.card = new Card(this, 0, 0, 'empty', 'empty');
            }
        });

        var target: DropZone; 
        this.input.on('drop', function (pointer, gameObject, _target) {
            target = _target;
        });

        this.input.on('dragend', (pointer, gameObject, dropped) => {

            if (!dropped)
            {   
                if (target == null || (gameObject.x != target.x && gameObject.y != target.y)){
                    gameObject.x = gameObject.startX;
                    gameObject.y = gameObject.startY; 
                }
            }
            else
            {   
                target.card.x = target.card.startX;
                target.card.y = target.card.startY;
                
                target.card = gameObject;

                gameObject.x = target.x;
                gameObject.y = target.y;
            }

        });
    }
    
    //create DropZones for cards
    
    create ()
    {
        //cards sizes
        var width = 140;
        var height = 190;

        this.cardsCreate(8, 100, 450, width, height, 3);
        this.dropZonesCreate(5, 100, 200, width, height, 2);
        this.cardsMovement();
        
        //*********************debug********************
        for (var i = 0; i < this.zones.length; i++){
            this.output.push(this.add.text(1000, 100 + i * 20, "aboba"));
        }
        ////////////////////////////////////////////////
        
    }

    update(){
        /////////////////////////////////debug/////////////////////////
        for (var i = 0; i < this.output.length; i++){
            if (this.zones[i].card != null)
                this.output[i].text = this.zones[i].card.cardType;
                
        }
        ///////////////////////////////////////////////////////////////////
    }
}
