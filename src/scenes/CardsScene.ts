import Phaser, { Game, Input } from 'phaser'
import eventsCenter from '~/managers/EventCenter';
import DropZone from '~/gameObjects/DropZone';
import Card from '~/gameObjects/Card';


export default class CardsScene extends Phaser.Scene
{
    output: Array<Phaser.GameObjects.Text> = [];
    zones: Array<DropZone> = [];
    cards: Array<Card> = [];

	constructor()
	{
		super('CardsScene');
	}

	preload()
    {
        this.load.atlas('cards', 'cards/cards.png', 'cards/cards.json');
        this.load.image('button', 'buttons/button.png');
        this.load.image('buttonHighlighted', 'buttons/buttonHighlighted.png');

        
    }
    
    //create stack of cards
    cardsCreate(amount, x, y, width, height, margin, scale_multiplier){
        var frames = this.textures.get('cards').getFrameNames();

        for (var i = 0; i < amount; i++) 
        {   
            
            if (Phaser.Math.RND.realInRange(0, 100) <= 20){
                var card = new Card(this, x, y, 'cards', 'moveForward.png');
            }
            else
                var card = new Card(this, x, y, 'cards', Phaser.Math.RND.pick(frames));

            card.scale = scale_multiplier;

            this.add.existing(card);
            this.cards.push(card);
    
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
        var scene_height = this.sys.game.scale.gameSize.height;
        var scene_width = this.sys.game.scale.gameSize.width;

        //Varibles you may want to change
        var scale_multiplier = scene_height / 2000;         //original sizes of zones, cards and margin multiplies by this thing 
        var cards_margin = 8;                               //space between cards
        var offset_from_bottom = 10;                         //space between bottom and cards
        var space_between_cards_and_zones = 30;             //space between cards and zones (it will be multiplied by scale_multiplier)
        var cards_number = 8;                               //number of cards
        var zones_number = 5;                               //number of zones
        var color = 0x28447e;                               //main color
        var button_multiplier = 0.15                        //button scale multiplier (it will be multiplied by scale_multiplier)             
        


        //cards sizes 
        var cards_width = 181;
        var cards_height = 248;

        //Starting points to create drop zones and cards
        var start_x_cards = scene_width / 2 - (cards_width + cards_margin) * scale_multiplier * cards_number / 2;
        var start_x_zones = scene_width / 2 - (cards_width + cards_margin) * scale_multiplier * zones_number / 2; 
        var start_y = scene_height - (cards_height / 2 + offset_from_bottom) * scale_multiplier;
        
        var top_border = start_y - (cards_height + cards_margin + space_between_cards_and_zones) * scale_multiplier * 1.5;
        console.log(top_border);

        //line in the top border of HUD
        var line = this.add.graphics();
        line.lineStyle(3, color);
        line.lineBetween(
            0, 
            top_border,  
            scene_width,
            top_border
        );
        

        //Creating cards and zones
        this.cardsCreate(cards_number, start_x_cards, start_y, cards_width, cards_height, cards_margin, scale_multiplier);
        this.dropZonesCreate(zones_number, start_x_zones, start_y - (cards_height + cards_margin + space_between_cards_and_zones) * scale_multiplier, cards_width, cards_height, cards_margin, scale_multiplier, color);
        //-------------------------------------------------------------------------------------------------------------------------------------------

        //making cards move 
        this.cardsMovement();

        //next turn button and events for it
        const clickButton = this.add.image(start_x_zones - 80, start_y - (cards_height + cards_margin + space_between_cards_and_zones) * scale_multiplier, 'button').setInteractive();
        clickButton.scale = scale_multiplier * button_multiplier;
        clickButton.x -= clickButton.displayWidth / 2;

        clickButton.on('pointerover', () => clickButton.setTexture('buttonHighlighted'));
        clickButton.on('pointerout', () => clickButton.setTexture('button'));
                                    
        clickButton.on('pointerdown', () => {
            let moves: Array<string> = [];
            let flag = true;

            for (var drop_zone of this.zones){
               if (drop_zone.getCardType() == "empty"){
                   flag = false;
                   break;
               }
                   moves.push(drop_zone.getCardType());      
            }

            if (flag){
                eventsCenter.emit('make-move', moves, 0);

                while(this.cards.length){
                    this.cards[this.cards.length - 1].destroy(true);
                    this.cards.pop();
                }
                
                for(let drop_zone of this.zones){
                    drop_zone.card = null;
                }

                this.cardsCreate(cards_number, start_x_cards, start_y, cards_width, cards_height, cards_margin, scale_multiplier);  
            }

        });

        this.scene.launch('BoardScene', {top_border: top_border});
        this.scene.moveAbove('BoardScene', 'CardsScene');
        
        //*********************debug********************
        for (var i = 0; i < this.zones.length; i++){
            this.output.push(this.add.text(0, i * 20, "null"));
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
