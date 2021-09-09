export interface CanvasAttributes {
    lineWidth: number;
    lineCap: CanvasLineCap;
    lineJoin: CanvasLineJoin;
    miterLimit: number;
    lineDashOffset: number;
    font: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    direction: CanvasDirection;
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    globalAlpha: number;
    globalCompositeOperation: string;
    imageSmoothingEnabled: boolean;
    imageSmoothingQuality: ImageSmoothingQuality;
}
