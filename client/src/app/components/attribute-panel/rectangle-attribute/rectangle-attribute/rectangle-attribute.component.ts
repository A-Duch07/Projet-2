import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ColorService } from '@app/services/tools/color.service';
import { RectangleService } from '@app/services/tools/rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-rectangle-attribute',
    templateUrl: './rectangle-attribute.component.html',
    styleUrls: ['./rectangle-attribute.component.scss'],
})
export class RectangleAttributeComponent {
    currentStyle: number;
    constructor(private rectangleService: RectangleService, public colorService: ColorService, private undoRedoService: UndoRedoService) {
        this.currentStyle = this.rectangleService.currentStyle;
    }

    sliderChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.rectangleService.onSizeChange(event.value);
        }
    }

    selectStyle(styleNumber: number): void {
        this.rectangleService.currentStyle = styleNumber;
        this.currentStyle = this.rectangleService.currentStyle;
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
