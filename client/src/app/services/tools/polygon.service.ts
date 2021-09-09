import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorService } from './color.service';
import * as polygonConstants from './tools-constants/polygon-service-constants';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Tool {
    edgesAmount: number;
    startingPosition: Vec2;
    endingPosition: Vec2;
    circleCenter: Vec2;
    currentStyle: number;
    angleTemp: number;
    mouseDown: boolean;

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService, private colorService: ColorService) {
        super(drawingService);
        this.circleCenter = { x: 0, y: 0 };
        this.currentStyle = 0;
        this.angleTemp = 0;
    }

    onSelect(): void {
        this.drawingService.baseCtx.lineCap = polygonConstants.LINE_CAP_ROUND;
        this.drawingService.previewCtx.lineCap = polygonConstants.LINE_CAP_ROUND;
        this.drawingService.baseCtx.lineWidth = polygonConstants.BASE_SIZE;
        this.drawingService.previewCtx.lineWidth = polygonConstants.BASE_SIZE;
        this.edgesAmount = polygonConstants.BASE_EDGES_AMOUNT;
        this.colorService.setFillingColor();
    }

    onSizeChange(size: number): void {
        let verifiedInput = size;
        if (size <= polygonConstants.MIN_INPUT) {
            verifiedInput = polygonConstants.MIN_INPUT;
        } else if (size >= polygonConstants.MAX_INPUT) {
            verifiedInput = polygonConstants.MAX_INPUT;
        }
        this.drawingService.baseCtx.lineWidth = verifiedInput;
        this.drawingService.previewCtx.lineWidth = verifiedInput;
    }

    onEdgesChange(amount: number): void {
        let verifiedAmount = amount;
        if (amount <= polygonConstants.MIN_EDGES) {
            verifiedAmount = polygonConstants.MIN_EDGES;
        } else if (amount >= polygonConstants.MAX_EDGES) {
            verifiedAmount = polygonConstants.MAX_EDGES;
        }
        this.edgesAmount = verifiedAmount;
    }

    onMouseDown(event: MouseEvent): void {
        this.colorService.setFillingColor();
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPositions();
            this.startingPosition = this.getPositionFromMouse(event);
            this.undoRedoService.toolIsUsed = true;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endingPosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.previewCtx, this.drawingService.previewCtx, this.getCircleRadius());
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.draw(this.drawingService.baseCtx, this.drawingService.previewCtx, this.getCircleRadius());
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.endingPosition = this.getPositionFromMouse(event);
            this.drawPolygon(this.drawingService.baseCtx, this.getCircleRadius());
            this.mouseDown = false;
            this.clearPositions();
            this.undoRedoService.toolIsUsed = false;
            this.undoRedoService.saveCurrentState(
                this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
            );
        }
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, radius: number): void {
        if (this.endingPosition.x - this.startingPosition.x >= 0) {
            this.circleCenter.x = this.startingPosition.x + radius;
        } else {
            this.circleCenter.x = this.startingPosition.x - radius;
        }
        if (this.endingPosition.y - this.startingPosition.y >= 0) {
            this.circleCenter.y = this.startingPosition.y + radius;
        } else {
            this.circleCenter.y = this.startingPosition.y - radius;
        }
        this.drawingService.previewCtx.lineWidth = 1;
        ctx.beginPath();
        ctx.setLineDash([polygonConstants.LINE_DASH_LOW_VALUE, polygonConstants.LINE_DASH_HIGH_VALUE]);
        ctx.ellipse(this.circleCenter.x, this.circleCenter.y, radius, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        this.drawingService.previewCtx.lineWidth = this.drawingService.baseCtx.lineWidth;
    }

    getCircleRadius(): number {
        const xAxis = Math.abs(this.startingPosition.x - this.endingPosition.x);
        const yAxis = Math.abs(this.startingPosition.y - this.endingPosition.y);
        if (xAxis <= yAxis) {
            return xAxis / 2;
        }
        return yAxis / 2;
    }

    drawPolygon(ctx: CanvasRenderingContext2D, radius: number): void {
        const innerAngle = polygonConstants.FULL_CIRCLE / this.edgesAmount;
        this.angleTemp = 0;
        if (innerAngle >= polygonConstants.QUARTER_CIRCLE) {
            this.angleTemp = polygonConstants.QUARTER_CIRCLE;
        } else {
            this.angleTemp = polygonConstants.QUARTER_CIRCLE - Math.floor(polygonConstants.QUARTER_CIRCLE / innerAngle) * innerAngle;
        }
        ctx.lineTo(
            this.circleCenter.x + radius * Math.cos((this.angleTemp * Math.PI) / polygonConstants.HALF_CIRCLE),
            this.circleCenter.y + radius * -Math.sin((this.angleTemp * Math.PI) / polygonConstants.HALF_CIRCLE),
        );
        for (let i = 0; i < this.edgesAmount; i++) {
            this.angleTemp += innerAngle;
            ctx.lineTo(
                this.circleCenter.x + radius * Math.cos((this.angleTemp * Math.PI) / polygonConstants.HALF_CIRCLE),
                this.circleCenter.y + radius * -Math.sin((this.angleTemp * Math.PI) / polygonConstants.HALF_CIRCLE),
            );
        }
    }

    draw(ctxPolygon: CanvasRenderingContext2D, ctxCircle: CanvasRenderingContext2D, radius: number): void {
        switch (this.currentStyle) {
            case 0:
                this.drawPerimeter(ctxCircle, radius);
                ctxPolygon.beginPath();
                this.drawPolygon(ctxPolygon, radius);
                ctxPolygon.stroke();
                break;
            case 1:
                this.drawPerimeter(ctxCircle, radius);
                ctxPolygon.beginPath();
                ctxPolygon.save();
                this.drawPolygon(ctxPolygon, radius);
                ctxPolygon.clip();
                ctxPolygon.fillRect(this.circleCenter.x - radius, this.circleCenter.y - radius, 2 * radius, 2 * radius);
                ctxPolygon.restore();
                break;
            case 2:
                this.drawPerimeter(ctxCircle, radius);
                ctxPolygon.beginPath();
                ctxPolygon.save();
                this.drawPolygon(ctxPolygon, radius);
                ctxPolygon.clip();
                ctxPolygon.fillRect(this.circleCenter.x - radius, this.circleCenter.y - radius, 2 * radius, 2 * radius);
                ctxPolygon.restore();
                ctxPolygon.stroke();
                break;
            default:
        }
    }

    clearPositions(): void {
        this.startingPosition = { x: 0, y: 0 };
        this.endingPosition = { x: 0, y: 0 };
    }
}
