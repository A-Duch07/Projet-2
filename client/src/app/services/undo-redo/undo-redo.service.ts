import { Injectable } from '@angular/core';
import { SaveCanvasAttributes } from '@app/classes/save-canvas-attributes';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    modifications: ImageData[];
    undos: ImageData[];
    toolIsUsed: boolean;
    private saveCanvasAttributes: SaveCanvasAttributes = new SaveCanvasAttributes();

    constructor(private drawingService: DrawingService) {
        this.modifications = [];
        this.undos = [];
        this.toolIsUsed = false;
    }

    saveCurrentState(image: ImageData): void {
        this.modifications.push(image);
        this.undos = [];
    }

    undo(): void {
        if (this.modifications.length > 1 && !this.toolIsUsed) {
            this.undos.push(this.modifications[this.modifications.length - 1]);
            const sizes: number[] = [];
            sizes.push(this.modifications[this.modifications.length - 2].width);
            sizes.push(this.modifications[this.modifications.length - 2].height);
            this.resizeExistingCanvas(sizes);
            this.drawingService.baseCtx.putImageData(this.modifications[this.modifications.length - 2], 0, 0);
            this.drawingService.previewCtx.putImageData(this.modifications[this.modifications.length - 2], 0, 0);
            this.modifications.pop();
        }
    }

    redo(): void {
        if (this.undos.length >= 1 && !this.toolIsUsed) {
            this.modifications.push(this.undos[this.undos.length - 1]);
            const sizes: number[] = [];
            sizes.push(this.undos[this.undos.length - 1].width);
            sizes.push(this.undos[this.undos.length - 1].height);
            this.resizeExistingCanvas(sizes);
            this.drawingService.baseCtx.putImageData(this.undos[this.undos.length - 1], 0, 0);
            this.drawingService.previewCtx.putImageData(this.undos[this.undos.length - 1], 0, 0);
            this.undos.pop();
        }
    }

    resizeExistingCanvas(newDimensions: number[]): void {
        const SAVEDCTX: ImageData = this.drawingService.baseCtx.getImageData(
            0,
            0,
            this.drawingService.canvas.width,
            this.drawingService.canvas.height,
        );
        this.saveCanvasAttributes.save(this.drawingService.baseCtx);
        this.saveCanvasAttributes.save(this.drawingService.previewCtx);
        this.drawingService.canvas.width = newDimensions[0];
        this.drawingService.canvas.height = newDimensions[1];
        this.drawingService.previewCanvas.width = newDimensions[0];
        this.drawingService.previewCanvas.height = newDimensions[1];
        this.drawingService.baseCtx.putImageData(SAVEDCTX, 0, 0);
        this.saveCanvasAttributes.restore(this.drawingService.baseCtx);
        this.saveCanvasAttributes.restore(this.drawingService.previewCtx);
    }

    getUndoButtonAvailability(): boolean {
        if (this.modifications.length <= 1) {
            return true;
        }
        if (this.toolIsUsed) {
            return true;
        }
        return false;
        // test
    }

    getRedoButtonAvailability(): boolean {
        if (this.undos.length < 1) {
            return true;
        }
        if (this.toolIsUsed) {
            return true;
        }
        return false;
    }
}
