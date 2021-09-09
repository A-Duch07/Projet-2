import { Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/drawing/selection-service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-selection-lasso-attribute',
    templateUrl: './selection-lasso-attribute.component.html',
    styleUrls: ['./selection-lasso-attribute.component.scss'],
})
export class SelectionLassoAttributeComponent {
    anchor: number;
    toggle: boolean = false;
    constructor(
        private drawingService: DrawingService,
        private selectionService: SelectionService,
        private undoRedoService: UndoRedoService,
        private magnetismService: MagnetismService,
    ) {}

    copy(): void {
        const event = new KeyboardEvent('keydown', {
            key: 'c',
            ctrlKey: true,
        });
        this.selectionService.onKeyDown(event);
    }

    paste(): void {
        const event = new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: true,
        });
        this.selectionService.onKeyDown(event);
    }

    cut(): void {
        const event = new KeyboardEvent('keydown', {
            key: 'x',
            ctrlKey: true,
        });
        this.selectionService.onKeyDown(event);
    }

    delete(): void {
        const event = new KeyboardEvent('keydown', {
            key: 'Delete',
            ctrlKey: true,
        });
        this.selectionService.onKeyDown(event);
    }

    get noSelection(): boolean {
        return !this.drawingService.imageSelected;
    }

    get noClipboard(): boolean {
        return !this.drawingService.clipboardFull;
    }

    onCornerChange(event: MatSelectChange): void {
        if (event.value != null) {
            this.magnetismService.anchor = event.value;
            this.anchor = event.value;
        }
    }

    onMagnetismChange(): void {
        this.toggle = !this.toggle;
        if (this.toggle) {
            this.magnetismService.isAnchored = true;
        } else {
            this.magnetismService.isAnchored = false;
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
