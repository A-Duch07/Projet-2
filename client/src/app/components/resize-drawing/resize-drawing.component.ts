// Source: https://dev.to/zchtodd/creating-a-resizable-draggable-component-in-angular2-9cl
import { Component, HostListener, OnInit } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import * as resizeDrawingConstants from './resize-drawing-constants';

@Component({
    selector: 'app-resize-drawing',
    templateUrl: './resize-drawing.component.html',
    styleUrls: ['./resize-drawing.component.scss'],
})
export class ResizeDrawingComponent implements OnInit {
    canvasDimensions: number[];
    resizing: boolean;
    width: number;
    height: number;
    private clickX: number;
    private clickY: number;

    resizeStrategy: (offsetX: number, offsetY: number) => void;

    constructor(private drawingService: DrawingService, private undoRedoService: UndoRedoService) {}

    ngOnInit(): void {
        if (!this.drawingService.savedDrawing) {
            this.width = (window.innerWidth - resizeDrawingConstants.SIDEBAR_SIZE) / 2;
            this.height = window.innerHeight / 2;
        } else {
            this.width = this.drawingService.canvas.width;
            this.height = this.drawingService.canvas.height;
        }
        this.canvasDimensions = [this.width, this.height];
    }

    bottomRightResize(offsetX: number, offsetY: number): void {
        this.width += offsetX;
        this.height += offsetY;
    }

    bottomMiddleResize(offsetX: number, offsetY: number): void {
        this.height += offsetY;
    }

    rightMiddleResize(offsetX: number, offsetY: number): void {
        this.width += offsetX;
    }

    edgeClick(event: MouseEvent, resizeStrategy: (offsetX: number, offsetY: number) => void): void {
        this.resizing = true;
        this.clickX = event.clientX;
        this.clickY = event.clientY;
        this.resizeStrategy = resizeStrategy;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'z':
                if (event.ctrlKey && this.undoRedoService.modifications.length > 1) {
                    this.width = this.undoRedoService.modifications[this.undoRedoService.modifications.length - 2].width;
                    this.height = this.undoRedoService.modifications[this.undoRedoService.modifications.length - 2].height;
                }
                break;
            case 'Z':
                if (event.ctrlKey && event.shiftKey && this.undoRedoService.undos.length >= 1) {
                    this.width = this.undoRedoService.undos[this.undoRedoService.undos.length - 1].width;
                    this.height = this.undoRedoService.undos[this.undoRedoService.undos.length - 1].height;
                }
                break;
            default:
        }
    }

    @HostListener('mousemove', ['$event'])
    edgeMove(event: MouseEvent): void {
        if (this.resizing === true) {
            let offsetX = event.clientX - this.clickX;
            let offsetY = event.clientY - this.clickY;

            const maxWidth = window.innerWidth - resizeDrawingConstants.SIDEBAR_SIZE - resizeDrawingConstants.MIN_WORKINGSPACE;
            const maxHeight = window.innerHeight - resizeDrawingConstants.MIN_WORKINGSPACE;

            if (this.width + offsetX < resizeDrawingConstants.MIN_WIDTH || this.width + offsetX > maxWidth) offsetX = 0;
            if (this.height + offsetY < resizeDrawingConstants.MIN_HEIGHT || this.height + offsetY > maxHeight) offsetY = 0;

            this.resizeStrategy(offsetX, offsetY);

            this.clickX = event.clientX;
            this.clickY = event.clientY;
        }
    }

    @HostListener('mouseup', ['$event'])
    edgeRelease(event: MouseEvent): void {
        if (this.resizing === true) {
            this.canvasDimensions = [this.width, this.height];
            this.resizing = false;
            this.undoRedoService.saveCurrentState(this.drawingService.baseCtx.getImageData(0, 0, this.width, this.height));
        }
    }
}
