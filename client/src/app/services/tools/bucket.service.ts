import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { Queue } from '@app/classes/queue';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as bucketConstants from '@app/services/tools/tools-constants/bucket-service-constans';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ColorService } from './color.service';

@Injectable({
    providedIn: 'root',
})
export class BucketService extends Tool {
    private positionsQueue: Queue<number>;
    private coordinatesQueue: Queue<Vec2>;
    private imageData: ImageData;
    private color: number[];
    private newColor: number[];
    private visitedPixels: boolean[];
    tolerance: number;

    constructor(
        drawingService: DrawingService,
        private undoRedoService: UndoRedoService,
        private bucketMessengerService: BucketMessengerService,
        private colorService: ColorService,
    ) {
        super(drawingService);
        this.positionsQueue = new Queue<number>();
        this.coordinatesQueue = new Queue<Vec2>();
        this.color = [];
        this.visitedPixels = [];
        this.newColor = this.colorService.bucketColor;
        // Issue relatif a une nouvelle version de TypeScript, comme on peut le voir ici : https://github.com/microsoft/TypeScript/issues/43053
        // Issue relativement recent que je ne recontrais pas au sprint 1, donc je disable la deprecation comme ca semble etre une erreur du cote
        // de typescript
        // tslint:disable-next-line: deprecation
        this.bucketMessengerService.receiveBucketColor().subscribe((color: number[]) => {
            this.newColor = color;
        });
        this.tolerance = 0;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        if (event.buttons === MouseButton.Left) {
            this.floodFill();
        } else if (event.buttons === MouseButton.Right) {
            this.fillAll();
        }

        this.undoRedoService.saveCurrentState(
            this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.baseCtx.canvas.height),
        );
    }

    private getPosition(x: number, y: number, width: number): number {
        return (y * width + x) * bucketConstants.BYTES_PER_RGBA;
    }

    private getColorAtPosition(position: number): number[] {
        return [
            this.imageData.data[position],
            this.imageData.data[position + bucketConstants.GREEN_INCREMENT],
            this.imageData.data[position + bucketConstants.BLUE_INCREMENT],
            this.imageData.data[position + bucketConstants.ALPHA_INCREMENT],
        ];
    }

    private verifyColor(colorToVerify: number[]): boolean {
        for (let i = 0; i < this.color.length; i++) {
            const minColor = this.color[i] - this.tolerance > 0 ? this.color[i] - this.tolerance : 0;
            const maxColor =
                this.color[i] + this.tolerance < bucketConstants.MAX_RGBA_VALUE ? this.color[i] + this.tolerance : bucketConstants.MAX_RGBA_VALUE;
            if (colorToVerify[i] < minColor || colorToVerify[i] > maxColor) {
                return false;
            }
        }
        return true;
    }

    private modifyColor(position: number): void {
        for (let i = 0; i < bucketConstants.BYTES_PER_RGBA; i++) {
            this.imageData.data[position + i] = this.newColor[i];
        }
    }

    private fillAll(): void {
        this.imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);

        const initialPosition: number = this.getPosition(this.mouseDownCoord.x, this.mouseDownCoord.y, this.drawingService.canvas.width);

        this.color = this.getColorAtPosition(initialPosition);
        for (let i = 0; i < this.imageData.data.length; i = i + bucketConstants.BYTES_PER_RGBA) {
            const currentColor: number[] = this.getColorAtPosition(i);
            if (this.verifyColor(currentColor)) {
                this.modifyColor(i);
            }
        }

        this.drawingService.baseCtx.putImageData(this.imageData, 0, 0);
    }

    private floodFill(): void {
        this.imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);

        this.visitedPixels.fill(false, 0, this.imageData.data.length);

        const initialPosition: number = this.getPosition(this.mouseDownCoord.x, this.mouseDownCoord.y, this.drawingService.canvas.width);

        this.color = this.getColorAtPosition(initialPosition);

        this.positionsQueue.enqueue(initialPosition);
        this.coordinatesQueue.enqueue(this.mouseDownCoord);
        this.visitedPixels[initialPosition] = true;

        while (!this.positionsQueue.isEmpty()) {
            const currentPosition: number | null = this.positionsQueue.dequeue();
            const currentCoordinates: Vec2 | null = this.coordinatesQueue.dequeue();
            if (currentPosition && currentCoordinates) {
                this.visitedPixels[currentPosition] = true;
                this.modifyColor(currentPosition);

                this.verifySurroundingPositions(currentPosition, currentCoordinates.x, currentCoordinates.y);
            }
        }

        this.drawingService.baseCtx.putImageData(this.imageData, 0, 0);
    }

    private verifySurroundingPositions(position: number, x: number, y: number): void {
        const width: number = this.drawingService.canvas.width;
        const coordinates: Vec2[] = [
            { x: x + 1, y },
            { x: x - 1, y },
            { x, y: y + 1 },
            { x, y: y - 1 },
        ];
        const positionsToVerify: number[] = [
            this.getPosition(x + 1, y, width),
            this.getPosition(x - 1, y, width),
            this.getPosition(x, y + 1, width),
            this.getPosition(x, y - 1, width),
        ];

        for (let i = 0; i < positionsToVerify.length; i++) {
            if (positionsToVerify[i] > 0 && positionsToVerify[i] < this.imageData.data.length) {
                const currentColor: number[] = this.getColorAtPosition(positionsToVerify[i]);

                if (!this.visitedPixels[positionsToVerify[i]] && this.verifyColor(currentColor)) {
                    this.positionsQueue.enqueue(positionsToVerify[i]);
                    this.coordinatesQueue.enqueue(coordinates[i]);
                    this.visitedPixels[positionsToVerify[i]] = true;
                }
            }
        }
    }
}
