import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { PolygonService } from '@app/services/tools/polygon.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-polygon-attribute',
    templateUrl: './polygon-attribute.component.html',
    styleUrls: ['./polygon-attribute.component.scss'],
})
export class PolygonAttributeComponent {
    currentStyle: number;

    constructor(private polygonService: PolygonService, private undoRedoService: UndoRedoService) {
        this.currentStyle = this.polygonService.currentStyle;
    }

    sliderSizeChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.polygonService.onSizeChange(event.value);
        }
    }

    selectStyle(styleNumber: number): void {
        this.polygonService.currentStyle = styleNumber;
        this.currentStyle = this.polygonService.currentStyle;
    }

    sliderEdgesAmount(event: MatSliderChange): void {
        if (event.value !== null) {
            this.polygonService.onEdgesChange(event.value);
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
