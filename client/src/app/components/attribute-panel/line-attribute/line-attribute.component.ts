import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { LineService } from '@app/services/tools/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-line-attribute',
    templateUrl: './line-attribute.component.html',
    styleUrls: ['./line-attribute.component.scss'],
})
export class LineAttributeComponent {
    constructor(private lineService: LineService, private undoRedoService: UndoRedoService) {}
    toggle: boolean = false;

    getUndoRedoService(): UndoRedoService {
        return this.undoRedoService;
    }

    sliderChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.lineService.onSizeChange(event.value);
        }
    }

    sliderJunctionChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.lineService.onJunctionSizeChange(event.value);
        }
    }

    junctionChange(): void {
        this.toggle = !this.toggle;
        if (this.toggle) {
            // tslint:disable-next-line: no-string-literal
            this.lineService['isDrawingJunction'] = true;
        } else {
            // tslint:disable-next-line: no-string-literal
            this.lineService['isDrawingJunction'] = false;
        }
    }

    undo(): void {
        this.undoRedoService.undo();
    }

    redo(): void {
        this.undoRedoService.redo();
    }
}
