import { Component } from '@angular/core';
// import { CheckboxControlValueAccessor } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { TexteService } from '@app/services/tools/texte.service';
import { ColorService } from '@app/services/tools/color.service';

@Component({
    selector: 'app-texte-attribute',
    templateUrl: './texte-attribute.component.html',
    styleUrls: ['./texte-attribute.component.scss'],
})
export class TexteAttributeComponent {
    constructor(private texteService: TexteService, public colorService: ColorService) {
        this.texteService.currentStyle = this.texteService.currentStyle;
    }

    policeSelected: string = "";
    currentStyle: number;
    isBoldChecked: any;
    isItalicChecked: any;

    selectStyle(styleNumber: number): void {
        this.texteService.currentStyle = styleNumber;
        this.texteService.currentStyle = this.texteService.currentStyle;
    }

    policeHeightChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.texteService.onPoliceHeightChange(event.value);
        }
    }

    policeChange(event: any): void{
        this.texteService.onPoliceChange(event.target.value);
    }

    alignerChange(event: any): void{
        this.texteService.onAlignerChange(event.target.value);
    }

    boldChange($event: any): void{
        this.isBoldChecked = document.getElementById('bold');
        this.texteService.onBoldChange(this.isBoldChecked.checked);
    }

    italiqueChange($event: any): void{
        this.isItalicChecked = document.getElementById('italic');
        this.texteService.onItaliqueChange(this.isItalicChecked.checked);
    }
}
