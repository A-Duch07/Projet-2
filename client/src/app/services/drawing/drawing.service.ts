import { Injectable } from '@angular/core';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { SaveCanvasAttributes } from '@app/classes/save-canvas-attributes';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    selectionCtx: CanvasRenderingContext2D;
    gridCtx: CanvasRenderingContext2D;
    clipboardCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
    selectionCanvas: HTMLCanvasElement;
    clipboardCanvas: HTMLCanvasElement;
    savedDrawing: boolean = false;
    continueDrawing: boolean = false;
    newDrawing: boolean = false;
    carouselOpened: boolean = false;
    firstDrawing: boolean = true;
    carouselDrawing: HTMLImageElement;
    imageSelected: boolean;
    localStorageDrawing: HTMLImageElement;
    myStorage: Storage = window.localStorage;
    private saveCanvasAttributes: SaveCanvasAttributes = new SaveCanvasAttributes();

    clipboardFull: boolean;
    clipboardReady: boolean;

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resizeExistingCanvas(newDimensions: number[]): void {
        // Sauvegarde les informations des canvas
        const SAVEDCTX: ImageData = this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.saveCanvasAttributes.save(this.baseCtx);
        this.saveCanvasAttributes.save(this.previewCtx);
        // Resize du baseCanvas et du previewCanvas
        this.canvas.width = newDimensions[0];
        this.canvas.height = newDimensions[1];
        this.gridCtx.canvas.width = newDimensions[0];
        this.gridCtx.canvas.height = newDimensions[1];
        this.previewCanvas.width = newDimensions[0];
        this.previewCanvas.height = newDimensions[1];

        // // Restore les informations des canvas
        this.fillCanvasWhite();
        this.baseCtx.putImageData(SAVEDCTX, 0, 0);
        this.saveCanvasAttributes.restore(this.baseCtx);
        this.saveCanvasAttributes.restore(this.previewCtx);
        this.selectionCtx.clearRect(0, 0, this.selectionCanvas.width, this.selectionCanvas.height);

        this.imageSelected = false;
    }

    fillCanvasWhite(): void {
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    printCarouselImage(): void {
        this.clearCanvas(this.baseCtx);
        this.baseCtx.drawImage(this.carouselDrawing, 0, 0);
    }

    saveDrawing(): void {
        this.continueDrawing = true;
        this.savedDrawing = true;
        this.newDrawing = false;
        // save to local storage
        const dataURL: string = this.canvas.toDataURL();
        this.myStorage.setItem('customDrawing', dataURL);
    }

    convertB64ToImage(): void {
        // put the drawing from local storage to variable
        const imageData: string = this.myStorage.getItem('customDrawing') as string;
        const printedImage = new Image();
        printedImage.src = imageData;
        this.localStorageDrawing = printedImage;
    }

    printDrawing(): void {
        this.baseCtx.drawImage(this.localStorageDrawing, 0, 0);
    }

    printCorrectDrawing(): void {
        if (this.newDrawing) {
            this.createNewDrawing();
            this.saveDrawing();
            this.fillCanvasWhite();
        } else {
            if (this.myStorage.getItem('customDrawing') === null) {
                this.fillCanvasWhite();
                this.saveDrawing();
            } else {
                this.firstDrawing = false;
                // put the drawing from local storage to variable
                this.convertB64ToImage();
                // set continueDrawing to true
                this.continueDrawing = true;
                this.fillCanvasWhite();
                // Print after convert
                this.printDrawing();
            }
        }
    }

    createNewDrawing(): void {
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
    }

    saveClipboard(resizeAttributes: ResizeAttributes): void {
        // //this.clipboardCanvas = this.canvas;
        this.clipboardCanvas.width = Math.abs(resizeAttributes.startingWidth);
        this.clipboardCanvas.height = Math.abs(resizeAttributes.startingHeight);

        // let originXAdjustment = 0;
        // if (resizeAttributes.width < 0) {
        //     originXAdjustment -= resizeAttributes.width;
        // }

        // let originYAdjustment = 0;
        // if (resizeAttributes.height < 0) {
        //     originYAdjustment -= resizeAttributes.height;
        // }
        let posX = 0;
        let posY = 0;

        this.clipboardCtx.save();
        if (resizeAttributes.flippedX && resizeAttributes.flippedY) {
            this.clipboardCtx.scale(-1, -1);
            posX = -Math.abs(resizeAttributes.width);
            posY = -Math.abs(resizeAttributes.height);
            // this.clipboardCtx.translate(resizeAttributes.startingWidth, resizeAttributes.startingHeight);
        } else if (resizeAttributes.flippedX && !resizeAttributes.flippedY) {
            this.clipboardCtx.scale(-1, 1);
            posX = -Math.abs(resizeAttributes.width);

            // this.clipboardCtx.translate(resizeAttributes.startingWidth, 0);
        } else if (!resizeAttributes.flippedX && resizeAttributes.flippedY) {
            this.clipboardCtx.scale(1, -1);
            posY = -Math.abs(resizeAttributes.height);

            // this.clipboardCtx.translate(0, resizeAttributes.startingHeight);
        }

        this.clipboardCtx.drawImage(
            this.canvas,
            resizeAttributes.startingX,
            resizeAttributes.startingY,
            resizeAttributes.startingWidth,
            resizeAttributes.startingHeight,
            posX,
            posY,
            Math.abs(resizeAttributes.width),
            Math.abs(resizeAttributes.height),
        );
        this.clipboardCtx.restore();
        this.clipboardFull = true;
        this.clipboardReady = false;
    }

    deleteClipboard(): void {
        this.clipboardCtx.fillRect(0, 0, this.clipboardCanvas.width, this.clipboardCanvas.height);
        this.clipboardFull = false;
        this.clipboardReady = false;
    }
}
