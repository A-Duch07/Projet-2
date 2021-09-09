import { Injectable } from '@angular/core';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionDrawService } from '@app/services/drawing/selection-draw-service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    constructor(private selectionDrawService: SelectionDrawService, private drawingService: DrawingService) {}
    private copyResizeAttributes: ResizeAttributes;

    copySelection(resizeAttributes: ResizeAttributes): void {
        if (this.drawingService.imageSelected) {
            this.drawingService.saveClipboard(resizeAttributes);

            let originXAdjustment = 0;
            if (resizeAttributes.width < 0) {
                originXAdjustment -= resizeAttributes.width;
            }

            let originYAdjustment = 0;
            if (resizeAttributes.height < 0) {
                originYAdjustment -= resizeAttributes.height;
            }

            this.copyResizeAttributes = {
                x: 0 + originXAdjustment,
                y: 0 + originYAdjustment,
                startingX: 0 + originXAdjustment,
                startingY: 0 + originYAdjustment,
                width: resizeAttributes.width,
                height: resizeAttributes.height,
                startingWidth: resizeAttributes.width,
                startingHeight: resizeAttributes.height,
                selectionType: resizeAttributes.selectionType,
                flippedX: false,
                flippedY: false,
                selectionPositions: [],
            };

            let changeMoveX = resizeAttributes.x - resizeAttributes.startingX;
            let changeMoveY = resizeAttributes.y - resizeAttributes.startingY;
            let changeScaleX = resizeAttributes.width / resizeAttributes.startingWidth;
            let changeScaleY = resizeAttributes.height / resizeAttributes.startingHeight;

            for (let i = 0; i < resizeAttributes.selectionPositions.length; i++) {
                this.copyResizeAttributes.selectionPositions.push({
                    x: (resizeAttributes.selectionPositions[i].x - resizeAttributes.x + changeMoveX) * changeScaleX + originXAdjustment,
                    y: (resizeAttributes.selectionPositions[i].y - resizeAttributes.y + changeMoveY) * changeScaleY + originYAdjustment,
                });
            }
        }
    }

    pasteSelection(resizeAttributes: ResizeAttributes): ResizeAttributes {
        if (this.drawingService.clipboardFull) {
            this.drawingService.imageSelected = true;
            this.selectionDrawService.drawBaseCanvas(resizeAttributes);
            this.drawingService.baseCtx.save();
            this.drawingService.baseCtx.fillStyle = 'white';
            this.drawingService.baseCtx.fillRect(
                0,
                0,
                Math.abs(this.copyResizeAttributes.startingWidth),
                Math.abs(this.copyResizeAttributes.startingHeight),
            );

            this.drawingService.clipboardReady = true;
            this.selectionDrawService.drawSelectionCanvas(this.copyResizeAttributes);
            this.drawingService.clipboardReady = false;
            return this.copyResizeAttributes;
        } else {
            return resizeAttributes;
        }
    }

    cutSelection(resizeAttributes: ResizeAttributes): void {
        this.copySelection(resizeAttributes);
        this.deleteSelection(resizeAttributes);
    }

    deleteSelection(resizeAttributes: ResizeAttributes): void {
        this.selectionDrawService.drawBaseCanvas(resizeAttributes);
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawingService.baseCtx.fillRect(resizeAttributes.x, resizeAttributes.y, resizeAttributes.width, resizeAttributes.height);
        this.drawingService.baseCtx.restore();
        this.drawingService.selectionCtx.clearRect(0, 0, this.drawingService.selectionCanvas.width, this.drawingService.selectionCanvas.height);
        this.drawingService.imageSelected = false;
    }
}
