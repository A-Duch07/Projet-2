import { CanvasAttributes } from './canvas-attributes';

export class SaveCanvasAttributes {
    private savedCanvas: CanvasAttributes[];

    constructor() {
        this.savedCanvas = [];
    }

    save(ctx: CanvasRenderingContext2D): void {
        const currentSavedCanvas: CanvasAttributes = {
            lineWidth: ctx.lineWidth,
            lineCap: ctx.lineCap,
            lineJoin: ctx.lineJoin,
            lineDashOffset: ctx.lineDashOffset,
            font: ctx.font,
            textAlign: ctx.textAlign,
            textBaseline: ctx.textBaseline,
            miterLimit: ctx.miterLimit,
            direction: ctx.direction,
            fillStyle: ctx.fillStyle,
            strokeStyle: ctx.strokeStyle,
            shadowBlur: ctx.shadowBlur,
            shadowColor: ctx.shadowColor,
            shadowOffsetX: ctx.shadowOffsetX,
            shadowOffsetY: ctx.shadowOffsetY,
            globalAlpha: ctx.globalAlpha,
            globalCompositeOperation: ctx.globalCompositeOperation,
            imageSmoothingEnabled: ctx.imageSmoothingEnabled,
            imageSmoothingQuality: ctx.imageSmoothingQuality,
        };
        this.savedCanvas.push(currentSavedCanvas);
    }

    restore(ctx: CanvasRenderingContext2D): void {
        if (this.savedCanvas.length > 0) {
            const currentSavedCanvas = this.savedCanvas.shift() as CanvasAttributes;
            if (currentSavedCanvas) {
                ctx.lineWidth = currentSavedCanvas.lineWidth;
                ctx.lineCap = currentSavedCanvas.lineCap;
                ctx.lineJoin = currentSavedCanvas.lineJoin;
                ctx.miterLimit = currentSavedCanvas.miterLimit;
                ctx.lineDashOffset = currentSavedCanvas.lineDashOffset;
                ctx.font = currentSavedCanvas.font;
                ctx.textAlign = currentSavedCanvas.textAlign;
                ctx.textBaseline = currentSavedCanvas.textBaseline;
                ctx.direction = currentSavedCanvas.direction;
                ctx.fillStyle = currentSavedCanvas.fillStyle;
                ctx.strokeStyle = currentSavedCanvas.strokeStyle;
                ctx.shadowBlur = currentSavedCanvas.shadowBlur;
                ctx.shadowColor = currentSavedCanvas.shadowColor;
                ctx.shadowOffsetX = currentSavedCanvas.shadowOffsetX;
                ctx.shadowOffsetY = currentSavedCanvas.shadowOffsetY;
                ctx.globalAlpha = currentSavedCanvas.globalAlpha;
                ctx.globalCompositeOperation = currentSavedCanvas.globalCompositeOperation;
                ctx.imageSmoothingEnabled = currentSavedCanvas.imageSmoothingEnabled;
                ctx.imageSmoothingQuality = currentSavedCanvas.imageSmoothingQuality;
            }
        }
    }
}
