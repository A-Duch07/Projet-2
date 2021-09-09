// REFERENCES : https://malcoded.com/posts/angular-color-picker/

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import * as colorConstants from '@app/components/color-picker/color-constants';

@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {
    @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

    @Input() hue: string;

    @Input() alpha: string;

    @Output() color: EventEmitter<string> = new EventEmitter();

    private ctx: CanvasRenderingContext2D;
    private mouseDown: boolean;
    selectedPosition: Vec2;

    constructor() {
        this.alpha = '1';
        this.mouseDown = false;
    }

    ngAfterViewInit(): void {
        this.draw();
    }

    draw(): void {
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        }
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;

        this.ctx.fillStyle = this.hue || colorConstants.WHITE_COLOR_RGBA_FULL_OPCATIY;

        this.ctx.fillRect(0, 0, width, height);

        const whiteGrad = this.ctx.createLinearGradient(0, 0, width, 0);
        whiteGrad.addColorStop(0, colorConstants.WHITE_COLOR_RGBA_FULL_OPCATIY);
        whiteGrad.addColorStop(1, colorConstants.WHITE_COLOR_RGBA_NO_OPCATIY);

        this.ctx.fillStyle = whiteGrad;
        this.ctx.fillRect(0, 0, width, height);

        const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height);
        blackGrad.addColorStop(0, colorConstants.BLACK_COLOR_RGBA_NO_OPCATIY);
        blackGrad.addColorStop(1, colorConstants.BLACK_COLOR_RGBA_FULL_OPCATIY);

        this.ctx.fillStyle = blackGrad;
        this.ctx.fillRect(0, 0, width, height);

        if (this.selectedPosition) {
            this.ctx.strokeStyle = colorConstants.STROKE_FILL_STYLE;
            this.ctx.fillStyle = colorConstants.STROKE_FILL_STYLE;
            this.ctx.beginPath();
            this.ctx.arc(this.selectedPosition.x, this.selectedPosition.y, colorConstants.LINE_WIDTH * 2, 0, 2 * Math.PI);
            this.ctx.lineWidth = colorConstants.LINE_WIDTH;
            this.ctx.stroke();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hue && !changes.hue.isFirstChange()) {
            this.draw();
            if (this.selectedPosition) {
                this.emitColor(this.selectedPosition.x, this.selectedPosition.y);
            }
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        this.selectedPosition = { x: event.offsetX, y: event.offsetY };
        this.draw();
        this.emitColor(event.offsetX, event.offsetY);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.selectedPosition = { x: event.offsetX, y: event.offsetY };
            this.draw();
            this.emitColor(event.offsetX, event.offsetY);
        }
    }

    emitColor(x: number, y: number): void {
        const rgbaColor = this.getColorAtPosition(x, y);
        this.color.emit(rgbaColor);
    }

    getColorAtPosition(x: number, y: number): string {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',' + this.alpha + ')';
    }
}
