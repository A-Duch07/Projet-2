import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';

@Component({
    selector: 'app-grid-attribute',
    templateUrl: './grid-attribute.component.html',
    styleUrls: ['./grid-attribute.component.scss'],
})
export class GridAttributeComponent {
    constructor(private gridService: GridService, private drawingService: DrawingService) {}

    getGridService(): GridService {
        return this.gridService;
    }

    sizeChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.gridService.onSizeChange(event.value);
        }
    }

    opacityChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.gridService.onOpacityChange(event.value);
        }
    }

    drawGrid(): void {
        this.gridService.drawLine(this.drawingService.gridCtx);
        this.gridService.gridIsActive = true;
    }

    cleanGrid(): void {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
        this.gridService.gridIsActive = false;
    }
}
