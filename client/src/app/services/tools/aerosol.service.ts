import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorService } from './color.service';
import * as aerosolConstants from './tools-constants/aerosol-service-constants';

@Injectable({
    providedIn: 'root',
})
export class AerosolService extends Tool {
    pathData: Vec2[];
    radius: number;
    diametre: number;
    emission: number;
    angle: number;
    currentMousePosition: Vec2;
    timeout: number;

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService, private colorService: ColorService) {
        super(drawingService);
        this.clearPath();
        this.currentMousePosition = { x: 0, y: 0 };
    }

    onMouseDown(event: MouseEvent): void {
        this.startSpraying(event);
        this.undoRedoService.toolIsUsed = true;
    }

    onMouseUp(event: MouseEvent): void {
        this.stopSpraying(event);
        clearTimeout(this.timeout);
        this.undoRedoService.toolIsUsed = false;
        this.undoRedoService.saveCurrentState(
            this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
        );
    }

    onMouseMove(event: MouseEvent): void {
        this.colorService.setFillingColor();
        this.currentMousePosition = this.getPositionFromMouse(event);
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
    }

    onSizeChange(size: number): void {
        this.radius = size;
    }

    onEmissionChange(size: number): void {
        this.emission = size * aerosolConstants.SECOND;
    }

    onGouteletteChange(size: number): void {
        this.diametre = size;
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }

    private drawSpray(ctx: CanvasRenderingContext2D): void {
        const time = 1;
        const density: number = Math.round(this.emission / aerosolConstants.SECOND);
        this.timeout = window.setTimeout(() => {
            for (let i = density; i--; ) {
                const angle = this.getRandomInt(0, aerosolConstants.FULL_CIRCLE);
                const radius = this.getRandomInt(-this.radius, this.radius);
                ctx.fillRect(
                    this.currentMousePosition.x + radius * Math.cos(angle),
                    this.currentMousePosition.y + radius * Math.sin(angle),
                    this.diametre,
                    this.diametre,
                );
            }
            if (!this.timeout) return;
            this.drawSpray(ctx);
        }, time);
    }

    private startSpraying(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.drawSpray(this.drawingService.baseCtx);
        }
    }

    private stopSpraying(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    onSelect(): void {
        this.drawingService.baseCtx.strokeStyle = aerosolConstants.DEFAULT_AEROSOL_STYLE;
        this.radius = aerosolConstants.BASE_RADIUS;
        this.diametre = 1;
        this.emission = aerosolConstants.BASE_EMISSION;
        this.colorService.setFillingColor();
    }
}
