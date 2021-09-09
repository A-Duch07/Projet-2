import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorService } from './color.service';
import * as lineConstants from './tools-constants/line-service-constants';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    pathData: Vec2[] = [];
    positions: Vec2[] = [];
    private lastStrokeStartingPoint: Vec2;
    private currentPosition: Vec2;
    projectedPosition: Vec2;
    private isFirstClick: boolean = true;
    private isDrawingJunction: boolean = false;
    private isPressingShift: boolean;
    private distanceIsSmall: boolean;
    private junctionSize: number;
    private angle: number;
    private savedCanvas: ImageData;
    savedSegments: ImageData[];

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService, private colorService: ColorService) {
        super(drawingService);
        this.pathData = [];
        this.savedSegments = [];
    }

    onSelect(): void {
        this.drawingService.baseCtx.lineCap = lineConstants.LINE_CAP_ROUND;
        this.drawingService.previewCtx.lineCap = lineConstants.LINE_CAP_ROUND;
        this.drawingService.baseCtx.lineWidth = lineConstants.BASE_SIZE;
        this.drawingService.previewCtx.lineWidth = lineConstants.BASE_SIZE;
        this.savedCanvas = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.colorService.setStrokingColor();
    }

    onSizeChange(size: number): void {
        const verifiedInput: number = this.verifyInput(size);
        this.drawingService.baseCtx.lineWidth = verifiedInput;
        this.drawingService.previewCtx.lineWidth = verifiedInput;
    }

    verifyInput(input: number): number {
        if (input <= lineConstants.MIN_INPUT) {
            input = lineConstants.MIN_INPUT;
        } else if (input >= lineConstants.MAX_INPUT) {
            input = lineConstants.MAX_INPUT;
        }
        return input;
    }

    onJunctionTypeChange(drawingJunction: boolean): void {
        this.isDrawingJunction = drawingJunction;
    }

    onJunctionSizeChange(size: number): void {
        this.junctionSize = this.verifyInput(size);
    }

    // Évènement de la souris lorsque qu'un clique unique est détecté
    onMouseDown(event: MouseEvent): void {
        this.colorService.setStrokingColor();
        this.mouseDown = event.buttons === MouseButton.Left;
        if (!this.isFirstClick && this.pathData.length === lineConstants.MAX_PATH_LENGTH) {
            this.savedSegments.push(
                this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height),
            );
            this.drawSegment(this.drawingService.baseCtx);
            if (this.isDrawingJunction) {
                if (this.isPressingShift) {
                    this.drawJunction(this.drawingService.baseCtx, this.projectedPosition);
                } else {
                    this.drawJunction(this.drawingService.baseCtx, this.currentPosition);
                }
            }
            this.lastStrokeStartingPoint = this.pathData[lineConstants.STARTING_POINT];
        }
        if (this.isFirstClick && this.isDrawingJunction) {
            this.drawJunction(this.drawingService.baseCtx, this.currentPosition);
        }

        if (this.mouseDown) {
            this.pathData = [];
            if (this.isPressingShift) {
                this.pathData.push(this.projectedPosition);
                this.positions.push(this.projectedPosition);
            } else {
                this.pathData.push(this.getPositionFromMouse(event));
                this.positions.push(this.getPositionFromMouse(event));
            }
            this.isFirstClick = false;
            this.undoRedoService.toolIsUsed = true;
        }
    }

    // Évènement de la souris lorsque qu'un double clique est détecté
    onDoubleClick(event: MouseEvent): void {
        if (this.mouseDown) {
            if (this.pathData.length === 1) {
                this.pathData.push(this.getPositionFromMouse(event));
            }
            this.distanceIsSmall = this.verifyDistance();
            if (this.distanceIsSmall) {
                this.eraseLastSegment();
                if (this.isDrawingJunction) {
                    this.drawJunction(this.drawingService.baseCtx, this.positions[0]);
                    this.drawJunction(this.drawingService.baseCtx, this.positions[this.positions.length - 2]);
                }
                this.pathData[lineConstants.ENDING_POINT] = this.positions[lineConstants.STARTING_POINT];
                this.drawSegment(this.drawingService.baseCtx);
            }
            this.undoRedoService.toolIsUsed = false;
            this.undoRedoService.saveCurrentState(
                this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
            );
        }
        this.savedCanvas = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.mouseDown = false;
        this.positions = [];
        this.pathData = [];
        this.savedSegments = [];
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.isFirstClick = true;
    }

    // Évènement de la souris lorsque que le curseur bouge
    onMouseMove(event: MouseEvent): void {
        this.currentPosition = this.getPositionFromMouse(event);
        if (this.mouseDown) {
            this.pathData[lineConstants.ENDING_POINT] = this.currentPosition;
            if (this.isPressingShift) {
                this.angle = this.verifyAngle();
                this.anchorSegment(Math.abs(this.angle));
            }
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSegment(this.drawingService.previewCtx);
        }
    }

    // Évènements du clavier lorsqu'on appuie sur les différentes touches
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Backspace') {
            this.eraseLastSegment();
        }
        if (event.key === 'Escape') {
            this.eraseLine();
        }
        if (event.key === 'Shift' && this.positions.length >= 1) {
            this.isPressingShift = true;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isPressingShift = false;
        }
    }

    eraseLastSegment(): void {
        if (this.savedSegments.length >= 1) {
            this.drawingService.baseCtx.putImageData(this.savedSegments[this.savedSegments.length - 1], 0, 0);
            this.savedSegments.pop();
            this.pathData[lineConstants.ENDING_POINT] = this.lastStrokeStartingPoint;
            this.lastStrokeStartingPoint = this.positions[this.positions.length - 2];
            this.pathData = [];
            this.positions.pop();
            this.pathData.push(this.lastStrokeStartingPoint);
            this.pathData.push(this.currentPosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSegment(this.drawingService.previewCtx);
        }
    }

    // Fonction permettant de dessiner un segment
    drawSegment(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.moveTo(this.pathData[lineConstants.STARTING_POINT].x, this.pathData[lineConstants.STARTING_POINT].y);
        ctx.lineTo(this.pathData[lineConstants.ENDING_POINT].x, this.pathData[lineConstants.ENDING_POINT].y);
        ctx.stroke();
    }

    // Fonction permettant de dessiner la jonction
    drawJunction(ctx: CanvasRenderingContext2D, position: Vec2): void {
        ctx.beginPath();
        ctx.ellipse(position.x, position.y, this.junctionSize, this.junctionSize, 0, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    // Fonction permettant de dessiner une ligne
    eraseLine(): void {
        if (this.savedCanvas) {
            this.drawingService.baseCtx.putImageData(this.savedCanvas, 0, 0);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.mouseDown = false;
            this.positions = [];
            this.savedSegments = [];
            this.pathData = [];
            this.isFirstClick = true;
            this.undoRedoService.toolIsUsed = false;
        }
    }

    // Fonction qui vérifie si le position actuel est à moins de 20 pixel du premier point
    verifyDistance(): boolean {
        if (
            Math.abs(this.currentPosition.x - this.positions[0].x) <= lineConstants.MAX_DISTANCE &&
            Math.abs(this.currentPosition.y - this.positions[0].y) <= lineConstants.MAX_DISTANCE
        ) {
            return true;
        }
        return false;
    }

    // Fonction qui retourne l'angle entre le segment et l'axe des x en degré
    verifyAngle(): number {
        const opposite: number = Math.abs(this.currentPosition.y - this.pathData[lineConstants.STARTING_POINT].y);
        const adjacent: number = Math.abs(this.currentPosition.x - this.pathData[lineConstants.STARTING_POINT].x);
        return (this.angle = Math.atan(opposite / adjacent) * (lineConstants.HALF_CIRCLE / Math.PI));
    }

    // Fonction qui ancre le segment de prévisualisation à une des ligne d'ancrage
    anchorSegment(angle: number): void {
        this.projectedPosition = { x: 0, y: 0 };
        if (angle >= lineConstants.FIRST_QUARTER_SECTION && angle < lineConstants.SECOND_QUARTER_SECTION) {
            this.pathData = [];
            this.projectedPosition.x = this.currentPosition.x;
            this.projectedPosition.y = this.positions[this.positions.length - 1].y;
            this.pathData.push(this.positions[this.positions.length - 1], this.projectedPosition);
        } else if (angle >= lineConstants.SECOND_QUARTER_SECTION && angle < lineConstants.THRID_QUARTER_SECTION) {
            this.pathData = [];
            const adacent: number = Math.abs(this.currentPosition.x - this.positions[this.positions.length - 1].x);
            const opposite: number = adacent * Math.tan((lineConstants.PROJECTION_ANGLE * Math.PI) / lineConstants.HALF_CIRCLE);
            this.projectedPosition.x = this.currentPosition.x;
            if (this.currentPosition.y >= this.positions[this.positions.length - 1].y) {
                this.projectedPosition.y = this.positions[this.positions.length - 1].y + opposite;
            } else {
                this.projectedPosition.y = this.positions[this.positions.length - 1].y - opposite;
            }
            this.pathData.push(this.positions[this.positions.length - 1], this.projectedPosition);
        } else if (angle >= lineConstants.THRID_QUARTER_SECTION && angle <= lineConstants.FOURTH_QUARTER_SECTION) {
            this.pathData = [];
            this.projectedPosition.x = this.positions[this.positions.length - 1].x;
            this.projectedPosition.y = this.currentPosition.y;
            this.pathData.push(this.positions[this.positions.length - 1], this.projectedPosition);
        }
    }
}
