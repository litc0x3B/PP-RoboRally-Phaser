import Phaser, { Game, Input } from 'phaser'

// enum CardTypes {
//     move_forward = "move_forward",
//     move_backward = "move_backward",
//     rotate_right = "rotate_right",
//     rotate_left = "rotate_left" 
// }

 class Card extends Phaser.GameObjects.Image{
    startX: number;
    startY: number;
    cardType: string;
    scene: Phaser.Scene;
    draggingFrom: DropZone | null = null;

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

    dragStart(dropZone: DropZone | null){
        if (dropZone && dropZone.card && this === dropZone.card){
            this.draggingFrom = dropZone;
            dropZone.card = null;
            console.debug("replacing");
        }
    }

    move(object: Card, end_x: number, end_y: number){
        this.scene.add.tween({
            targets: object,
            duration: 300,
            ease: 'Power4',
            x: end_x,
            y: end_y
        });
    };

    setDropZone(dropZone: DropZone | null) {
        if(dropZone) {

            if(this.draggingFrom){
                this.draggingFrom.card = dropZone.card;
            }

            if (dropZone.card){
                this.move(dropZone.card, this.input.dragStartX, this.input.dragStartY);

                [dropZone.card.startX, this.startX] = [this.startX, dropZone.card.startX];
                [dropZone.card.startY, this.startY] = [this.startY, dropZone.card.startY];
            }

            dropZone.card = this;
            
            this.move(this, dropZone.x, dropZone.y);
        }
        else if (this.x != this.input.dragStartX && this.y != this.input.dragStartY) {
            this.move(this, this.startX, this.startY);
        }

        this.draggingFrom = null;
    }


}

export class DropZone extends Phaser.GameObjects.Zone{
    card: Card | null = null;
    scene: Phaser.Scene;
    graphics: Phaser.GameObjects.Graphics;
    color: number;

    constructor(_scene: Phaser.Scene, x: number, y: number, width: number, height: number, color : number){
        super(_scene, x, y, width, height);
        this.color = color
        this.setRectangleDropZone(width, height);
        this.scene = _scene;
        this.graphics = _scene.add.graphics();
    }

    addedToScene(){
        this.graphics.lineStyle(2, this.color);
        this.graphics.strokeRect(this.x - this.input.hitArea.width / 2, this.y - this.input.hitArea.height / 2, this.input.hitArea.width, this.input.hitArea.height);
    }

    getCardType(): string{
        if (this.card?.cardType)
            return this.card.cardType;
        else
            return "empty";
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
    cardsCreate(amount, x, y, width, height, margin, scale_multiplier){
        var frames = this.textures.get('cards').getFrameNames();

        for (var i = 0; i < amount; i++) 
        {   
            var card = new Card(this, x, y, 'cards', Phaser.Math.RND.pick(frames));
            card.scale = scale_multiplier;

            this.add.existing(card);

            x += (margin + width) * scale_multiplier;
        }
    }

    //create DropZones for cards
    dropZonesCreate(amount, x, y, width, height, margin, scale_multiplier, color){

        for (var i = 0; i < amount; i++) 
        {
            let dropZone = new DropZone (this, x, y, (width + margin) * scale_multiplier, (height + margin) * scale_multiplier, color);
            this.add.existing(dropZone);
            this.zones.push(dropZone);

            x += (margin + width) * scale_multiplier;
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
            gameObject?.dragStart(_target);
        });

        var target: DropZone | null; 
        this.input.on('drop', function (pointer, gameObject, _target) {
            target = _target;
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            if(dropped)
                gameObject?.setDropZone(target);
            else
                gameObject?.setDropZone(null);
        });


    }
    
    
    create ()
    {
        ///(Yeah I know my english is bad)

        ///------------------------------------------------spawning cards---------------------------------------------------
        //I think that you wanna change theese varibles and don't wanna change the others
        var scale_multiplier = 0.5;                             //this thing multiplies by original sizes of zones, cards and margin
        var cards_margin = 8;                                  //space between cards
        var offset_from_bottom = 5;                            //space between bottom and cards
        var space_between_cards_and_zones = 30;                 //space between cards and zones (it will be multiplied by scale_multiplier)
        var cards_amount = 8;                                   //amount of cards
        var zones_amount = 5;                                   //amount of zones
        var color = 0x592D2D;                                   //main color
        

        var scene_height = this.sys.game.scale.gameSize.height;
        var scene_width = this.sys.game.scale.gameSize.width;

        //cards sizes (I just don't know how to get them from atlas)
        var cards_width = 140;
        var cards_height = 190;

        

    
        //Starting point to create drop zones and cards
        var start_x_cards = scene_width / 2 - (cards_width + cards_margin) * scale_multiplier * cards_amount / 2;
        var start_x_zones = scene_width / 2 - (cards_width + cards_margin) * scale_multiplier * zones_amount / 2; 
        var start_y = scene_height - (cards_height / 4 + offset_from_bottom);

        var line = this.add.graphics();
        line.lineStyle(3, color);
        line.lineBetween(
            0, 
            start_y - (cards_height + cards_margin + space_between_cards_and_zones) * scale_multiplier * 1.5,   
            scene_width,
            start_y - (cards_height + cards_margin + space_between_cards_and_zones) * scale_multiplier * 1.5
        );
        

        //Creating cards and zones
        this.cardsCreate(cards_amount, start_x_cards, start_y, cards_width, cards_height, cards_margin, scale_multiplier);
        this.dropZonesCreate(zones_amount, start_x_zones, start_y - (cards_height + cards_margin + space_between_cards_and_zones) * scale_multiplier, cards_width, cards_height, cards_margin, scale_multiplier, color);
        //-------------------------------------------------------------------------------------------------------------------------------------------

        //making cards move 
        this.cardsMovement();


        
        //*********************debug********************
        for (var i = 0; i < this.zones.length; i++){
            this.output.push(this.add.text(0, i * 20, "aboba"));
        }
        ////////////////////////////////////////////////

    }

    update(){
        /////////////////////////////////debug/////////////////////////
         for (var i = 0; i < this.output.length; i++){
                this.output[i].text = this.zones[i].getCardType();     
        }
        ///////////////////////////////////////////////////////////////////
    }
}
