import { HostListener, Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import * as pipetteConstants from './tools-constants/pipette-service-constants';

@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private currentMousePosition: Vec2;
    private pixel: Uint8ClampedArray;
    cercle: ImageData;
    private r: number;
    private g: number;
    private b: number;
    private a: number;
    private colorPicked: string;
    private mouseDownLeft: boolean;
    private mouseDownRight: boolean;

    constructor(drawingService: DrawingService, private colorService: ColorService) {
        super(drawingService);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.checkColor(this.drawingService.baseCtx);
        this.assignColor(event);
    }

    onMouseMove(event: MouseEvent): void {
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.lookCircle(this.drawingService.baseCtx);
    }

    private checkColor(ctx: CanvasRenderingContext2D): void {
        this.pixel = ctx.getImageData(this.currentMousePosition.x, this.currentMousePosition.y, 1, 1).data;
        this.r = this.pixel[0];
        this.g = this.pixel[1];
        this.b = this.pixel[2];
        this.a = this.pixel[3];
    }

    private assignColor(event: MouseEvent): void {
        this.mouseDownLeft = event.buttons === MouseButton.Left;
        this.mouseDownRight = event.buttons === MouseButton.Right;
        this.colorPicked = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';

        if (this.mouseDownRight) {
            this.colorService.mainColors[1] = this.colorPicked;
        } else if (this.mouseDownLeft) {
            this.colorService.mainColors[0] = this.colorPicked;
        }
    }

    private lookCircle(ctx: CanvasRenderingContext2D): void {
        this.cercle = ctx.getImageData(this.currentMousePosition.x, this.currentMousePosition.y, 150, 150);
        this.ctx.scale(pipetteConstants.SCALE_WIDTH, pipetteConstants.SCALE_HEIGHT);
        this.ctx.drawImage(
            this.drawingService.canvas,
            this.currentMousePosition.x - pipetteConstants.HALF_CLICK_PIXEL_WIDTH,
            this.currentMousePosition.y - pipetteConstants.HALF_CLICK_PIXEL_HEIGHT,
            1,
            1,
            0,
            0,
            this.canvas.width,
            this.canvas.height,
        );
    }
}
