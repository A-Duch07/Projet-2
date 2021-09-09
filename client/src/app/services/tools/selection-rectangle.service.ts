import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/drawing/selection-service';
// import { SelectionControlsService } from '@app/services/drawing/selection/selection-controls.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionRectangleService extends Tool {
    private offsetPosition: Vec2;
    private offsetPositionSquare: Vec2;
    private squareMode: boolean;
    private firstSquareMode: boolean;

    constructor(drawingService: DrawingService, private selectionService: SelectionService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.clearPath();
        this.squareMode = false;
        this.firstSquareMode = true;

        this.drawingService.imageSelected = false;
    }

    private calculateOffset(newMousePosition: Vec2): void {
        this.offsetPosition.x = newMousePosition.x - this.mouseDownCoord.x;
        this.offsetPosition.y = newMousePosition.y - this.mouseDownCoord.y;
        if (this.offsetPosition.x + this.mouseDownCoord.x > this.drawingService.canvas.width) {
            this.offsetPosition.x = this.drawingService.canvas.width - this.mouseDownCoord.x;
        }
        if (this.offsetPosition.y + this.mouseDownCoord.y > this.drawingService.canvas.height) {
            this.offsetPosition.y = this.drawingService.canvas.height - this.mouseDownCoord.y;
        }
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

    private canvasClicked(mouseDownCoord: Vec2): boolean {
        if (mouseDownCoord.x > 0 && mouseDownCoord.x < this.drawingService.canvas.width) {
            if (mouseDownCoord.y > 0 && mouseDownCoord.y < this.drawingService.canvas.height) {
                return true;
            }
        }
        return false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        this.mouseDownCoord = this.getPositionFromMouse(event);

        if (this.mouseDown) {
            if (this.drawingService.imageSelected) {
                if (!this.selectionService.imageClicked(this.mouseDownCoord) && this.selectionService.cornerClicked(this.mouseDownCoord) === -1) {
                    this.selectionService.confirmSelection();
                    this.onMouseDown(event);
                }
                this.selectionService.onMouseDown(event);
            }
            this.clearPath();
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            if (this.drawingService.imageSelected) {
                this.selectionService.onMouseUp(event);
            } else {
                if (!this.canvasClicked(this.mouseDownCoord)) {
                    this.mouseDown = false;
                    // tslint:disable-next-line
                    this.undoRedoService.saveCurrentState(
                        this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
                    );
                    // tslint:disable-next-line
                    this.undoRedoService.toolIsUsed = false;
                    return;
                }
                const mousePosition = this.getPositionFromMouse(event);
                this.calculateOffset(mousePosition);
                if (this.squareMode) {
                    this.selectionService.newSelection(this.mouseDownCoord, this.offsetPositionSquare, 1, []);
                } else {
                    this.selectionService.newSelection(this.mouseDownCoord, this.offsetPosition, 1, []);
                }
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            }
        }

        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            if (this.drawingService.imageSelected) {
                this.selectionService.onMouseMove(event);
            } else {
                if (!this.canvasClicked(this.mouseDownCoord)) return;
                const mousePosition = this.getPositionFromMouse(event);
                this.calculateOffset(mousePosition);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawLine(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.selectionService.shiftKeyPressed = true;
            this.squareMode = true;
            if (this.firstSquareMode) {
                this.firstSquareMode = false;
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawLine(this.drawingService.previewCtx);
                this.firstSquareMode = false;
            }
        } else if (event.key === 'a') {
            this.selectionService.newSelection({ x: 0, y: 0 }, { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height }, 1, []);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        } else {
            this.selectionService.onKeyDown(event);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.selectionService.shiftKeyPressed = false;
            if (this.squareMode) {
                this.squareMode = false;
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawLine(this.drawingService.previewCtx);
                this.firstSquareMode = true;
            }
        } else {
            this.selectionService.onKeyUp(event);
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D): void {
        let usedOffset: Vec2;
        if (this.squareMode) {
            usedOffset = this.offsetPositionSquare;
        } else {
            usedOffset = this.offsetPosition;
        }
        ctx.beginPath();
        ctx.rect(this.mouseDownCoord.x, this.mouseDownCoord.y, usedOffset.x, usedOffset.y);
        ctx.stroke();
    }

    private clearPath(): void {
        this.offsetPosition = { x: 0, y: 0 };
        this.offsetPositionSquare = { x: 0, y: 0 };
    }

    onSelect(): void {
        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.lineWidth = 1;
        this.drawingService.previewCtx.strokeStyle = 'black';
        this.drawingService.imageSelected = false;
    }
    onDeSelect(): void {
        this.drawingService.previewCtx.restore();
        this.drawingService.selectionCtx.clearRect(0, 0, this.drawingService.selectionCanvas.width, this.drawingService.selectionCanvas.height);

        this.selectionService.confirmSelection();
        this.drawingService.imageSelected = false;
    }
}
