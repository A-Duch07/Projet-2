import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorService } from './color.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    private offsetPosition: Vec2;
    private offsetPositionSquare: Vec2;
    private squareMode: boolean;
    private firstSquareMode: boolean;

    currentStyle: number;

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService, private colorService: ColorService) {
        super(drawingService);
        this.clearPath();

        this.squareMode = false;
        this.firstSquareMode = true;
        this.currentStyle = 0;
    }

    onSizeChange(size: number): void {
        this.drawingService.baseCtx.lineWidth = size;
        this.drawingService.previewCtx.lineWidth = size;
    }

    private calculateOffset(newMousePosition: Vec2): void {
        this.offsetPosition.x = newMousePosition.x - this.mouseDownCoord.x;
        this.offsetPosition.y = newMousePosition.y - this.mouseDownCoord.y;
    }

    private calculateOffsetSquare(): void {
        const minOffset = Math.min(Math.abs(this.offsetPosition.x), Math.abs(this.offsetPosition.y));

        if (this.offsetPosition.x > 0 && this.offsetPosition.y > 0) {
            this.offsetPositionSquare.x = minOffset;
            this.offsetPositionSquare.y = minOffset;
        } else if (this.offsetPosition.x > 0 && this.offsetPosition.y < 0) {
            this.offsetPositionSquare.x = minOffset;
            this.offsetPositionSquare.y = -minOffset;
        } else if (this.offsetPosition.x < 0 && this.offsetPosition.y > 0) {
            this.offsetPositionSquare.x = -minOffset;
            this.offsetPositionSquare.y = minOffset;
        } else if (this.offsetPosition.x < 0 && this.offsetPosition.y < 0) {
            this.offsetPositionSquare.x = -minOffset;
            this.offsetPositionSquare.y = -minOffset;
        } else {
            this.offsetPositionSquare.x = 0;
            this.offsetPositionSquare.y = 0;
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.colorService.setFillingColor();
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.undoRedoService.toolIsUsed = true;
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.calculateOffset(mousePosition);
            this.calculateOffsetSquare();
            this.drawLine(this.drawingService.baseCtx);
            this.undoRedoService.toolIsUsed = false;
            this.undoRedoService.saveCurrentState(
                this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
            );
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.calculateOffset(mousePosition);
            this.calculateOffsetSquare();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.squareMode = true;
            if (this.firstSquareMode) {
                this.firstSquareMode = false;
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawLine(this.drawingService.previewCtx);
                this.firstSquareMode = false;
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            if (this.squareMode) {
                this.squareMode = false;
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawLine(this.drawingService.previewCtx);
                this.firstSquareMode = true;
            }
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D): void {
        let usedOffset: Vec2;
        if (this.squareMode) {
            usedOffset = this.offsetPositionSquare;
        } else {
            usedOffset = this.offsetPosition;
        }

        switch (this.currentStyle) {
            case 0:
                ctx.beginPath();
                ctx.rect(this.mouseDownCoord.x, this.mouseDownCoord.y, usedOffset.x, usedOffset.y);
                ctx.stroke();
                break;
            case 1:
                ctx.fillRect(this.mouseDownCoord.x, this.mouseDownCoord.y, usedOffset.x, usedOffset.y);
                break;
            case 2:
                ctx.fillRect(this.mouseDownCoord.x, this.mouseDownCoord.y, usedOffset.x, usedOffset.y);
                ctx.beginPath();
                ctx.rect(this.mouseDownCoord.x, this.mouseDownCoord.y, usedOffset.x, usedOffset.y);
                ctx.stroke();
                break;
            default:
        }
    }

    private clearPath(): void {
        this.offsetPosition = { x: 0, y: 0 };
        this.offsetPositionSquare = { x: 0, y: 0 };
    }

    onSelect(): void {
        this.colorService.setFillingColor();
        this.currentStyle = 0;
    }
}
