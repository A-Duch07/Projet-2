import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { PencilService } from '@app/services/tools/pencil.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-pencil-attribute',
    templateUrl: './pencil-attribute.component.html',
    styleUrls: ['./pencil-attribute.component.scss'],
})
export class PencilAttributeComponent {
    constructor(private pencilService: PencilService, private undoRedoService: UndoRedoService) {}

    sliderChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.pencilService.onSizeChange(event.value);
        }
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
