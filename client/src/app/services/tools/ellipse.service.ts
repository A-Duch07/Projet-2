import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorService } from './color.service';
import * as ellipseConstants from './tools-constants/ellipse-service-constants';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    private coordCentre: Vec2;
    private rayon: Vec2;
    private cote: Vec2;
    ellipseMode: boolean;
    currentStyle: number;

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService, private colorService: ColorService) {
        super(drawingService);
        this.clearPath();
    }

    onSelect(): void {
        this.colorService.setFillingColor();
    }

    calculateCoordCentre(newMousePosition: Vec2): void {
        this.coordCentre.x = (newMousePosition.x + this.mouseDownCoord.x) / 2;
        this.coordCentre.y = (newMousePosition.y + this.mouseDownCoord.y) / 2;
    }

    calculateRayon(newMousePosition: Vec2): void {
        this.rayon.x = Math.abs((newMousePosition.x - this.mouseDownCoord.x) / 2);
        this.rayon.y = Math.abs((newMousePosition.y - this.mouseDownCoord.y) / 2);
    }

    calculatePerimeter(newMousePosition: Vec2): void {
        this.cote.x = newMousePosition.x - this.mouseDownCoord.x;
        this.cote.y = newMousePosition.y - this.mouseDownCoord.y;
    }

    onSizeChange(size: number): void {
        if (size > 0 && size <= ellipseConstants.MAX_WIDTH) {
            this.drawingService.baseCtx.lineWidth = size;
            this.drawingService.previewCtx.lineWidth = size;
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
            this.calculateCoordCentre(mousePosition);
            this.drawEllipse(this.drawingService.baseCtx);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
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
            this.calculateRayon(mousePosition);
            this.calculatePerimeter(mousePosition);

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.calculateCoordCentre(mousePosition);
            this.drawEllipse(this.drawingService.previewCtx);
            this.drawPerimeter(this.drawingService.previewCtx);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.ellipseMode = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx);
            this.drawPerimeter(this.drawingService.previewCtx);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.ellipseMode = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx);
            this.drawPerimeter(this.drawingService.previewCtx);
        }
    }

    private drawEllipse(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        if (this.ellipseMode) {
            ctx.ellipse(this.coordCentre.x, this.coordCentre.y, this.rayon.x, this.rayon.x, 0, 0, 2 * Math.PI);
        } else {
            ctx.ellipse(this.coordCentre.x, this.coordCentre.y, this.rayon.x, this.rayon.y, 0, 0, 2 * Math.PI);
        }

        switch (this.currentStyle) {
            // Contour
            case 0:
            default:
                ctx.stroke();
                break;
            // Plein
            case 1:
                ctx.fill();
                break;
            // Contour et plein
            case 2:
                ctx.fill();
                ctx.stroke();
                break;
        }
    }

    private drawPerimeter(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.setLineDash([ellipseConstants.LINE_DASH_LOW_VALUE, ellipseConstants.LINE_DASH_HIGH_VALUE]);
        if (this.ellipseMode) {
            ctx.strokeRect(this.mouseDownCoord.x - this.rayon.x, this.mouseDownCoord.y, this.rayon.x * 2, this.rayon.x * 2);
        } else {
            ctx.strokeRect(this.mouseDownCoord.x, this.mouseDownCoord.y, this.cote.x, this.cote.y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    private clearPath(): void {
        this.coordCentre = { x: 0, y: 0 };
        this.rayon = { x: 0, y: 0 };
        this.cote = { x: 0, y: 0 };
    }
}
