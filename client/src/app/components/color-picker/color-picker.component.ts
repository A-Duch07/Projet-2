// REFERENCES : https://malcoded.com/posts/angular-color-picker/

import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ColorService } from '@app/services/tools/color.service';
import * as colorConstants from './color-constants';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent {
    hue: string;
    alpha: string;
    color: string;
    unsanitizedRgbValues: string[];
    private sanitizedRgbValues: string[];

    constructor(private colorService: ColorService) {
        this.alpha = '1';
        this.color = colorConstants.BLACK_COLOR_RGBA_FULL_OPCATIY;
        this.unsanitizedRgbValues = ['00', '00', '00'];
        this.sanitizedRgbValues = ['00', '00', '00'];
    }

    alphaChange(event: MatSliderChange): void {
        if (event.value) {
            this.alpha = event.value + '';
            this.color =
                'rgba(' +
                parseInt(this.sanitizedRgbValues[0], 16) +
                ',' +
                parseInt(this.sanitizedRgbValues[1], 16) +
                ',' +
                parseInt(this.sanitizedRgbValues[2], 16) +
                ',' +
                this.alpha +
                ')';
        }
    }

    colorChange(event: string): void {
        this.color = event;
        this.parseColor();
    }

    inputChange(input: string, id: number): void {
        this.unsanitizedRgbValues[id] = input;
        this.sanitizeInput();
        this.color =
            'rgba(' +
            parseInt(this.sanitizedRgbValues[0], 16) +
            ',' +
            parseInt(this.sanitizedRgbValues[1], 16) +
            ',' +
            parseInt(this.sanitizedRgbValues[2], 16) +
            ',' +
            this.alpha +
            ')';
    }

    selectColor(): void {
        this.colorService.onColorChange(this.color);
    }

    parseColor(): void {
        const paranthesis: RegExp = /(?<=\()(.*?)(?=\))/;
        const match: RegExpExecArray = paranthesis.exec(this.color) as RegExpExecArray;
        if (match) {
            const colorValues: string[] = match[0].split(',');
            for (let i = 0; i < colorValues.length - 1; i++) {
                this.unsanitizedRgbValues[i] = (+colorValues[i]).toString(16).toUpperCase();
            }
            this.sanitizeInput();
        }
    }

    sanitizeInput(): void {
        const hex: RegExp = /^[0-9a-fA-F]{2}$/;
        for (let i = 0; i < this.unsanitizedRgbValues.length; i++) {
            const tmp: string = this.unsanitizedRgbValues[i];
            if (hex.test(tmp)) {
                this.sanitizedRgbValues[i] = tmp;
            } else {
                this.unsanitizedRgbValues[i] = this.sanitizedRgbValues[i];
            }
        }
    }
}
