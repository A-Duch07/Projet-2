import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { StampInformation } from '@app/classes/stamp-information';
import { STAMP } from '@app/classes/stamp-list';
import { EtampeService } from '@app/services/tools/etampe.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-etampe-attribute',
    templateUrl: './etampe-attribute.component.html',
    styleUrls: ['./etampe-attribute.component.scss'],
})
export class EtampeAttributeComponent {
    stamp: StampInformation[] = STAMP;
    selectedStamp: StampInformation = this.stamp[0];
    size: number = 10;
    fileFormat: string;
    fileName: string;
    stampPosition: number;

    constructor(private etampeService: EtampeService, private undoRedoService: UndoRedoService) {
        // this.etampeService.currentStyle = this.etampeService.currentStyle;
    }

    stampChange(event: any): void {
        this.selectedStamp = this.stamp[+event.target.value];
        this.etampeService.onStampChange(this.selectedStamp);
    }

    angleChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.etampeService.onAngleChange(event.value);
        }
    }

    miseAEchelleChange(event: MatSliderChange): void {
        if (event.value !== null) {
            this.etampeService.onMiseAEchelleChange(event.value);
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
