import Phaser from 'phaser'
import Card from './Card';

export default class DropZone extends Phaser.GameObjects.Zone{
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