import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarousselComponent } from '@app/components/caroussel/caroussel.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as mainPageConstants from './main-page-constants';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    readonly title: string = 'LOG2990';

    constructor(public dialog: MatDialog, private drawingService: DrawingService) {}

    continueButton: boolean;

    ngOnInit(): void {
        if (this.drawingService.myStorage.getItem('customDrawing')) {
            this.drawingService.convertB64ToImage();
            this.drawingService.continueDrawing = true;
            this.continueButton = this.drawingService.continueDrawing;
        }
    }

    openDialog(): void {
        this.dialog.open(CarousselComponent, { height: mainPageConstants.HEIGHT, width: mainPageConstants.WIDTH });
    }

    newDrawing(): void {
        this.drawingService.savedDrawing = false;
        this.drawingService.newDrawing = true;
    }
}
