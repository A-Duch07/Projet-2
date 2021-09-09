import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/drawing/selection-service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import * as lineConstants from './tools-constants/line-service-constants';

@Injectable({
    providedIn: 'root',
})
export class SelectionLassoService extends Tool {
    private shiftKeyPressed: boolean;
    private selectionPositions: Vec2[];
    private selectionCorner: Vec2;
    private selectionDimensions: Vec2;
    private currentMousePosition: Vec2;

    private validNewPosition: boolean;

    constructor(drawingService: DrawingService, private selectionService: SelectionService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.clearPath();

        this.drawingService.imageSelected = false;
    }

    // https://stackoverflow.com/questions/31697902/html5-canvas-how-can-i-check-if-a-stroke-is-crossing-an-other-stroke
    // test par Paul Bourke pour déterminer si deux lignes se croisent
    private newPositionValid(newMouseCoord: Vec2): boolean {
        // if (this.selectionPositions.length < 1) return true;
        for (let i = 1; i < this.selectionPositions.length; i++) {
            if (
                this.lineIntersect(
                    this.selectionPositions[i - 1],
                    this.selectionPositions[i],
                    this.selectionPositions[this.selectionPositions.length - 1],
                    newMouseCoord,
                )
            ) {
                return false;
            }
        }

        return true;
    }

    private lineIntersect(position0: Vec2, position1: Vec2, position2: Vec2, position3: Vec2): boolean {
        if (Math.max(position0.x, position1.x) < Math.min(position2.x, position3.x)) return false;

        const slope1 = (position0.y - position1.y) / (position0.x - position1.x);
        const slope2 = (position2.y - position3.y) / (position2.x - position3.x);

        const ordinate1 = position0.y - slope1 * position0.x;
        const ordinate2 = position2.y - slope2 * position2.x;

        const meeting = (ordinate2 - ordinate1) / (slope1 - slope2);

        if (
            meeting <= Math.max(Math.min(position0.x, position1.x), Math.min(position2.x, position3.x)) + 0.01 ||
            meeting >= Math.min(Math.max(position0.x, position1.x), Math.max(position2.x, position3.x)) - 0.01
        ) {
            return false;
        } else {
            return true;
        }
    }

    private calculateSelectionDimensions() {
        let minX = this.drawingService.canvas.width;
        let minY = this.drawingService.canvas.height;
        let maxX = 0;
        let maxY = 0;
        for (let i = 0; i < this.selectionPositions.length; i++) {
            if (this.selectionPositions[i].x < minX) minX = this.selectionPositions[i].x;
            if (this.selectionPositions[i].y < minY) minY = this.selectionPositions[i].y;
            if (this.selectionPositions[i].x > maxX) maxX = this.selectionPositions[i].x;
            if (this.selectionPositions[i].y > maxY) maxY = this.selectionPositions[i].y;
        }
        this.selectionCorner = { x: minX, y: minY };
        this.selectionDimensions = { x: maxX - minX, y: maxY - minY };
    }

    private addNewPosition(): void {
        let newPosition = this.mouseDownCoord;
        if (this.selectionPositions.length === 0) {
            this.selectionPositions.push(newPosition);
            return;
        }

        const xCondition = Math.abs(newPosition.x - this.selectionPositions[0].x) <= 20;
        const yCondition = Math.abs(newPosition.y - this.selectionPositions[0].y) <= 20;
        if (xCondition && yCondition && this.selectionPositions.length > 2 && this.newPositionValid(newPosition)) {
            this.selectionPositions.push(this.selectionPositions[0]);
            this.calculateSelectionDimensions();
            this.selectionService.newSelection(this.selectionCorner, this.selectionDimensions, 3, this.selectionPositions);
            this.selectionPositions = [];
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            return;
        }

        if (this.shiftKeyPressed) {
            newPosition = this.calculateShiftPosition(this.mouseDownCoord);
        }

        if (this.newPositionValid(newPosition)) {
            this.selectionPositions.push(newPosition);
            return;
        }
    }

    calculateShiftPosition(newMouseCoord: Vec2): Vec2 {
        const origin = this.selectionPositions[this.selectionPositions.length - 1];
        const angle = Math.atan(Math.abs(newMouseCoord.y - origin.y) / Math.abs(newMouseCoord.x - origin.x)) * (lineConstants.HALF_CIRCLE / Math.PI);

        if (angle >= lineConstants.FIRST_QUARTER_SECTION && angle < lineConstants.SECOND_QUARTER_SECTION) {
            return { x: newMouseCoord.x, y: origin.y };
        } else if (angle >= lineConstants.SECOND_QUARTER_SECTION && angle < lineConstants.THRID_QUARTER_SECTION) {
            const adjacent: number = Math.abs(newMouseCoord.x - origin.x);
            const opposite: number = adjacent * Math.tan((lineConstants.PROJECTION_ANGLE * Math.PI) / lineConstants.HALF_CIRCLE);
            if (newMouseCoord.y >= origin.y) {
                return { x: newMouseCoord.x, y: origin.y + opposite };
            } else {
                return { x: newMouseCoord.x, y: origin.y - opposite };
            }
        } else {
            // (angle >= lineConstants.THRID_QUARTER_SECTION && angle <= lineConstants.FOURTH_QUARTER_SECTION) {
            return { x: origin.x, y: newMouseCoord.y };
        } // else return newMouseCoord;
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
                    // tslint:disable-next-line
                    this.undoRedoService.saveCurrentState(
                        this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
                    );
                    // tslint:disable-next-line
                    this.undoRedoService.toolIsUsed = false;
                    return;
                }
                this.selectionService.onMouseDown(event);
            } else {
                if (!this.canvasClicked(this.mouseDownCoord)) return;
                this.addNewPosition();
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            if (this.drawingService.imageSelected) {
                this.selectionService.onMouseUp(event);
            }
        }

        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.drawingService.imageSelected) {
            this.selectionService.onMouseMove(event);
        } else {
            if (this.selectionPositions.length !== 0) {
                let mousePosition = this.getPositionFromMouse(event);
                this.currentMousePosition = mousePosition;
                if (this.shiftKeyPressed) {
                    mousePosition = this.calculateShiftPosition(mousePosition);
                }
                this.validNewPosition = this.newPositionValid(mousePosition);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawLine(this.drawingService.previewCtx, mousePosition);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.drawingService.imageSelected) {
            if (event.key === 'Shift') {
                this.selectionService.shiftKeyPressed = true;
            } else {
                this.selectionService.onKeyDown(event);
            }
        } else {
            if (event.key === 'Shift') {
                this.shiftKeyPressed = true;
            } else if (event.key === 'Backspace') {
                console.log('erase');
                this.eraseLastSegment();
            } else if (event.key === 'Escape') {
                this.selectionPositions = [];
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            } else if (event.key === 'x' || event.key === 'c' || event.key === 'v' || event.key === 'Delete') {
                this.selectionService.onKeyDown(event);
            }
        }
    }

    private eraseLastSegment(): void {
        if (this.selectionPositions.length > 1) {
            this.selectionPositions.pop();
            let mousePosition = this.currentMousePosition;
            if (this.shiftKeyPressed) {
                mousePosition = this.calculateShiftPosition(mousePosition);
            }
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.validNewPosition = this.newPositionValid(mousePosition);
            this.drawLine(this.drawingService.previewCtx, mousePosition);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.drawingService.imageSelected) {
            if (event.key === 'Shift') {
                this.selectionService.shiftKeyPressed = false;
            } else {
                this.selectionService.onKeyUp(event);
            }
        } else {
            if (event.key === 'Shift') {
                this.shiftKeyPressed = false;
            }
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D, newPosition: Vec2): void {
        ctx.beginPath();
        ctx.moveTo(this.selectionPositions[0].x, this.selectionPositions[0].y);
        for (let i = 1; i < this.selectionPositions.length; i++) {
            ctx.lineTo(this.selectionPositions[i].x, this.selectionPositions[i].y);
        }
        ctx.stroke();
        if (!this.validNewPosition) this.drawingService.previewCtx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(this.selectionPositions[this.selectionPositions.length - 1].x, this.selectionPositions[this.selectionPositions.length - 1].y);
        ctx.lineTo(newPosition.x, newPosition.y);
        ctx.stroke();
        this.drawingService.previewCtx.strokeStyle = 'black';
    }

    private clearPath(): void {
        this.selectionPositions = [];
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
