// REFERENCES : https://malcoded.com/posts/angular-color-picker/

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppMaterialModule } from '@app/app-material.module';
import { ColorPaletteComponent } from './color-palette/color-palette.component';
import { ColorPickerComponent } from './color-picker.component';
import { ColorSliderComponent } from './color-slider/color-slider.component';

@NgModule({
    declarations: [ColorPickerComponent, ColorSliderComponent, ColorPaletteComponent],
    imports: [CommonModule, AppMaterialModule, FormsModule],
    exports: [ColorPickerComponent],
})
export class ColorPickerModule {}
