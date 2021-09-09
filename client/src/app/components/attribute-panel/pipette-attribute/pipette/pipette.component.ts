import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PipetteService } from '@app/services/tools/pipette.service';

export const DEFAULT_WIDTH = 50;
export const DEFAULT_HEIGHT = 50;

@Component({
    selector: 'pipette-component',
    templateUrl: './pipette.component.html',
    styleUrls: ['./pipette.component.scss'],
})
export class PipetteComponent implements AfterViewInit {
    @ViewChild('cercleCanvas', { static: false }) cercleCanvas: ElementRef<HTMLCanvasElement>;

    constructor(private pipetteService: PipetteService) {}

    ngAfterViewInit(): void {
        this.pipetteService.canvas = this.cercleCanvas.nativeElement;
        this.pipetteService.ctx = this.cercleCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }
}
