import { Injectable } from '@angular/core';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as resizeConstants from './resize-constants';

@Injectable({
    providedIn: 'root',
})
export class SelectionDrawService {
    private usedX: number;
    private usedY: number;
    private usedWidth: number;
    private usedHeight: number;
    private usedPoints: Vec2[];

    constructor(private drawingService: DrawingService) {}

    drawSelectionCanvas(resizeAttributes: ResizeAttributes): void {
        // let changeMoveX = resizeAttributes.startingX - resizeAttributes.x;
        // let changeMoveY = resizeAttributes.startingY - resizeAttributes.y;
        let changeMoveX = resizeAttributes.x - resizeAttributes.startingX;
        let changeMoveY = resizeAttributes.y - resizeAttributes.startingY;
        let changeScaleX = resizeAttributes.width / resizeAttributes.startingWidth;
        let changeScaleY = resizeAttributes.height / resizeAttributes.startingHeight;
        // let changeScaleX = -resizeAttributes.startingWidth / resizeAttributes.width;
        // let changeScaleY = -resizeAttributes.startingHeight / resizeAttributes.height;
        // let changeScaleMoveY = resizeAttributes.height - resizeAttributes.startingHeight;
        // let changeScaleMoveX = resizeAttributes.width - resizeAttributes.startingWidth;
        this.usedPoints = [];

        for (let i = 0; i < resizeAttributes.selectionPositions.length; i++) {
            // let x = resizeAttributes.selectionPositions[i].x * changeScaleX + changeMoveX;
            // let y = resizeAttributes.selectionPositions[i].y * changeScaleY + changeMoveY;
            // let diffX = x - resizeAttributes.selectionPositions[i].x;
            // let diffY = y - resizeAttributes.selectionPositions[i].y;
            this.usedPoints.push({
                // x: resizeAttributes.selectionPositions[i].x * changeScaleX - changeScaleMoveX * changeScaleX + changeMoveX,
                // y: resizeAttributes.selectionPositions[i].y * changeScaleY - changeScaleMoveY * changeScaleY + changeMoveY,
                // x: resizeAttributes.selectionPositions[i].x * changeScaleX - resizeAttributes.x * changeScaleX - resizeAttributes.x + changeMoveX,
                // y: resizeAttributes.selectionPositions[i].y * changeScaleY - resizeAttributes.y * changeScaleY - resizeAttributes.y + changeMoveY,
                x: (resizeAttributes.selectionPositions[i].x - resizeAttributes.x + changeMoveX) * changeScaleX + resizeAttributes.x,
                y: (resizeAttributes.selectionPositions[i].y - resizeAttributes.y + changeMoveY) * changeScaleY + resizeAttributes.y,
                // x: x - diffX,
                // y: y - diffY,
            });
        }

        this.drawingService.selectionCtx.clearRect(0, 0, this.drawingService.selectionCanvas.width, this.drawingService.selectionCanvas.height);
        this.drawingService.selectionCtx.save();
        this.drawingService.selectionCtx.beginPath();
        this.drawingService.selectionCtx.rect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.drawingService.selectionCtx.clip();
        this.drawingService.selectionCtx.closePath();
        this.drawSelection(this.drawingService.selectionCtx, resizeAttributes);
        this.drawingService.selectionCtx.restore();

        this.drawControl(resizeAttributes.x, resizeAttributes.y);
        this.drawControl(resizeAttributes.x + resizeAttributes.width / 2, resizeAttributes.y);
        this.drawControl(resizeAttributes.x + resizeAttributes.width, resizeAttributes.y);
        this.drawControl(resizeAttributes.x, resizeAttributes.y + resizeAttributes.height / 2);
        this.drawControl(resizeAttributes.x + resizeAttributes.width, resizeAttributes.y + resizeAttributes.height / 2);
        this.drawControl(resizeAttributes.x, resizeAttributes.y + resizeAttributes.height);
        this.drawControl(resizeAttributes.x + resizeAttributes.width / 2, resizeAttributes.y + resizeAttributes.height);
        this.drawControl(resizeAttributes.x + resizeAttributes.width, resizeAttributes.y + resizeAttributes.height);

        this.drawingService.selectionCtx.setLineDash([resizeConstants.lineDashAttribute1, resizeConstants.lineDashAttribute2]);
        if (resizeAttributes.selectionType === 2) {
            this.drawingService.selectionCtx.beginPath();
            this.drawingService.selectionCtx.ellipse(
                resizeAttributes.x + resizeAttributes.width / 2,
                resizeAttributes.y + resizeAttributes.height / 2,
                Math.abs(resizeAttributes.width / 2),
                Math.abs(resizeAttributes.height / 2),
                0,
                0,
                Math.PI * 2,
            );
            this.drawingService.selectionCtx.closePath();
            this.drawingService.selectionCtx.stroke();
        }

        if (resizeAttributes.selectionType === 3) {
            // this.drawingService.selectionCtx.save();
            // this.drawingService.selectionCtx.scale(1, changeScaleY);
            this.drawingService.selectionCtx.beginPath();
            this.drawingService.selectionCtx.moveTo(this.usedPoints[0].x, this.usedPoints[0].y);
            for (let i = 1; i < this.usedPoints.length; i++) {
                this.drawingService.selectionCtx.lineTo(this.usedPoints[i].x, this.usedPoints[i].y);
            }
            this.drawingService.selectionCtx.closePath();
            this.drawingService.selectionCtx.stroke();
            // this.drawingService.selectionCtx.restore();
        }

        this.drawingService.selectionCtx.beginPath();
        this.drawingService.selectionCtx.moveTo(resizeAttributes.x, resizeAttributes.y);
        this.drawingService.selectionCtx.lineTo(resizeAttributes.x + resizeAttributes.width, resizeAttributes.y);
        this.drawingService.selectionCtx.lineTo(resizeAttributes.x + resizeAttributes.width, resizeAttributes.y + resizeAttributes.height);
        this.drawingService.selectionCtx.lineTo(resizeAttributes.x, resizeAttributes.y + resizeAttributes.height);
        this.drawingService.selectionCtx.closePath();
        this.drawingService.selectionCtx.stroke();
        this.drawingService.selectionCtx.setLineDash([]);
    }

    drawBaseCanvas(resizeAttributes: ResizeAttributes): void {
        console.log(resizeAttributes.x);
        this.drawSelection(this.drawingService.selectionCtx, resizeAttributes);
        this.drawingService.baseCtx.drawImage(this.drawingService.selectionCanvas, 0, 0);
        this.drawingService.selectionCtx.clearRect(0, 0, this.drawingService.selectionCanvas.width, this.drawingService.selectionCanvas.height);
    }

    private drawControl(x: number, y: number): void {
        this.drawingService.selectionCtx.beginPath();
        this.drawingService.selectionCtx.arc(x, y, resizeConstants.arcRadius, 0, Math.PI * 2);
        this.drawingService.selectionCtx.closePath();
        this.drawingService.selectionCtx.fill();
    }

    drawSelection(ctx: CanvasRenderingContext2D, resizeAttributes: ResizeAttributes): void {
        this.drawingService.selectionCtx.clearRect(0, 0, this.drawingService.selectionCanvas.width, this.drawingService.selectionCanvas.height);
        this.usedX = resizeAttributes.x;
        this.usedY = resizeAttributes.y;
        this.usedWidth = resizeAttributes.width;
        this.usedHeight = resizeAttributes.height;

        if (resizeAttributes.selectionType === 2) {
            this.drawEllipse(ctx, resizeAttributes);
        } else if (resizeAttributes.selectionType === 3) {
            this.drawLasso(ctx, resizeAttributes);
        } else {
            this.drawRectangle(ctx, resizeAttributes);
        }
    }

    drawEllipse(ctx: CanvasRenderingContext2D, resizeAttributes: ResizeAttributes): void {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
            resizeAttributes.startingX + resizeAttributes.startingWidth / 2,
            resizeAttributes.startingY + resizeAttributes.startingHeight / 2,
            Math.abs(resizeAttributes.startingWidth / 2),
            Math.abs(resizeAttributes.startingHeight / 2),
            0,
            0,
            Math.PI * 2,
        );
        ctx.clip();
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fillRect(resizeAttributes.startingX, resizeAttributes.startingY, resizeAttributes.startingWidth, resizeAttributes.startingHeight);
        ctx.fillStyle = 'black';
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
            resizeAttributes.x + resizeAttributes.width / 2,
            resizeAttributes.y + resizeAttributes.height / 2,
            Math.abs(resizeAttributes.width / 2),
            Math.abs(resizeAttributes.height / 2),
            0,
            0,
            Math.PI * 2,
        );
        ctx.clip();
        ctx.closePath();

        if (this.drawingService.clipboardReady) {
            this.drawingService.baseCtx.save();
            this.drawingService.baseCtx.beginPath();
            this.drawingService.baseCtx.ellipse(
                resizeAttributes.x + resizeAttributes.width / 2,
                resizeAttributes.y + resizeAttributes.height / 2,
                Math.abs(resizeAttributes.width / 2),
                Math.abs(resizeAttributes.height / 2),
                0,
                0,
                Math.PI * 2,
            );
            this.drawingService.baseCtx.clip();
            this.drawingService.baseCtx.closePath();
            this.drawingService.baseCtx.drawImage(this.drawingService.clipboardCanvas, 0, 0);
            this.drawingService.baseCtx.restore();
        }

        ctx.fillStyle = 'white';
        ctx.fillRect(resizeAttributes.x, resizeAttributes.y, resizeAttributes.width, resizeAttributes.height);
        ctx.fillStyle = 'black';
        ctx.save();
        if (resizeAttributes.flippedX && resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(-1, -1);
            this.usedX = -resizeAttributes.x;
            this.usedY = -resizeAttributes.y;
            this.usedWidth = -resizeAttributes.width;
            this.usedHeight = -resizeAttributes.height;
        } else if (resizeAttributes.flippedX && !resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(-1, 1);
            this.usedX = -resizeAttributes.x;
            this.usedWidth = -resizeAttributes.width;
        } else if (!resizeAttributes.flippedX && resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(1, -1);
            this.usedY = -resizeAttributes.y;
            this.usedHeight = -resizeAttributes.height;
        }
        // if (this.drawingService.clipboardReady) {
        //     this.drawingService.selectionCtx.drawImage(this.drawingService.clipboardCanvas, 0, 0);
        // } else {
        this.drawingService.selectionCtx.drawImage(
            this.drawingService.canvas,
            resizeAttributes.startingX,
            resizeAttributes.startingY,
            resizeAttributes.startingWidth,
            resizeAttributes.startingHeight,
            this.usedX,
            this.usedY,
            this.usedWidth,
            this.usedHeight,
        );
        //}
        ctx.restore();
        ctx.restore();
    }

    drawRectangle(ctx: CanvasRenderingContext2D, resizeAttributes: ResizeAttributes): void {
        ctx.fillStyle = 'white';
        ctx.fillRect(resizeAttributes.startingX, resizeAttributes.startingY, resizeAttributes.startingWidth, resizeAttributes.startingHeight);
        ctx.fillStyle = 'white';
        ctx.fillRect(resizeAttributes.x, resizeAttributes.y, resizeAttributes.width, resizeAttributes.height);
        ctx.fillStyle = 'black';

        ctx.save();
        if (resizeAttributes.flippedX && resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(-1, -1);
            this.usedX = -resizeAttributes.x;
            this.usedY = -resizeAttributes.y;
            this.usedWidth = -resizeAttributes.width;
            this.usedHeight = -resizeAttributes.height;
        } else if (resizeAttributes.flippedX && !resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(-1, 1);
            this.usedX = -resizeAttributes.x;
            this.usedWidth = -resizeAttributes.width;
        } else if (!resizeAttributes.flippedX && resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(1, -1);
            this.usedY = -resizeAttributes.y;
            this.usedHeight = -resizeAttributes.height;
        }
        if (this.drawingService.clipboardReady) {
            this.drawingService.baseCtx.drawImage(this.drawingService.clipboardCanvas, 0, 0);
        }
        this.drawingService.selectionCtx.drawImage(
            this.drawingService.canvas,
            resizeAttributes.startingX,
            resizeAttributes.startingY,
            resizeAttributes.startingWidth,
            resizeAttributes.startingHeight,
            this.usedX,
            this.usedY,
            this.usedWidth,
            this.usedHeight,
        );
        //}
        ctx.restore();
    }

    drawLasso(ctx: CanvasRenderingContext2D, resizeAttributes: ResizeAttributes): void {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(resizeAttributes.selectionPositions[0].x, resizeAttributes.selectionPositions[0].y);
        for (let i = 1; i < resizeAttributes.selectionPositions.length; i++) {
            ctx.lineTo(resizeAttributes.selectionPositions[i].x, resizeAttributes.selectionPositions[i].y);
        }
        ctx.clip();
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fillRect(resizeAttributes.startingX, resizeAttributes.startingY, resizeAttributes.startingWidth, resizeAttributes.startingHeight);
        ctx.fillStyle = 'black';
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.usedPoints[0].x, this.usedPoints[0].y);
        for (let i = 1; i < this.usedPoints.length; i++) {
            ctx.lineTo(this.usedPoints[i].x, this.usedPoints[i].y);
        }
        ctx.clip();
        ctx.closePath();

        if (this.drawingService.clipboardReady) {
            this.drawingService.baseCtx.save();
            this.drawingService.baseCtx.beginPath();
            this.drawingService.baseCtx.moveTo(this.usedPoints[0].x, this.usedPoints[0].y);
            for (let i = 1; i < this.usedPoints.length; i++) {
                this.drawingService.baseCtx.lineTo(this.usedPoints[i].x, this.usedPoints[i].y);
            }
            this.drawingService.baseCtx.clip();
            this.drawingService.baseCtx.closePath();
            this.drawingService.baseCtx.drawImage(this.drawingService.clipboardCanvas, 0, 0);
            this.drawingService.baseCtx.restore();
        }

        ctx.fillStyle = 'white';
        ctx.fillRect(resizeAttributes.x, resizeAttributes.y, resizeAttributes.width, resizeAttributes.height);
        ctx.fillStyle = 'black';
        ctx.save();
        if (resizeAttributes.flippedX && resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(-1, -1);
            this.usedX = -resizeAttributes.x;
            this.usedY = -resizeAttributes.y;
            this.usedWidth = -resizeAttributes.width;
            this.usedHeight = -resizeAttributes.height;
        } else if (resizeAttributes.flippedX && !resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(-1, 1);
            this.usedX = -resizeAttributes.x;
            this.usedWidth = -resizeAttributes.width;
        } else if (!resizeAttributes.flippedX && resizeAttributes.flippedY) {
            this.drawingService.selectionCtx.scale(1, -1);
            this.usedY = -resizeAttributes.y;
            this.usedHeight = -resizeAttributes.height;
        }
        // if (this.drawingService.clipboardReady) {
        //     this.drawingService.selectionCtx.drawImage(this.drawingService.clipboardCanvas, 0, 0);
        // } else {
        this.drawingService.selectionCtx.drawImage(
            this.drawingService.canvas,
            resizeAttributes.startingX,
            resizeAttributes.startingY,
            resizeAttributes.startingWidth,
            resizeAttributes.startingHeight,
            this.usedX,
            this.usedY,
            this.usedWidth,
            this.usedHeight,
        );
        //}
        ctx.restore();
        ctx.restore();
    }
}
