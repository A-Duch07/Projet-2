import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { BucketService } from '@app/services/tools/bucket.service';
import * as bucketConstants from '@app/services/tools/tools-constants/bucket-service-constans';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-bucket-attribute',
    templateUrl: './bucket-attribute.component.html',
    styleUrls: ['./bucket-attribute.component.scss'],
})
export class BucketAttributeComponent {
    constructor(private bucketService: BucketService, private undoRedoService: UndoRedoService) {}

    sliderChange(event: MatSliderChange): void {
        if (event.value) this.bucketService.tolerance = Math.round((event.value / bucketConstants.TO_PERCENT) * bucketConstants.MAX_RGBA_VALUE);
    }

    getUndoRedoService(): UndoRedoService {
        return this.undoRedoService;
    }

    undo(): void {
        this.undoRedoService.undo();
    }

    redo(): void {
        this.undoRedoService.redo();
    }
}
