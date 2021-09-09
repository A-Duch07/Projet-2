import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { AerosolService } from '@app/services/tools/aerosol.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-aerosol-attribute',
    templateUrl: './aerosol-attribute.component.html',
    styleUrls: ['./aerosol-attribute.component.scss'],
})
export class AerosolAttributeComponent {
    constructor(private aerosolService: AerosolService, private undoRedoService: UndoRedoService) {}

    sliderChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.aerosolService.onSizeChange(event.value);
        }
    }

    emissionChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.aerosolService.onEmissionChange(event.value);
        }
    }

    gouteletteChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.aerosolService.onGouteletteChange(event.value);
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
