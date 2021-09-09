import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColorPickerComponent } from '@app/components/color-picker/color-picker.component';
import { ColorService } from '@app/services/tools/color.service';

@Component({
    selector: 'app-color-attribute',
    templateUrl: './color-attribute.component.html',
    styleUrls: ['./color-attribute.component.scss'],
})
export class ColorAttributeComponent {
    currentColor: number;
    constructor(public dialog: MatDialog, public colorService: ColorService) {
        this.currentColor = this.colorService.currentColor;
    }

    openDialog(): void {
        this.dialog.open(ColorPickerComponent);
    }

    switchColors(): void {
        this.colorService.switchColors();
    }

    selectColor(currentColor: number): void {
        this.colorService.selectColor(currentColor);
        this.currentColor = this.colorService.currentColor;
        this.openDialog();
    }

    previousColorSelection(event: MouseEvent, color: string): void {
        this.colorService.previousColorSelection(event, color);
    }
}
