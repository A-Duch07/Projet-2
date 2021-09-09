import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from './color.service';
import * as texteConstants from './tools-constants/texte-service-constants';

@Injectable({
  providedIn: 'root',
})
export class TexteService extends Tool {

  align: any;
  bold: any = false;
  italique: any = false;
  mouseDown: boolean = true;
  textArea: HTMLTextAreaElement;
  currentStyle: number;
  policeHeight: number;
  currentMousePosition: Vec2 = {x: 0, y: 0};
  police: string;
  texte: string;

  constructor(drawingService: DrawingService, private colorService: ColorService) {
    super(drawingService);
    this.textArea = document.createElement('textarea');
    this.textArea.style.fontFamily = 'Arial';
    this.textArea.style.fontFamily = texteConstants.POLICEHEIGHT_ONSELECT + 'px';
  }

  onAlignerChange(value: string): void{
    this.align = value;
    this.textArea.style.textAlign = this.align;
  }

  onBoldChange(value: any): void{
    this.bold = value;
    if(this.bold){
      this.textArea.style.fontWeight = 'bold';
    }
  }

  onItaliqueChange(value: any): void{
    this.italique = value;
    if(this.italique){
      this.textArea.style.fontStyle = 'italic';
    }
  }

  onPoliceChange(value: string): void{
    this.police = value;
    this.textArea.style.fontFamily = this.police;
  }

  onPoliceHeightChange(size: number): void{
    this.policeHeight = size;
    this.textArea.style.fontSize = this.policeHeight + 'px';
  }

  onMouseDown(event: MouseEvent): void{
    this.printText(event, this.drawingService.baseCtx);
  }

  onClick(event: MouseEvent): void {
    this.currentMousePosition = this.getPositionFromMouse(event);
    this.createTextArea(event.clientX, event.clientY);
    this.textArea.value = "";
  }

  private createTextArea(mousePosX: number, mousePosY: number): void {
    // Create html div
    this.drawingService.previewCanvas.insertAdjacentElement('afterend', this.textArea);

    // Changes styles
    this.textArea.style.position = 'fixed';
    this.textArea.style.whiteSpace = 'pre';
    this.textArea.style.width = texteConstants.TEXTAREA_WIDTH + 'px';
    this.textArea.style.lineHeight = '1';
    this.textArea.style.left = mousePosX + 'px';
    this.textArea.style.top = mousePosY + 'px';
    this.textArea.style.color = this.colorService.mainColors[0];
    this.textArea.focus();
}

  printText(event: MouseEvent, ctx: CanvasRenderingContext2D): void {

    this.drawingService.clearCanvas(this.drawingService.previewCtx);

    if(this.bold && this.italique){
      ctx.font = 'bold italic ' + this.policeHeight + 'px ' + this.police;
    }
    else if(this.bold){
      ctx.font = 'bold ' + this.policeHeight + 'px ' + this.police;
    }
    else if(this.italique){
      ctx.font = 'italic ' + this.policeHeight + 'px ' + this.police;
    }
    else{
      ctx.font = this.policeHeight + 'px ' + this.police;
    }
    ctx.textAlign = this.align;
    ctx.fillStyle = this.colorService.mainColors[0];
    ctx.fillText(this.textArea.value, this.currentMousePosition.x, this.currentMousePosition.y);
  }

  onSelect(): void {
    this.police = 'Arial';
    this.policeHeight = texteConstants.POLICEHEIGHT_ONSELECT;
  }
}
