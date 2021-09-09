import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-button';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as colorConstants from '@app/services/tools/tools-constants/color-service-constants';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    currentColor: number;
    mainColors: string[];
    previousColors: string[];
    bucketColor: number[];

    constructor(private drawingService: DrawingService, private bucketMessengerService: BucketMessengerService) {
        this.currentColor = colorConstants.MAIN_COLOR_POS;
        this.mainColors = [colorConstants.RGBA_BLACK, colorConstants.RGBA_BLACK];
        this.previousColors = new Array(colorConstants.PREVIOUS_COLORS_LENGTH).fill(colorConstants.RGBA_WHITE);
        this.bucketColor = colorConstants.RGBA_BUCKET_BLACK;
    }

    selectColor(currentColor: number): void {
        if (currentColor === colorConstants.MAIN_COLOR_POS || currentColor === colorConstants.SECONDARY_COLOR_POS) {
            this.currentColor = currentColor;
        }
    }

    onColorChange(color: string): void {
        this.mainColors[this.currentColor] = color;
        if (this.currentColor === colorConstants.MAIN_COLOR_POS) {
            this.bucketColor = this.convertToBucketColor(this.mainColors[colorConstants.MAIN_COLOR_POS]);
            this.bucketMessengerService.sendBucketColor(this.bucketColor);
        }
        this.previousColors.shift();
        this.previousColors.push(color);
    }

    setStrokingColor(): void {
        this.drawingService.baseCtx.strokeStyle = this.mainColors[colorConstants.MAIN_COLOR_POS];
        this.drawingService.previewCtx.strokeStyle = this.mainColors[colorConstants.MAIN_COLOR_POS];
        this.drawingService.baseCtx.fillStyle = this.mainColors[colorConstants.SECONDARY_COLOR_POS];
        this.drawingService.previewCtx.fillStyle = this.mainColors[colorConstants.SECONDARY_COLOR_POS];
    }

    setFillingColor(): void {
        this.drawingService.baseCtx.fillStyle = this.mainColors[colorConstants.MAIN_COLOR_POS];
        this.drawingService.previewCtx.fillStyle = this.mainColors[colorConstants.MAIN_COLOR_POS];
        this.drawingService.baseCtx.strokeStyle = this.mainColors[colorConstants.SECONDARY_COLOR_POS];
        this.drawingService.previewCtx.strokeStyle = this.mainColors[colorConstants.SECONDARY_COLOR_POS];
    }

    switchColors(): void {
        const tmp: string = this.mainColors[colorConstants.MAIN_COLOR_POS];
        this.mainColors[colorConstants.MAIN_COLOR_POS] = this.mainColors[colorConstants.SECONDARY_COLOR_POS];
        this.bucketColor = this.convertToBucketColor(this.mainColors[colorConstants.MAIN_COLOR_POS]);
        this.bucketMessengerService.sendBucketColor(this.bucketColor);
        this.mainColors[colorConstants.SECONDARY_COLOR_POS] = tmp;
    }

    previousColorSelection(event: MouseEvent, color: string): void {
        if (event.buttons === MouseButton.Left) {
            this.mainColors[colorConstants.MAIN_COLOR_POS] = color;
            this.bucketColor = this.convertToBucketColor(this.mainColors[colorConstants.MAIN_COLOR_POS]);
            this.bucketMessengerService.sendBucketColor(this.bucketColor);
        } else if (event.buttons === MouseButton.Right) {
            this.mainColors[colorConstants.SECONDARY_COLOR_POS] = color;
        }
    }

    private convertToBucketColor(color: string): number[] {
        const searchParamaterBeginning = '(';
        const searchParamaterEnd = ')';
        const startIndex: number = color.indexOf(searchParamaterBeginning);
        const endIndex: number = color.indexOf(searchParamaterEnd);
        const splitValue = ',';

        // Si on trouve la position du string rgba( dans le string color, on peut changer la couleur du bucket, sinon elle demeure inchange
        if (startIndex !== colorConstants.ERROR_VALUE_INDEX_OF && endIndex !== colorConstants.ERROR_VALUE_INDEX_OF) {
            const parsedString: string[] = color.slice(startIndex + 1, endIndex).split(splitValue);
            const newBucketColor: number[] = [];
            for (let i = 0; i < parsedString.length; i++) {
                i !== colorConstants.ALPHA_POSITION
                    ? newBucketColor.push(parseInt(parsedString[i], 10))
                    : newBucketColor.push(Math.round(parseInt(parsedString[i], 10) * colorConstants.MAX_RGBA_VALUE));
            }
            return newBucketColor;
        }
        return this.bucketColor;
    }
}
