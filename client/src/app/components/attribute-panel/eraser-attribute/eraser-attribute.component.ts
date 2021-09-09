import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { EraserService } from '@app/services/tools/eraser.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-eraser-attribute',
    templateUrl: './eraser-attribute.component.html',
    styleUrls: ['./eraser-attribute.component.scss'],
})
export class EraserAttributeComponent {
    constructor(private eraserService: EraserService, private undoRedoService: UndoRedoService) {}

    sliderChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.eraserService.onSizeChange(event.value);
        }
    }

    inputChange(input: string): void {
        this.eraserService.onSizeChange(+input);
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
