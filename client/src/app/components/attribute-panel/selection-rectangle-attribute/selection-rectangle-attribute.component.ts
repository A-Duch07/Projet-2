import { Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/drawing/selection-service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';
import { SelectionRectangleService } from '@app/services/tools/selection-rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-selection-rectangle-attribute',
    templateUrl: './selection-rectangle-attribute.component.html',
    styleUrls: ['./selection-rectangle-attribute.component.scss'],
})
export class SelectionRectangleAttributeComponent {
    anchor: number;
    toggle: boolean = false;
    constructor(
        private selectionRectangleService: SelectionRectangleService,
        private undoRedoService: UndoRedoService,
        private magnetismService: MagnetismService,
        private drawingService: DrawingService,
        private selectionService: SelectionService,
    ) {}

    selectCanvas(): void {
        const event = new KeyboardEvent('keydown', {
            key: 'a',
            ctrlKey: true,
        });
        this.selectionRectangleService.onKeyDown(event);
    }

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

    getUndoRedoService(): UndoRedoService {
        return this.undoRedoService;
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

    undo(): void {
        this.undoRedoService.undo();
    }

    redo(): void {
        this.undoRedoService.redo();
    }
}
