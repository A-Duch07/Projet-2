import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as gridConstants from './grid-constants';

@Injectable({
    providedIn: 'root',
})
export class GridService extends Tool {
    squareSideLenght: number;
    opacity: number;
    gridColor: string;
    gridIsActive: boolean;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.opacity = gridConstants.MAX_OPACITY;
        this.gridColor = 'rgba(0,0,0,' + this.opacity + ')';
        this.squareSideLenght = gridConstants.MIN_INPUT;
        this.gridIsActive = false;
    }

    getSquareLenght(): number {
        return this.squareSideLenght;
    }

    onSizeChange(size: number): void {
        const verifiedInput: number = this.verifyInput(size);
        this.squareSideLenght = verifiedInput;
        this.drawingService.gridCtx.strokeStyle = 'rgba(0,0,0,1)';
        this.drawLine(this.drawingService.gridCtx);
    }

    increaseSize(): void {
        if (Math.round(this.squareSideLenght + gridConstants.SIZE_CHANGE) >= gridConstants.MAX_INPUT) {
            this.squareSideLenght = gridConstants.MAX_INPUT;
        } else {
            this.squareSideLenght = Math.round(this.squareSideLenght + gridConstants.SIZE_CHANGE);
        }
        this.verifySize();
        this.drawLine(this.drawingService.gridCtx);
    }

    reduceSize(): void {
        if (Math.round(this.squareSideLenght - gridConstants.SIZE_CHANGE) <= gridConstants.MIN_INPUT) {
            this.squareSideLenght = gridConstants.MIN_INPUT;
        } else {
            this.squareSideLenght = Math.floor(this.squareSideLenght - gridConstants.SIZE_CHANGE);
        }
        this.verifySize();
        this.drawLine(this.drawingService.gridCtx);
    }

    private verifySize(): void {
        if (this.squareSideLenght % gridConstants.SIZE_CHANGE <= gridConstants.MODULO_MIDDLE) {
            this.squareSideLenght -= this.squareSideLenght % gridConstants.SIZE_CHANGE;
        } else {
            this.squareSideLenght += gridConstants.SIZE_CHANGE - (this.squareSideLenght % gridConstants.SIZE_CHANGE);
        }
    }

    onOpacityChange(opacity: number): void {
        let verifiedInput = opacity;
        if (opacity >= gridConstants.MAX_OPACITY) {
            verifiedInput = gridConstants.MAX_OPACITY;
        } else if (opacity <= gridConstants.MIN_OPACITY) {
            verifiedInput = gridConstants.MIN_OPACITY;
        }
        this.opacity = verifiedInput;
        this.gridColor = 'rgba(0,0,0,' + this.opacity + ')';
        this.drawingService.gridCtx.strokeStyle = this.gridColor;
        this.drawLine(this.drawingService.gridCtx);
    }

    verifyInput(input: number): number {
        if (input <= gridConstants.MIN_INPUT) {
            input = gridConstants.MIN_INPUT;
        } else if (input >= gridConstants.MAX_INPUT) {
            input = gridConstants.MAX_INPUT;
        }
        return input;
    }

    drawLine(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
        let currentPosition: Vec2 = { x: gridConstants.AXIS_BASE_POSITION, y: gridConstants.AXIS_BASE_POSITION };
        ctx.beginPath();
        ctx.setLineDash([gridConstants.DASH_LOW, gridConstants.DASH_HIGH]);
        ctx.moveTo(gridConstants.AXIS_BASE_POSITION, gridConstants.AXIS_BASE_POSITION);

        // Lines arround the canvas
        ctx.lineTo(currentPosition.x, this.drawingService.gridCtx.canvas.height);
        ctx.lineTo(this.drawingService.gridCtx.canvas.width, this.drawingService.gridCtx.canvas.height);
        ctx.lineTo(this.drawingService.gridCtx.canvas.width, currentPosition.y);
        ctx.lineTo(currentPosition.x, currentPosition.y);

        // Vertical lines
        while (currentPosition.x <= this.drawingService.gridCtx.canvas.width) {
            if (currentPosition.y === gridConstants.AXIS_BASE_POSITION) {
                ctx.lineTo(currentPosition.x, this.drawingService.gridCtx.canvas.height);
                currentPosition.x += this.squareSideLenght;
                currentPosition.y = this.drawingService.gridCtx.canvas.height;
            } else {
                ctx.lineTo(currentPosition.x, gridConstants.AXIS_BASE_POSITION);
                currentPosition.x += this.squareSideLenght;
                currentPosition.y = gridConstants.AXIS_BASE_POSITION;
            }
            ctx.lineTo(currentPosition.x, currentPosition.y);
        }

        // Horizontal lines
        currentPosition = { x: gridConstants.AXIS_BASE_POSITION, y: gridConstants.AXIS_BASE_POSITION };
        while (currentPosition.y <= this.drawingService.gridCtx.canvas.height) {
            if (currentPosition.x === gridConstants.AXIS_BASE_POSITION) {
                ctx.lineTo(this.drawingService.gridCtx.canvas.width, currentPosition.y);
                currentPosition.x = this.drawingService.gridCtx.canvas.width;
                currentPosition.y += this.squareSideLenght;
            } else {
                ctx.lineTo(gridConstants.AXIS_BASE_POSITION, currentPosition.y);
                currentPosition.x = gridConstants.AXIS_BASE_POSITION;
                currentPosition.y += this.squareSideLenght;
            }
            ctx.lineTo(currentPosition.x, currentPosition.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
