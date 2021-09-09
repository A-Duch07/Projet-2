import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorService } from './color.service';
import * as pencilConstants from './tools-constants/pencil-service-constants';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];
    pencilStyle: string | CanvasGradient | CanvasPattern;

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService, private colorService: ColorService) {
        super(drawingService);
        this.pencilStyle = pencilConstants.DEFAULT_PENCIL_STYLE;
        this.clearPath();
    }

    onSelect(): void {
        // this.drawingService.baseCtx.strokeStyle = this.pencilStyle;
        // this.drawingService.previewCtx.strokeStyle = this.pencilStyle;
        this.drawingService.baseCtx.lineCap = pencilConstants.LINE_CAP_ROUND;
        this.colorService.setStrokingColor();
    }

    onDeSelect(): void {
        // this.pencilStyle = this.drawingService.baseCtx.strokeStyle;
    }

    onMouseDown(event: MouseEvent): void {
        this.colorService.setStrokingColor();
        this.startDrawing(event);
        this.undoRedoService.toolIsUsed = true;
    }

    onMouseUp(event: MouseEvent): void {
        this.stopDrawing(event);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseLeave(event: MouseEvent): void {
        this.stopDrawing(event);
    }

    onMouseEnter(event: MouseEvent): void {
        this.startDrawing(event);
    }

    onSizeChange(size: number): void {
        if (size >= pencilConstants.MIN_WIDTH && size <= pencilConstants.MAX_WIDTH) {
            this.drawingService.baseCtx.lineWidth = size;
            this.drawingService.previewCtx.lineWidth = size;
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        ctx.lineCap = 'round';
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    private startDrawing(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;

        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    private stopDrawing(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawLine(this.drawingService.baseCtx, this.pathData);
            this.undoRedoService.toolIsUsed = false;
            this.undoRedoService.saveCurrentState(
                this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
            );
        }
        this.mouseDown = false;
        this.clearPath();
    }
}
