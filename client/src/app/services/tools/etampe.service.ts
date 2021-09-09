import { Injectable } from '@angular/core';
import { StampInformation } from '@app/classes/stamp-information';
import { STAMP } from '@app/classes/stamp-list';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class EtampeService extends Tool {
    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.imageStamp = new Image();
        this.imageStamp.width = 40;
        this.imageStamp.height = 40;
        this.selectedStamp.id = 0;
        this.miseAEchelle = 1;
        this.iHeightScale = 40;
        this.iWidthScale = 40;

        // this.imageStamp.style.width = 40 + 'px';
        // this.imageStamp.style.height = 40 + 'px';
    }

    stampInformation: StampInformation;
    angle: number;
    miseAEchelle: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    currentMousePosition: Vec2;
    stamp: StampInformation[] = STAMP;
    selectedStamp: StampInformation = this.stamp[0];
    size: number;
    fileName: string;
    defaultSize: number = 40;
    imageStamp: HTMLImageElement;
    initialCursorPosition: Vec2;
    iWidthScale: number;
    iHeightScale: number;
    altEvent: boolean;

    private createStampCursor(): void {
        // Create html div
        this.drawingService.previewCanvas.insertAdjacentElement('afterend', this.imageStamp);

        // Changes styles
        this.drawingService.previewCanvas.style.cursor = 'none';
        this.drawingService.canvas.style.cursor = 'none';
        this.imageStamp.style.position = 'absolute';
        this.imageStamp.style.cursor = 'none';
        this.initialCursorPosition = { x: this.imageStamp.getBoundingClientRect().x, y: this.imageStamp.getBoundingClientRect().y };
    }

    private deleteStampCursor(): void {
        if (this.imageStamp) this.imageStamp.remove();
    }

    onAngleChange(size: number): void {
        this.angle = size;
        this.imageStamp.style.transform = 'rotate(' + this.angle + 'rad)';
    }

    onMiseAEchelleChange(size: number): void {
        this.miseAEchelle = size;
        this.iHeightScale = this.defaultSize * this.miseAEchelle;
        this.iWidthScale = this.defaultSize * this.miseAEchelle;
        this.imageStamp.style.width = this.iWidthScale + 'px';
        this.imageStamp.style.height = this.iHeightScale + 'px';
    }

    onStampChange(selectedStamp: StampInformation): void {
        this.fileName = selectedStamp.src;
    }

    onMouseDown(event: MouseEvent): void {
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.putStamp(this.drawingService.baseCtx);
        this.undoRedoService.toolIsUsed = false;
        this.undoRedoService.saveCurrentState(
            this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
        );
    }

    onMouseMove(event: MouseEvent): void {
        if (this.imageStamp && this.initialCursorPosition) {
            const top: number = event.pageY - (this.initialCursorPosition.y + this.imageStamp.width / 2);
            const left: number = event.pageX - (this.initialCursorPosition.x + this.imageStamp.height / 2);
            this.imageStamp.style.left = left + 'px';
            this.imageStamp.style.top = top + 'px';
        }
        this.drawingService.previewCanvas.style.cursor = 'none';
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Alt') {
            this.altEvent = true;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Alt') {
            this.altEvent = false;
        }
    }

    onWheel(event: WheelEvent): void {
        if (this.altEvent === true) {
            if (event.deltaY > 0) {
                this.angle -= 1;
            } else if (event.deltaY < 0) {
                this.angle += 1;
            }
        } else {
            if (event.deltaY > 0) {
                this.angle -= 15;
            } else if (event.deltaY < 0) {
                this.angle += 15;
            }
        }
        this.imageStamp.style.transform = 'rotate(' + this.angle + 'rad)';
    }

    putStamp(ctx: CanvasRenderingContext2D): void {
        this.imageStamp.src = this.fileName;

        ctx.save();
        ctx.translate(this.currentMousePosition.x - this.iWidthScale / 2, this.currentMousePosition.y - this.iHeightScale / 2);
        ctx.rotate(this.angle);
        ctx.translate(-(this.currentMousePosition.x - this.iWidthScale / 2), -(this.currentMousePosition.y - this.iHeightScale / 2));
        ctx.drawImage(
            this.imageStamp,
            this.currentMousePosition.x - this.imageStamp.width / 2,
            this.currentMousePosition.y - this.imageStamp.height / 2,
            this.iWidthScale,
            this.iHeightScale,
        );
        ctx.restore();
    }

    onSelect(): void {
        this.angle = 0;
        this.miseAEchelle = 1;
        this.fileName = this.selectedStamp.src;
        this.drawingService.previewCanvas.style.cursor = 'none';
        this.drawingService.canvas.style.cursor = 'none';
        this.createStampCursor();
    }

    onDeSelect(): void {
        this.deleteStampCursor();
        this.drawingService.previewCanvas.style.cursor = 'crosshair';
        this.drawingService.canvas.style.cursor = 'crosshair';
    }
}
