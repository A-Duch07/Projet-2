import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { EllipseService } from '@app/services/tools/ellipse.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-ellipse-attribute',
    templateUrl: './ellipse-attribute.component.html',
    styleUrls: ['./ellipse-attribute.component.scss'],
})
export class EllipseAttributeComponent {
    currentStyle: number;

    constructor(private ellipseService: EllipseService, private undoRedoService: UndoRedoService) {
        this.currentStyle = ellipseService.currentStyle;
    }

    sliderChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.ellipseService.onSizeChange(event.value);
        }
    }

    selectStyle(styleNumber: number): void {
        this.ellipseService.currentStyle = styleNumber;
        this.currentStyle = this.ellipseService.currentStyle;
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
