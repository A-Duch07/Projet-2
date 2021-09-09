// REFERENCES : https://malcoded.com/posts/angular-color-picker/

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import * as colorConstants from '@app/components/color-picker/color-constants';

@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
})
export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

    @Output() color: EventEmitter<string> = new EventEmitter();

    private ctx: CanvasRenderingContext2D;
    private mouseDown: boolean = false;
    private selectedHeight: number;

    ngAfterViewInit(): void {
        this.draw();
    }

    draw(): void {
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        }

        const width: number = this.canvas.nativeElement.width;
        const height: number = this.canvas.nativeElement.height;

        this.ctx.clearRect(0, 0, width, height);

        const gradient: CanvasGradient = this.ctx.createLinearGradient(0, 0, 0, height);

        gradient.addColorStop(0, colorConstants.RED_COLOR_RGBA);
        gradient.addColorStop(colorConstants.YELLOW_COLOR_STOP, colorConstants.YELLOW_COLOR_RGBA);
        gradient.addColorStop(colorConstants.GREEN_COLOR_STOP, colorConstants.GREEN_COLOR_RGBA);
        gradient.addColorStop(colorConstants.CYAN_COLOR_STOP, colorConstants.CYAN_COLOR_RGBA);
        gradient.addColorStop(colorConstants.BLUE_COLOR_STOP, colorConstants.BLUE_COLOR_RGBA);
        gradient.addColorStop(colorConstants.PINK_COLOR_STOP, colorConstants.PINK_COLOR_RGBA);
        gradient.addColorStop(1, colorConstants.RED_COLOR_RGBA);

        this.ctx.beginPath();
        this.ctx.rect(0, 0, width, height);

        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.closePath();

        if (this.selectedHeight) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = colorConstants.STROKE_FILL_STYLE;
            this.ctx.lineWidth = colorConstants.LINE_WIDTH;
            this.ctx.rect(0, this.selectedHeight - colorConstants.LINE_WIDTH, width, colorConstants.LINE_WIDTH * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    emitColor(x: number, y: number): void {
        const rgbaColor = this.getColorAtPosition(x, y);
        this.color.emit(rgbaColor);
    }

    getColorAtPosition(x: number, y: number): string {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        this.selectedHeight = event.offsetY;
        this.draw();
        this.emitColor(event.offsetX, event.offsetY);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.selectedHeight = event.offsetY;
            this.draw();
            this.emitColor(event.offsetX, event.offsetY);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
    }
}
