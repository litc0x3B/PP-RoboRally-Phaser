import Phaser from 'phaser'
import DropZone from './DropZone';

export default class Card extends Phaser.GameObjects.Image{
    startX: number;
    startY: number;
    cardType: string;
    scene: Phaser.Scene;
    draggingFrom: DropZone | null = null;

    constructor(_scene: Phaser.Scene, x: number, y: number, texture: string, frame: string){
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